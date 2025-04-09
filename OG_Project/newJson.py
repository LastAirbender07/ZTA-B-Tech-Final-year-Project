import requests

BIN_ID = "6770dcdcad19ca34f8e26b1a"
API_KEY = "$2a$10$tNVLRPxumzoBDbMfaYhQhexsIfJFwT38aJaOxYPaKtahTrVKqFp3S"
X_ACCESS_KEY = "$2a$10$sZwKrGJCdCYGvyb923PNK./t/INdYt.0BCZswrnxIPA1WNZXnyRqi"

url = f'https://api.jsonbin.io/v3/b/{BIN_ID}'
headers = {
    'Content-Type': 'application/json',
    'X-Master-Key': API_KEY,
    'X-Access-Key': X_ACCESS_KEY,
}

backend_url = input("Enter the new backend_url: ").strip()
spark_url = input("Enter the new spark_url: ").strip()

data = {
    "backend_url": backend_url,
    "spark_url": spark_url
}

try:
    response = requests.put(url, json=data, headers=headers)
    response.raise_for_status()  # Raise an error for HTTP issues

    print("Update successful!")
    print("Updated Data:", response.json())

except requests.exceptions.RequestException as e:
    print("An error occurred:", e)

# url = f'https://api.jsonbin.io/v3/b/{BIN_ID}/latest'
# headers = {
#     'X-Master-Key': API_KEY,
# }
# print(url)
# req = requests.get(url, json=None)
# data = req.json()

# # Extract backend_url and spark_url
# record = data.get("record", {})
# backend_url = record.get("backend_url")
# spark_url = record.get("spark_url")

# print("Backend URL:", backend_url)
# print("Spark URL:", spark_url)
# print(req.text)