import argparse
import os
import numpy as np
import shutil
import matplotlib.pyplot as plt
import seaborn as sns
from pyspark.sql import SparkSession
from pyspark.ml.feature import Tokenizer, HashingTF, IDF, StringIndexer
from pyspark.ml.classification import (
    LogisticRegression, RandomForestClassifier, GBTClassifier, NaiveBayes, LinearSVC
)
from pyspark.ml.evaluation import MulticlassClassificationEvaluator
from sklearn.metrics import roc_auc_score, confusion_matrix, f1_score, roc_curve
import xgboost as xgb
import json

def main(dataset_path, output_dir):
    try:
        # Initialize Spark session with Spark UI enabled
        spark = SparkSession.builder.appName("FraudDetection_MultiModels").getOrCreate()
        spark_ui_url = spark.sparkContext.uiWebUrl
        print(f"Spark UI URL: {spark_ui_url}")

        # Load Dataset
        data = spark.read.csv(dataset_path, header=True, inferSchema=True)

        # Preprocessing
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs("outputs/visualizations", exist_ok=True)
        
        # Visualize class distribution
        class_distribution = data.groupBy("res").count().toPandas()
        sns.barplot(x="res", y="count", data=class_distribution, palette="viridis")
        plt.title("Class Distribution")
        plt.xlabel("Class (Spam/Non-Spam)")
        plt.ylabel("Count")

        # Add count labels on top of each bar
        for p in plt.gca().patches:
            plt.annotate(f'{p.get_height()}', (p.get_x() + p.get_width() / 2., p.get_height()), 
                        ha='center', va='center', xytext=(0, 5), 
                        textcoords='offset points')

        plt.savefig(os.path.join("outputs/visualizations", "class_distribution.png"))
        plt.close()
        
        # Get counts for each class
        counts = class_distribution['count'].values
        labels = class_distribution['res'].values

        # Create a pie chart
        plt.figure(figsize=(6, 6))
        plt.pie(counts, labels=labels, autopct='%1.1f%%', startangle=90)
        plt.title("Class Distribution")
        plt.axis('equal')  
        
        for i, label in enumerate(labels):
            plt.text(x=0, y=0, s=f'{counts[i]}', ha='center', va='center', transform=plt.gca().transAxes) 

        plt.savefig(os.path.join("outputs/visualizations", "class_distribution_pie.png"))
        plt.close()

        indexer = StringIndexer(inputCol="res", outputCol="label")
        data = indexer.fit(data).transform(data)

        tokenizer = Tokenizer(inputCol="message", outputCol="words")
        data = tokenizer.transform(data)

        hashingTF = HashingTF(inputCol="words", outputCol="rawFeatures", numFeatures=100)
        data = hashingTF.transform(data)

        idf = IDF(inputCol="rawFeatures", outputCol="features")
        idf_model = idf.fit(data)
        data = idf_model.transform(data)

        # Save IDF model
        model_path = os.path.join(output_dir, "idf_model")
        if os.path.exists(model_path):
            shutil.rmtree(model_path)  # Delete existing model directory

        idf_model.write().save(model_path)


        # Train-Test Split
        train_data, test_data = data.randomSplit([0.7, 0.3], seed=42)

        # Models to Train
        models = {
            "LogisticRegression": LogisticRegression(featuresCol="features", labelCol="label"),
            "RandomForest": RandomForestClassifier(featuresCol="features", labelCol="label"),
            "GBTClassifier": GBTClassifier(featuresCol="features", labelCol="label", maxIter=10),
            "NaiveBayes": NaiveBayes(featuresCol="features", labelCol="label"),
            "LinearSVC": LinearSVC(featuresCol="features", labelCol="label")
        }

        # XGBoost requires NumPy arrays
        xgb_features = np.array(data.rdd.map(lambda row: row['features'].toArray()).collect())
        xgb_labels = np.array(data.rdd.map(lambda row: row['label']).collect())
        xgb_train = xgb.DMatrix(xgb_features, label=xgb_labels)

        # Results dictionary to store evaluation metrics
        results = {}

        # Train and evaluate models
        for model_name, model in models.items():
            print(f"Training {model_name}...")

            # Create a subdirectory for the model
            model_output_dir = os.path.join(output_dir, model_name)
            os.makedirs(model_output_dir, exist_ok=True)

            # Train the model
            trained_model = model.fit(train_data)
            predictions = trained_model.transform(test_data)

            # Evaluate
            evaluator = MulticlassClassificationEvaluator(labelCol="label", predictionCol="prediction")
            accuracy = evaluator.evaluate(predictions, {evaluator.metricName: "accuracy"})
            f1 = evaluator.evaluate(predictions, {evaluator.metricName: "f1"})

            # Collect true labels and predictions for ROC curve
            pred_and_labels = predictions.select("label", "prediction").rdd.map(lambda row: (float(row[0]), float(row[1])))
            labels = np.array([x[0] for x in pred_and_labels.collect()])
            preds = np.array([x[1] for x in pred_and_labels.collect()])

            roc_auc = roc_auc_score(labels, preds)
            conf_matrix = confusion_matrix(labels, preds)

            results[model_name] = {
                "accuracy": accuracy,
                "f1_score": f1,
                "roc_auc": roc_auc,
                "conf_matrix": conf_matrix.tolist()  # Convert to list for JSON compatibility
            }

            # Save confusion matrix
            plt.figure(figsize=(6, 6))
            sns.heatmap(conf_matrix, annot=True, cmap="coolwarm", fmt="d", cbar=False,
                        xticklabels=["Normal", "Fraud"], yticklabels=["Normal", "Fraud"])
            plt.title(f"{model_name} Confusion Matrix")
            plt.xlabel("Predicted Label")
            plt.ylabel("True Label")
            plt.savefig(os.path.join(model_output_dir, "confusion_matrix.png"))
            plt.close()

            # Save ROC Curve
            fpr, tpr, _ = roc_curve(labels, preds)
            plt.figure()
            plt.plot(fpr, tpr, color="blue", label=f"AUC = {roc_auc:.2f}")
            plt.title(f"{model_name} ROC Curve")
            plt.xlabel("False Positive Rate")
            plt.ylabel("True Positive Rate")
            plt.legend()
            plt.savefig(os.path.join(model_output_dir, "roc_curve.png"))
            plt.close()

        # Train and evaluate XGBoost
        xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric="logloss")
        xgb_model.fit(xgb_features, xgb_labels)
        xgb_preds = xgb_model.predict(xgb_features)

        # Evaluate XGBoost
        xgb_roc_auc = roc_auc_score(xgb_labels, xgb_preds)
        xgb_conf_matrix = confusion_matrix(xgb_labels, xgb_preds)

        xgb_output_dir = os.path.join(output_dir, "XGBoost")
        os.makedirs(xgb_output_dir, exist_ok=True)

        results["XGBoost"] = {
            "accuracy": np.mean(xgb_preds == xgb_labels),
            "f1_score": f1_score(xgb_labels, xgb_preds),
            "roc_auc": xgb_roc_auc,
            "conf_matrix": xgb_conf_matrix.tolist()  # Convert to list for JSON compatibility
        }

        # Save XGBoost confusion matrix and ROC curve
        plt.figure(figsize=(6, 6))
        sns.heatmap(xgb_conf_matrix, annot=True, cmap="coolwarm", fmt="d", cbar=False,
                    xticklabels=["Normal", "Fraud"], yticklabels=["Normal", "Fraud"])
        plt.title("XGBoost Confusion Matrix")
        plt.xlabel("Predicted Label")
        plt.ylabel("True Label")
        plt.savefig(os.path.join(xgb_output_dir, "confusion_matrix.png"))
        plt.close()

        # Save XGBoost ROC Curve
        fpr, tpr, _ = roc_curve(xgb_labels, xgb_preds)
        plt.figure()
        plt.plot(fpr, tpr, color="blue", label=f"AUC = {xgb_roc_auc:.2f}")
        plt.title("XGBoost ROC Curve")
        plt.xlabel("False Positive Rate")
        plt.ylabel("True Positive Rate")
        plt.legend()
        plt.savefig(os.path.join(xgb_output_dir, "roc_curve.png"))
        plt.close()
        
        # Visualize Metrics Comparison
        metrics = ["accuracy", "f1_score", "roc_auc"]
        for metric in metrics:
            metric_values = [results[model][metric] for model in results.keys()]
            plt.figure(figsize=(8, 6))
            sns.barplot(x=list(results.keys()), y=metric_values, palette="Blues_d")
            plt.title(f"{metric.capitalize()} Comparison")
            plt.xlabel("Models")
            plt.ylabel(metric.capitalize())
            plt.savefig(f"outputs/visualizations/{metric}_comparison.png")
            plt.close()
            
        # Plot bar chart for evaluation metrics
        metrics = {"F1-Score": f1, "ROC-AUC": roc_auc}
        metrics_items = list(metrics.items())
        metrics_labels, metrics_values = zip(*metrics_items)
        plt.figure(figsize=(8, 6))
        sns.barplot(x=metrics_labels, y=metrics_values, palette="Blues_d")
        plt.title("Evaluation Metrics")
        plt.savefig("outputs/visualizations/metrics_bar_chart.png")
        plt.close()

        # Save results as a JSON file
        results_path = os.path.join(output_dir, "results.json")
        with open(results_path, "w") as f:
            json.dump(results, f)

        weights = {"accuracy": 0.4, "f1_score": 0.3, "roc_auc": 0.3}
        for model_name, metrics in results.items():
            metrics["score"] = sum(weights[k] * metrics[k] for k in weights)

        sorted_results = sorted(results.items(), key=lambda x: x[1]["score"], reverse=True)
        top_3_models = sorted_results[:3]

        # Create a subdirectory for the best models
        models_dir = os.path.join(output_dir, "models")
        os.makedirs(models_dir, exist_ok=True)

        best_model_paths = []
        if os.path.exists(models_dir):
            shutil.rmtree(models_dir)  
        os.makedirs(models_dir, exist_ok=True)
        
        for model_name, _ in top_3_models:
            model = models.get(model_name, None) 
            print(f"Saving {model}...")
            if model_name == "XGBoost":  
                model_save_path = os.path.join(models_dir, f"{model_name}.json")  # XGBoost uses JSON format
                xgb_model.save_model(model_save_path)
            else:
                trained_model = models[model_name].fit(train_data)
                model_save_path = os.path.join(models_dir, f"{model_name}")
                if os.path.exists(model_save_path):
                    shutil.rmtree(model_save_path)
                trained_model.write().overwrite().save(model_save_path)
            
            best_model_paths.append(model_save_path)
            print(f"Saved {model_name} model at {model_save_path}")
            
        print(top_3_models)
        return spark_ui_url, results_path, best_model_paths

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", required=True, help="Path to the dataset CSV file")
    parser.add_argument("--output", required=True, help="Directory to save outputs")
    args = parser.parse_args()

    spark_ui_url, results_path, model_path = main(args.dataset, args.output)
    print(f"Spark UI URL: {spark_ui_url}")
    print(f"Results saved at: {results_path}")
    print(f"Model saved at: {model_path}")
