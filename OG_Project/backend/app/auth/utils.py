# app/auth/utils.py

def validate_signup_data(data):
    required_fields = ["username", "password", "gender", "email"]
    for field in required_fields:
        if not data.get(field):
            return f"Please provide {field}"
    return None

def validate_login_data(data):
    if not data.get("username") or not data.get("password"):
        return "Please provide all fields"
    return None
