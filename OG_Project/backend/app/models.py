from datetime import datetime
from bson.objectid import ObjectId
from app import mongo

def create_user(data):
    try:
        existing_user = mongo.Users.find_one({"username": data['username']})
        if existing_user:
            return {"error": "Username already exists"}, 400

        if data['gender'].lower() == 'male':
            profile_pic = f"https://avatar.iran.liara.run/public/boy?name={data['username']}"
        else:
            profile_pic = f"https://avatar.iran.liara.run/public/girl?name={data['username']}"

        user = {
            "username": data['username'],
            "full_name": None,
            "email": data['email'],
            "phone_no": data.get('phone_no'), 
            "password": data['password'], 
            "profile_photo": profile_pic, 
            "gender": data['gender'],
            "role": None,
            "date_created": datetime.utcnow(),
            "lastUpdatedSMS": None
        }
        result = mongo.Users.insert_one(user)
        return {"message": "User created successfully"}, 201
    except Exception as e:
        return {"error": str(e)}, 400

def create_user_session(username, login_time, logout_time=None):
    try:
        user = mongo.Users.find_one({"username": username})
        if not user:
            return {"error": "User not found"}, 404
        elif user["role"] is None:
            return {"error": "User role not set"}, 401

        user_id = user["_id"]
        today_date = datetime.utcnow().strftime("%Y-%m-%d")
        session = {
            "login_time": login_time,
            "logout_time": logout_time
        }

        existing_session = mongo.user_sessions.find_one({"user_id": user_id, "sessions.date": today_date})
        if existing_session:
            mongo.user_sessions.update_one(
                {"user_id": user_id, "sessions.date": today_date},
                {"$push": {"sessions.$.sessions": session}}
            )
        else:
            session_record = {
                "user_id": user_id,
                "username": username,
                "role": user["role"],
                "sessions": [
                    {
                        "date": today_date,
                        "sessions": [session]
                    }
                ]
            }
            mongo.user_sessions.insert_one(session_record)
        return {"message": "Session updated successfully", "user_id": str(user["_id"]), "role": user['role']}, 200
    except Exception as e:
        return {"error": str(e)}, 400

