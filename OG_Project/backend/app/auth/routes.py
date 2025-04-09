# app/auth/routes.py
import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from app.models import create_user, create_user_session
from .utils import validate_signup_data, validate_login_data
from bson.objectid import ObjectId
from app import mongo
from functools import wraps

SECRET_KEY = 'your_secret_key'
auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check if the token is passed in the Authorization header
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]  # Bearer <token>

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            # Decode the JWT token
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data['user_id']  # User ID
            current_role = data['role']  # User role

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired!"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token!"}), 401

        return f(current_user, current_role, *args, **kwargs)

    return decorated

@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        error = validate_signup_data(data)
        if error:
            return jsonify({"error": error}), 400

        response, status_code = create_user(data)
        return jsonify(response), status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        # Validate login data
        error = validate_login_data(data)
        if error:
            return jsonify({"error": error}), 400

        # Check if the user exists in the database
        user = mongo.Users.find_one({"username": data['username']})
        if not user or not data['password']:
            return jsonify({"error": "Invalid username or password"}), 400

        # Check password match
        if user['password'] != data['password']:
            return jsonify({"error": "Invalid username or password"}), 400

        # Check if the user's role is assigned
        if user['role'] is None:
            return jsonify({"error": "User role not assigned"}), 400

        # Generate JWT token
        token_payload = {
            "user_id": str(user['_id']),
            "username": user['username'],
            "role": user['role'],
            "exp": datetime.utcnow() + timedelta(hours=1)  # Token expiration time (1 hour)
        }
        
        token = jwt.encode(token_payload, SECRET_KEY, algorithm="HS256")

        # You can log the user session if needed
        login_time = datetime.utcnow()
        create_user_session(data['username'], login_time)

        # Return the JWT token
        return jsonify({
            "token": token,
            "message": "Login successful"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400