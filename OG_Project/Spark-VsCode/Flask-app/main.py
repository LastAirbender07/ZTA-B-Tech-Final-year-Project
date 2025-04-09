import os
import subprocess
import time
import json
import logging
import base64
import pandas as pd
from bson import ObjectId
from pymongo import MongoClient
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all routes, all origins, and support credentials
CORS(app, resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True, 
     methods=["GET", "POST", "OPTIONS"], 
     allow_headers=["Content-Type", "Authorization", "ngrok-skip-browser-warning"])

UPLOAD_FOLDER = "dataset"  # Static dataset folder
OUTPUT_FOLDER = "outputs"
MONGO_URI = "mongodb+srv://jayarajviswanathan:npNMhhNcW5hsEqMv@final-year-app.qldktus.mongodb.net/?appName=final-year-app"
MODEL_FOLDER = os.path.join(OUTPUT_FOLDER, "models")
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

DATASET_PATH = os.path.join(UPLOAD_FOLDER, "spam.csv")  # Static dataset file path

def simulated_progress():
    stages = [
        "Collecting data...",
        "Processing data...",
        "Loading data...",
        "Splitting data into train and test sets...",
        "Training models...",
        "Evaluating models...",
        "Choosing the best model...",
        "Saving results and models..."
    ]
    for stage in stages:
        print(stage)
        time.sleep(5)  # Simulate time delay for each step

