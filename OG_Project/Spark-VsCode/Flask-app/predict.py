import argparse
import os
import numpy as np
import json
import shutil
from pyspark.sql import SparkSession
from pyspark.ml.feature import Tokenizer, HashingTF, IDFModel
import xgboost as xgb
from pyspark.ml.classification import LogisticRegressionModel, RandomForestClassificationModel, NaiveBayesModel, GBTClassificationModel, LinearSVCModel
from pyspark.ml.evaluation import MulticlassClassificationEvaluator

def load_models(models_dir):
    models = {}
    for model_name in os.listdir(models_dir):
        model_path = os.path.join(models_dir, model_name)
        if model_name.endswith(".json"):  # XGBoost model in JSON format
            xgb_model = xgb.Booster()
            xgb_model.load_model(model_path)
            models["XGBoost"] = xgb_model
            
        elif os.path.isdir(model_path):  # Check if it's a model directory
            if "LogisticRegression" in model_name:
                models["LogisticRegression"] = LogisticRegressionModel.load(model_path)
            elif "RandomForest" in model_name:
                models["RandomForest"] = RandomForestClassificationModel.load(model_path)
            elif "NaiveBayes" in model_name:
                models["NaiveBayes"] = NaiveBayesModel.load(model_path)
            elif "GBTClassifier" in model_name:
                models["GBTClassifier"] = GBTClassificationModel.load(model_path)
            elif "LinearSVC" in model_name:
                models["LinearSVC"] = LinearSVCModel.load(model_path) 
                
        else:
                print(f"Unknown model type in {model_name}")
    
    return models

def preprocess_input(messages, spark, output_dir):
    # Convert messages to Spark DataFrame
    data = spark.createDataFrame([(msg,) for msg in messages], ["message"])

    # Tokenize messages
    tokenizer = Tokenizer(inputCol="message", outputCol="words")
    data = tokenizer.transform(data)

    # HashingTF
    hashingTF = HashingTF(inputCol="words", outputCol="rawFeatures", numFeatures=100)
    data = hashingTF.transform(data)

    idf_path = os.path.join(output_dir, "idf_model")
    idf_model = IDFModel.load(idf_path)
    data = idf_model.transform(data)

    return data

def predict_with_xgboost(xgb_model, features):
    xgb_data = xgb.DMatrix(features)
    predictions = xgb_model.predict(xgb_data)
    return predictions

def predict_with_pyspark_model(model, data):
    predictions = model.transform(data)
    return predictions

def main(messages, models_dir, output_dir):
    try:
        # Initialize Spark session
        spark = SparkSession.builder.appName("FraudDetection_Prediction").getOrCreate()

        # Load models
        models = load_models(models_dir)

        # Preprocess input messages
        preprocessed_data = preprocess_input(messages, spark, output_dir)

        # Extract features for XGBoost
        features = np.array(preprocessed_data.select("features").rdd.map(lambda row: row["features"].toArray()).collect())

        # Prepare the result dictionary
        results = {}

        # Predict with each model
        for model_name, model in models.items():
            if model_name == "XGBoost":
                predictions = predict_with_xgboost(model, features)
                predictions = [1 if pred > 0.5 else 0 for pred in predictions]  # Apply threshold for classification
            else:
                pred_data = predict_with_pyspark_model(model, preprocessed_data)
                predictions = pred_data.select("prediction").rdd.map(lambda row: row["prediction"]).collect()
                predictions = [int(pred) for pred in predictions]

            results[model_name] = predictions

        # Compile results
        result_dict = {}
        for i, message in enumerate(messages):
            result_dict[message] = {model_name: int(results[model_name][i]) for model_name in models}

        # Save results to JSON
        results_path = os.path.join(output_dir, "predictions.json")
        with open(results_path, "w") as f:
            json.dump(result_dict, f, indent=4)

        print("Predictions:")
        print(json.dumps(result_dict, indent=4))

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--messages", required=True, nargs="+", help="List of text messages for classification")
    parser.add_argument("--models_dir", required=True, help="Path to the directory containing the top 3 models")
    parser.add_argument("--output_dir", required=True, help="Directory to save predictions")
    args = parser.parse_args()

    main(args.messages, args.models_dir, args.output_dir)