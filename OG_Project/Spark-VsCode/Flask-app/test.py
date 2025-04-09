import pandas as pd
import random
import requests
import json

# Load the dataset
# df = pd.read_csv('dataset/spam.csv')

# # Select 3 random texts from the second column (assuming it's the "message" column)
# random_texts = df['message'].sample(3).tolist()

# # Prepare the payload for the API call
# payload = {
#     "messages": random_texts
# }

# text:

# spam,You’ve been selected for a $50000 cash prize. Call 0812-354-8787 now to claim.
# spam,Your bank account is under review. To verify your details visit: http://securebanking.com
# ham,A/c 3XXXXX3438 debited by Rs. 118 Total Bal: Rs.  1177.25 CR Clr Bal: Rs. 1177.25 CR. Never share OTP/Password for EMI postponement or any reason.-CBoI
# ham,You should know now. So how's anthony. Are you bringing money. I've school fees to pay and rent and stuff like that. Thats why i need your help. A friend in need....|
# spam,"You’ve been selected to receive a $300 gift card. To claim it text ""REDEEM"" to 7743."
# ham,Amt Sent Rs.150.00 From HDFC Bank A/C *5081 To ARAVIND S/O MOHANRAJ On 07-10 Ref 428152506048 Not You? Call 18002586161/SMS BLOCK UPI to 7308080808
# spam,Your mobile balance is at risk. Dial 088776655 for immediate assistance.

# Prepare the payload for the API call
payload = {
    "messages": [
        "You’ve been selected for a $50000 cash prize. Call 0812-354-8787 now to claim.",
        "Your bank account is under review. To verify your details visit: http://securebanking.com",
        "A/c 3XXXXX3438 debited by Rs. 118 Total Bal: Rs.  1177.25 CR Clr Bal: Rs. 1177.25 CR. Never share OTP/Password for EMI postponement or any reason.-CBoI",
        "You should know now. So how's anthony. Are you bringing money. I've school fees to pay and rent and stuff like that. Thats why i need your help. A friend in need....|",
        "You’ve been selected to receive a $300 gift card. To claim it text \"\"REDEEM\"\" to 7743.\"",
        "Amt Sent Rs.150.00 From HDFC Bank A/C *5081 To ARAVIND S/O MOHANRAJ On 07-10 Ref 428152506048 Not You? Call 18002586161/SMS BLOCK UPI to 7308080808",
        "Your mobile balance is at risk. Dial 088776655 for immediate assistance."
    ]
}


# Flask API URL (replace with your actual URL if running remotely)
url = "http://localhost:5000/predict"

# Make a POST request to the /predict endpoint
response = requests.post(url, json=payload)

# Check the response
if response.status_code == 200:
    result = response.json()
    print("Prediction Results:")
    print(json.dumps(result, indent=4))
else:
    print(f"Error: {response.status_code}")
    print(response.json())

# import requests
# import json

# # URL of your Flask server (make sure your Flask app is running)
# BASE_URL = "http://127.0.0.1:5000"  # or use the actual host and port of your server

# # Data to append to the dataset
# data = {
#     "messages": [
#         "Congrats 79046XX, INR. 10,000 to INR. 2,00,000* loan is ready to be credited to your Bank A/c on 23-12-2024. Check Offer http://kx16.in/MOBIKW/9NaEhu -MobiKwik",
#         "Hi Bajaj Finance Loan Yojna Rs.1,00000-/ To Rs.25,00000-/ minimum Interests and maximum subsidy For more detail Call 9220759193 AGCBCA",
#     ],
#     "label": [
#         "spam", "spam"
#     ]
# }

# # Function to update the dataset
# def update_dataset(data):
#     url = f"{BASE_URL}/update-dataset"
#     headers = {'Content-Type': 'application/json'}

#     # Send POST request to update dataset
#     response = requests.post(url, headers=headers, data=json.dumps(data))

#     # Check if the request was successful
#     if response.status_code == 200:
#         print("Dataset updated successfully!")
#         print(response.json())  # Print the response message from the server
#     else:
#         print(f"Failed to update dataset. Status Code: {response.status_code}")
#         print(response.json())  # Print error details if any

# # Test the update dataset functionality
# if __name__ == "__main__":
#     update_dataset(data)
