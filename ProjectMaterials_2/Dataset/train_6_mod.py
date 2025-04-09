# Importing Libraries
from pyspark.sql import SparkSession
from pyspark.sql.functions import col
from pyspark.ml.feature import Tokenizer, HashingTF, IDF, StringIndexer
from pyspark.ml.classification import (
    LogisticRegression, RandomForestClassifier, GBTClassifier, NaiveBayes, LinearSVC
)
from pyspark.ml.evaluation import MulticlassClassificationEvaluator
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, f1_score, roc_curve
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

# Initialize Spark session
spark = SparkSession.builder.appName("FraudDetection_MultiModels").getOrCreate()

# Load Dataset
file_path = "/path/to/your/spam.csv"  # Replace with your dataset path
data = spark.read.csv(file_path, header=True, inferSchema=True)

# Preprocessing
os.makedirs("output/visualizations", exist_ok=True)

indexer = StringIndexer(inputCol="res", outputCol="label")
data = indexer.fit(data).transform(data)

tokenizer = Tokenizer(inputCol="message", outputCol="words")
data = tokenizer.transform(data)

hashingTF = HashingTF(inputCol="words", outputCol="rawFeatures", numFeatures=100)
data = hashingTF.transform(data)

idf = IDF(inputCol="rawFeatures", outputCol="features")
idf_model = idf.fit(data)
data = idf_model.transform(data)

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

# Results dictionary
results = {}

# Train and evaluate models
for model_name, model in models.items():
    print(f"Training {model_name}...")
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
        "conf_matrix": conf_matrix
    }

    # Save confusion matrix
    plt.figure(figsize=(6, 6))
    sns.heatmap(conf_matrix, annot=True, cmap="coolwarm", fmt="d", cbar=False,
                xticklabels=["Normal", "Fraud"], yticklabels=["Normal", "Fraud"])
    plt.title(f"{model_name} Confusion Matrix")
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")
    plt.savefig(f"output/visualizations/{model_name}_confusion_matrix.png")
    plt.close()

    # Save ROC Curve
    fpr, tpr, _ = roc_curve(labels, preds)
    plt.figure()
    plt.plot(fpr, tpr, color="blue", label=f"AUC = {roc_auc:.2f}")
    plt.title(f"{model_name} ROC Curve")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.legend()
    plt.savefig(f"output/visualizations/{model_name}_roc_curve.png")
    plt.close()

# Train and evaluate XGBoost
xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric="logloss")
xgb_model.fit(xgb_features, xgb_labels)
xgb_preds = xgb_model.predict(xgb_features)

# Evaluate XGBoost
xgb_roc_auc = roc_auc_score(xgb_labels, xgb_preds)
xgb_conf_matrix = confusion_matrix(xgb_labels, xgb_preds)

results["XGBoost"] = {
    "accuracy": np.mean(xgb_preds == xgb_labels),
    "f1_score": f1_score(xgb_labels, xgb_preds),
    "roc_auc": xgb_roc_auc,
    "conf_matrix": xgb_conf_matrix
}

# Save XGBoost confusion matrix and ROC curve
plt.figure(figsize=(6, 6))
sns.heatmap(xgb_conf_matrix, annot=True, cmap="coolwarm", fmt="d", cbar=False,
            xticklabels=["Normal", "Fraud"], yticklabels=["Normal", "Fraud"])
plt.title("XGBoost Confusion Matrix")
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.savefig("output/visualizations/XGBoost_confusion_matrix.png")
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
    plt.savefig(f"output/visualizations/{metric}_comparison.png")
    plt.close()

# Print Results Summary
for model_name, metrics in results.items():
    print(f"Model: {model_name}")
    for metric, value in metrics.items():
        if metric != "conf_matrix":
            print(f"  {metric}: {value:.4f}")
    print("\n")
