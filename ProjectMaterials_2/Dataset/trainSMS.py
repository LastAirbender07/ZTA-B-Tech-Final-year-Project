# Importing libraries

from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

spark = SparkSession.builder.appName("fraud-detection").getOrCreate()

import os
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from pyspark.ml.feature import Tokenizer, HashingTF, IDF, StringIndexer
from pyspark.ml.linalg import Vectors
from pyspark.sql.functions import col
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, f1_score, roc_curve

# Load dataset
file_path = "/home/jayaraj/Documents/Spark-VsCode/Fraud-Detection/dataset/spam.csv"  # Path to your dataset
data = spark.read.csv(file_path, header=True, inferSchema=True)
df = data

# Preprocessing: Convert `res` to numeric labels
indexer = StringIndexer(inputCol="res", outputCol="label")
data = indexer.fit(data).transform(data)
data.show(5)

# Tokenize Messages
tokenizer = Tokenizer(inputCol="message", outputCol="words")
data = tokenizer.transform(data)

# Vectorize Messages using HashingTF
hashingTF = HashingTF(inputCol="words", outputCol="rawFeatures", numFeatures=100)
data = hashingTF.transform(data)

# Compute TF-IDF (IDF)
idf = IDF(inputCol="rawFeatures", outputCol="features")
idf_model = idf.fit(data)
data = idf_model.transform(data)
data.show(5)

data = data.select("features", "label")
data.show(5)

# Convert features column to numpy arrays
features = np.array(data.rdd.map(lambda row: row['features'].toArray()).collect())
labels = np.array(data.rdd.map(lambda row: row['label']).collect())

# Train-Test Split using Scikit-learn
X_train, X_test, y_train, y_test = train_test_split(\
                                                    features, \
                                                    labels, \
                                                    test_size=0.3, \
                                                    random_state=42)


isolation_forest = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
isolation_forest.fit(X_train)

y_pred = isolation_forest.predict(X_test)
y_pred = [0 if x == 1 else 1 for x in y_pred]  # Convert to 0 (inliers) and 1 (outliers)

# Evaluate the model
report = classification_report(y_test, y_pred)
print("Classification Report:\n", report)


# Confusion Matrix
conf_matrix = confusion_matrix(y_test, y_pred)

# Plot confusion matrix
plt.figure(figsize=(6, 6))
sns.heatmap(conf_matrix, annot=True, cmap="coolwarm", fmt="d", cbar=False, xticklabels=["Normal", "Fraud"], yticklabels=["Normal", "Fraud"])
plt.title("Confusion Matrix")
plt.ylabel("True Label")
plt.xlabel("Predicted Label")
plt.savefig("output/visualizations/confusion_matrix.png")
plt.close()

# F1-Score
f1 = f1_score(y_test, y_pred)
print(f"F1-Score: {f1}")

# ROC-AUC
roc_auc = roc_auc_score(y_test, y_pred)
print(f"ROC-AUC: {roc_auc}")

# Save ROC Curve
fpr, tpr, _ = roc_curve(y_test, y_pred)
plt.figure()
plt.plot(fpr, tpr, color="blue", label=f"ROC Curve (AUC = {roc_auc:.2f})")
plt.title("ROC Curve")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.legend()
plt.savefig("output/visualizations/roc_curve.png")
plt.close()

# Plotting pie chart for class distribution
plt.figure(figsize=(6, 6))
labels_pie = ['Normal', 'Fraud']
sizes_pie = [np.sum(y_test == 0), np.sum(y_test == 1)]
plt.pie(sizes_pie, labels=labels_pie, autopct='%1.1f%%', startangle=90, colors=["lightblue", "salmon"])
plt.title("Class Distribution (Test Set)")
plt.savefig("output/visualizations/class_distribution_pie.png")
plt.close()

from pyspark.ml.feature import PCA

pca = PCA(k=2, inputCol="features", outputCol="pcaFeatures")
pca_model = pca.fit(data)
pca_data = pca_model.transform(data)

# Extract PCA features
pca_data = pca_data.select("pcaFeatures")
pca_rdd = pca_data.rdd.map(lambda x: x[0].toArray())
pca_vectors = pca_rdd.collect()

# Separate PCA values for plotting
x_vals = [vec[0] for vec in pca_vectors]
y_vals = [vec[1] for vec in pca_vectors]

# Plot PCA Scatter Plot
plt.figure(figsize=(8, 6))
plt.scatter(x_vals, y_vals, c="blue", alpha=0.5)
plt.title("PCA Scatter Plot")
plt.xlabel("PCA1")
plt.ylabel("PCA2")
plt.savefig("output/visualizations/pca_scatter.png")
plt.close()

# Plot bar chart for evaluation metrics
metrics = {"F1-Score": f1, "ROC-AUC": roc_auc}
metrics_items = list(metrics.items())
metrics_labels, metrics_values = zip(*metrics_items)

plt.figure(figsize=(8, 6))
sns.barplot(x=metrics_labels, y=metrics_values, palette="Blues_d")
plt.title("Evaluation Metrics")
plt.savefig("output/visualizations/metrics_bar_chart.png")
plt.close()

# Save the Model
# joblib.dump(isolation_forest, "output/isolation_forest_model.joblib")