@app.route('/train', methods=['GET'])
def train_model():
    print("Training model...")
    try:
        if not os.path.exists(DATASET_PATH):
            return jsonify({"error": f"Dataset file not found at {DATASET_PATH}"}), 400
        
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify({"error": "User ID not provided"}), 400
        
        output_dir = OUTPUT_FOLDER
        os.makedirs(output_dir, exist_ok=True)

        training_script = "training.py"  # Path to training.py
        command = ["python", training_script, "--dataset", DATASET_PATH, "--output", output_dir]

        print("Training process initiated...")
        simulated_progress()

        process = subprocess.run(command, capture_output=True, text=True)
        logging.info(f"Training process stdout: {process.stdout}")
        logging.error(f"Training process stderr: {process.stderr}")

        if process.returncode != 0:
            return jsonify({"error": "Training script failed", "details": process.stderr}), 500
        
        update_model_stats(output_dir, user_id)
        
        # Parse Spark UI URL from training script output
        output_lines = process.stdout.split("\n")
        spark_ui_url = None
        for line in output_lines:
            if line.startswith("Spark UI URL:"):
                spark_ui_url = line.split(":", 1)[1].strip()

        return jsonify({
            "message": "Training completed successfully",
            "spark_ui_url": spark_ui_url,
            "results": os.path.join(output_dir, "results.json"),
            "response": process.stdout
        }), 200

    except Exception as e:
        logging.error(f"Unexpected error during training: {str(e)}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

def update_model_stats(output_dir, user_id):
    client = MongoClient(MONGO_URI)
    mongo = client.get_database('zero-trust')
    transactions = mongo.get_collection('transactions')
    
    try:
        user_object_id = ObjectId(user_id)
    except Exception as e:
        logging.error(f"Invalid user_id format: {user_id}. Error: {str(e)}")
        return

    model_stats = {}

    for algo_name in os.listdir(output_dir):
        algo_path = os.path.join(output_dir, algo_name)

        # Skip directories with "model" in their name and immediate files in output_dir
        if "model" in algo_name or not os.path.isdir(algo_path):
            continue

        algo_images = {}
        for item in os.listdir(algo_path):
            item_path = os.path.join(algo_path, item)
            if os.path.isfile(item_path):  # Only process image files
                with open(item_path, "rb") as img_file:
                    encoded_image = base64.b64encode(img_file.read()).decode('utf-8')
                    algo_images[item] = encoded_image

        model_stats[algo_name] = algo_images
        
    # add last updated date & time (not for each algo but for the whole model stats)
    model_stats["last_updated"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        
    # Update MongoDB
    logging.info(f"Updating MongoDB for userId: {user_object_id}")
    result = transactions.update_one(
        {"userId": user_object_id},  # Query using ObjectId
        {"$set": {"Model Stats": model_stats}}
    )

    logging.info(f"Update result: {result.raw_result}")
    if result.modified_count == 0:
        logging.warning(f"No document found for userId: {user_object_id}")
    else:
        logging.info(f"Model Stats updated for userId {user_object_id}")
        
@app.route('/update-dataset', methods=['POST'])
def update_dataset():
    try:
        # Get the new data from the request
        input_data = request.json
            
        if not input_data or "messages" not in input_data or "label" not in input_data:
            return jsonify({"error": "Invalid data format. 'messages' and 'label' are required."}), 400

        messages = input_data["messages"]
        labels = input_data["label"]
        
        # print(messages)
        # print(labels)
        # Validate data types
        if not isinstance(messages, list) or not isinstance(labels, list):
            return jsonify({"error": "Both 'messages' and 'label' must be arrays."}), 400

        
        # Ensure that messages and labels have the same length
        if len(messages) != len(labels):
            return jsonify({"error": "Messages and labels length do not match."}), 400
        
        # Load existing dataset
        if os.path.exists(DATASET_PATH):
            dataset = pd.read_csv(DATASET_PATH)
        else:
            dataset = pd.DataFrame(columns=["res", "message"])

        # Append new data to the dataset
        new_data = pd.DataFrame({"res": labels, "message": messages})
        dataset = pd.concat([dataset, new_data], ignore_index=True)

        # Shuffle the dataset rows
        dataset = dataset.sample(frac=1).reset_index(drop=True)

        # Save the updated dataset back to CSV
        dataset.to_csv(DATASET_PATH, index=False)

        return jsonify({"message": "Dataset updated and reshuffled successfully."}), 200

    except Exception as e:
        app.logger.error(f"Error updating dataset: {str(e)}")
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict_messages():
    print("\n\nHI Inside predict lables!!\n\n")
    try:
        # Check if models directory exists
        if not os.path.exists(MODEL_FOLDER):
            return jsonify({"error": "Models not found. Please train the models first."}), 400

        # Get input messages from the request
        input_data = request.json
        if not input_data or "messages" not in input_data:
            return jsonify({"error": "No messages provided for prediction."}), 400

        messages = input_data["messages"]
        print("Messages:", messages[0])

        if not isinstance(messages, list) or not messages:
            return jsonify({"error": "Messages should be a non-empty list."}), 400
        
        # #Validate that each message in the list has an 'id' and 'message'
        for msg in messages:
            if not isinstance(msg, dict) or 'id' not in msg or 'message' not in msg:
                return jsonify({"error": "Each message must have an 'id' and 'message'."}), 400

        predict_script = "predict.py"  # Path to predict.py
        messages_texts = [msg['message'].replace('\n', ' ') for msg in messages] 
        
        # print("Messages:", messages_texts)
        
        command = ["python", predict_script, "--messages"] + messages_texts + ["--models_dir", MODEL_FOLDER, "--output_dir", OUTPUT_FOLDER]

        # Run the prediction script
        process = subprocess.run(command, capture_output=True, text=True)

        if process.returncode != 0:
            return jsonify({"error": "Prediction script failed", "details": process.stderr}), 500

        # Load predictions from the output JSON file
        predictions_path = os.path.join(OUTPUT_FOLDER, "predictions.json")
        if not os.path.exists(predictions_path):
            return jsonify({"error": "Predictions file not found."}), 500

        with open(predictions_path, "r") as f:
            predictions = json.load(f)  # Load predictions as a dictionary

        predictions_result = {}
        for msg in messages:
            message_text = msg['message'].replace('\n', ' ')
            message_id = msg['id']

            # Get the prediction for this message, if it exists
            model_predictions = predictions.get(message_text, {})
            
            print("Model Predictions:", model_predictions)

            # Calculate the label based on model predictions
            if model_predictions:
                num_spam_predictions = sum(1 for pred in model_predictions.values() if pred == 0)
                label = "spam" if num_spam_predictions >= 2 else "ham"
            else:
                label = None  # In case no prediction exists for the message
            print("Label:", label)

            predictions_result[message_id] = {"label": label, "message": msg['message']}

        return jsonify({"message": "Predictions completed successfully", "predictions": predictions_result}), 200

    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "OK", "message": "Server is running"}), 200

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
