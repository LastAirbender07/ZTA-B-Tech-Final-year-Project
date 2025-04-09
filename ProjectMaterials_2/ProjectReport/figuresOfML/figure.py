import matplotlib
matplotlib.use('Agg')  # ✅ Non-GUI backend (important fix)

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

# Set professional style
sns.set(style="whitegrid", palette="muted", color_codes=True)
plt.rcParams.update({'font.size': 10})

# Data preparation
data = {
    'Model': ['XGBoost', 'Naive Bayes', 'LinearSVC', 'Logistic Regression', 'Random Forest', 'GBTClassifier'],
    'F1 Score': [0.99, 0.96, 0.92, 0.87, 0.80, 0.69],
    'Recall': [0.99, 0.95, 0.90, 0.85, 0.78, 0.68],
    'Precision': [0.99, 0.97, 0.94, 0.89, 0.82, 0.70],
    'Accuracy': [0.99, 0.94, 0.89, 0.87, 0.85, 0.69],
    'Mean Squared Error': [0.01, 0.06, 0.11, 0.13, 0.20, 0.31],
    'ROC AUC Score': [0.98, 0.95, 0.92, 0.88, 0.82, 0.72],
    'Mean Absolute Error': [0.01, 0.06, 0.11, 0.13, 0.20, 0.31],
    'Specificity': [0.99, 0.97, 0.94, 0.89, 0.82, 0.70]
}

df = pd.DataFrame(data)

# 1. Performance Metrics Bar Chart
plt.figure(figsize=(10, 6))
df_plot1 = df.set_index('Model')[['F1 Score', 'Recall', 'Precision', 'Accuracy']]
df_plot1.plot(kind='bar', figsize=(10, 6), colormap='Set2', edgecolor='black')
plt.title('Comparison of Performance Metrics by Model')
plt.ylabel('Score')
plt.ylim(0, 1.1)
plt.xticks(rotation=15)
plt.legend(loc='upper center', bbox_to_anchor=(0.5, -0.15), ncol=4)
plt.tight_layout()
plt.savefig("performance_metrics_bar_chart.png", dpi=300)
plt.close()

# 2. Error Metrics Line Chart
plt.figure(figsize=(10, 6))
df_plot2 = df.set_index('Model')[['Mean Squared Error', 'Mean Absolute Error']]
df_plot2.plot(marker='o', linestyle='-', figsize=(10, 6), color=['#D95F02', '#7570B3'])
plt.title('Error Metrics for Each Model')
plt.ylabel('Error Value')
plt.xticks(rotation=15)
plt.grid(True)
plt.tight_layout()
plt.savefig("error_metrics_line_chart.png", dpi=300)
plt.close()

# 3. ROC AUC Score & Specificity Bar Chart
plt.figure(figsize=(10, 6))
df_plot3 = df.set_index('Model')[['ROC AUC Score', 'Specificity']]
df_plot3.plot(kind='bar', figsize=(10, 6), colormap='Set1', edgecolor='black')
plt.title('ROC AUC Score and Specificity Comparison')
plt.ylabel('Score')
plt.ylim(0, 1.1)
plt.xticks(rotation=15)
plt.legend(loc='upper center', bbox_to_anchor=(0.5, -0.15), ncol=2)
plt.tight_layout()
plt.savefig("roc_specificity_bar_chart.png", dpi=300)
plt.close()

# 4. Accuracy Only Bar Chart
plt.figure(figsize=(8, 5))
sns.barplot(x='Model', y='Accuracy', data=df, palette='viridis', edgecolor='black')
plt.title('Model-wise Accuracy Comparison', fontsize=12)
plt.ylabel('Accuracy Score')
plt.ylim(0, 1.05)
plt.xticks(rotation=15)
plt.tight_layout()
plt.savefig("accuracy_only_bar_chart.png", dpi=300)
plt.close()
