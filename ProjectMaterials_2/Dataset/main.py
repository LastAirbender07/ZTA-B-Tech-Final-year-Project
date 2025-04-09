# import pandas as pd

# # Load the dataset
# df = pd.read_csv("spam.csv", encoding="ISO-8859-1", usecols=["v1", "v2"])

# # Rename the headers
# df.rename(columns={"v1": "res", "v2": "message"}, inplace=True)

# # Function to classify messages based on transaction-related keywords
# def classify_message(message_body):
#     # Expanded list of transaction-related keywords
#     transaction_keywords = r"bank|money|transaction|credited|debited|balance|withdraw|deposit|bonus|points|claim|redeemed|account|credit|debit|payment|reward|statement|transaction|refund"
#     return bool(pd.Series(message_body).str.contains(transaction_keywords, case=False, regex=True).values[0])

# # Filter dataset for transaction-related messages
# transaction_messages = df[df["message"].apply(classify_message)]

# # Save the filtered dataset to a new CSV
# transaction_messages.to_csv("transaction_spam.csv", index=False)

# print("Filtered dataset saved to 'transaction_spam.csv'")

import pandas as pd

# Read the CSV file
df = pd.read_csv('transaction_spam.csv')

# Shuffle the rows of the dataframe
df_shuffled = df.sample(frac=1).reset_index(drop=True)

# Save the shuffled dataframe to a new CSV file
df_shuffled.to_csv('transaction_spam2.csv', index=False)

print("Shuffling complete and saved as 'shuffled_file.csv'.")
