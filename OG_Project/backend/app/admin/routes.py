# app/admin/routes.py
from flask import Blueprint, jsonify, request
from bson.objectid import ObjectId
from app import mongo
from app.auth.routes import token_required
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

@admin_bp.route("/pending-users", methods=["GET"])
@token_required
def get_pending_users(current_user, current_role):
    if current_role != 'admin':
        return jsonify({"message": "Access denied. Admins only."}), 403

    users = list(mongo.Users.find({"role": None}))
    for user in users:
        user["_id"] = str(user["_id"])
    return jsonify(users), 200

@admin_bp.route("/update-role", methods=["POST"])
@token_required
def update_user_role(current_user, current_role):
    if current_role != 'admin':
        return jsonify({"message": "Access denied. Admins only."}), 403

    data = request.get_json()
    user_id = data.get("user_id")
    new_role = data.get("role")
    result = mongo.Users.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": new_role}})
    # Fetch the current admin's details from the database to get the username
    admin_user = mongo.Users.find_one({"_id": ObjectId(current_user)})
    if not admin_user:
        return jsonify({"error": "Admin user not found"}), 404
    
    if result.modified_count == 1:
        # If the new role is "user", create an empty transactions record for the user
        if new_role == 'user':
            create_initial_transaction_record(user_id)
            
        # If the new role is "auditor", add auditor info to the auditInfo collection
        elif new_role == 'auditor':
            response, status_code = add_auditor_info(user_id, approved_by=admin_user["username"])
            if status_code != 201:
                return jsonify(response), status_code
        return jsonify({"message": "User role updated successfully"}), 200
    return jsonify({"error": "Failed to update user role"}), 400

@admin_bp.route("/delete-user", methods=["POST"])
@token_required
def delete_user(current_user, current_role):
    if current_role != 'admin':
        return jsonify({"message": "Access denied. Admins only."}), 403

    try:
        data = request.get_json()
        user_id = data.get("user_id")
        result = mongo.Users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 1:
            return jsonify({"message": "User deleted successfully"}), 200
        return jsonify({"error": "Failed to delete user"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    
def create_initial_transaction_record(user_id):
    try:
        transaction_record = {
            "userId": ObjectId(user_id),
            "transactions": {},  # Initialize with an empty dictionary of transactions
            "transactionFromSMS": {},  # Placeholder for transactions from SMS
            "sharedWith": []
        }
        mongo.transactions.insert_one(transaction_record)
    except Exception as e:
        print(f"Error creating transactions record: {str(e)}")

def add_auditor_info(user_id, approved_by):
    try:
        user = mongo.Users.find_one({"_id": ObjectId(user_id)})
        if user:
            auditor_info = {
                "user_id": ObjectId(user_id),
                "name": user["full_name"],
                "email": user["email"],
                "designation": "Auditor",  # This could be dynamic if needed
                "phoneNo": user.get("phone_no"),
                "profile_photo": user.get("profile_photo"),
                "hasAccessTo": [],  # No transactions initially, can be added later
                "description": "Approved auditor",  # Customize if necessary
                "date_of_approval": datetime.utcnow(),
                "approved_by": approved_by,
                "status": "active",  # Default status upon approval
                "additionalInfo": {}  # Placeholder for any additional info
            }
            mongo.auditInfo.insert_one(auditor_info)
            return {"message": "Auditor info added successfully"}, 201
        else:
            return {"error": "User not found"}, 404
    except Exception as e:
        return {"error": str(e)}, 400
