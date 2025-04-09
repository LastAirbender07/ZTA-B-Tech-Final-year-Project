# app/auditor/routes.py
from flask import Blueprint, jsonify, request
from bson import ObjectId
from app.auth.routes import token_required
from datetime import datetime
from app import mongo

auditor_bp = Blueprint('auditor', __name__)

@auditor_bp.route("/audit-reports", methods=["GET"])
@token_required
def get_audit_reports(current_user, current_role):
    if current_role != 'auditor':
        return jsonify({"message": "Access denied. Auditors only."}), 403

    # Fetch audit reports (this is just an example)
    reports = [
        {"id": 1, "report": "Audit Report 1"},
        {"id": 2, "report": "Audit Report 2"}
    ]
    return jsonify(reports), 200

from flask import Blueprint, jsonify, request
from bson import ObjectId
from app.auth.routes import token_required

auditor_bp = Blueprint('auditor', __name__)

# Update details in both users and auditInfo tables
@auditor_bp.route('/update', methods=['POST'])
@token_required
def update_auditor_details(current_user, current_role):
    if current_role != 'auditor':
        return jsonify({"message": "Access denied. Auditors only."}), 403

    data = request.get_json()

    fields_to_update = {k: v for k, v in data.items() if k not in ['role', 'password']}

    try:
        # Update in users table
        mongo.users.update_one(
            {"_id": ObjectId(current_user)},
            {"$set": fields_to_update}
        )

        # Update in auditInfo table
        mongo.auditInfo.update_one(
            {"user_id": ObjectId(current_user)},
            {"$set": fields_to_update}
        )

        return jsonify({"status": "success", "message": "Auditor details updated successfully."}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": f"Error updating auditor details: {str(e)}"}), 500


# Get audit info for auditor
@auditor_bp.route('/audit-info', methods=['GET'])
@token_required
def get_audit_info(current_user, current_role):
    if current_role != 'auditor':
        return jsonify({"message": "Access denied. Auditors only."}), 403

    try:
        # Fetch the auditor's auditInfo to get the hasAccessTo field
        audit_info = mongo.auditInfo.find_one({"user_id": ObjectId(current_user)})

        if not audit_info or 'hasAccessTo' not in audit_info:
            return jsonify({"status": "error", "message": "AuditInfo or access information not found."}), 404

        # Convert ObjectId to string before sending the response
        audit_info["_id"] = str(audit_info["_id"])
        audit_info["user_id"] = str(audit_info["user_id"])

        # Initialize the sharedUsers array that will hold transaction_id -> user info mapping
        shared_users = []

        # Loop through each transaction_id in the hasAccessTo array
        for transaction_id in audit_info["hasAccessTo"]:
            try:
                # Fetch the corresponding transaction document to get the userId
                transaction = mongo.transactions.find_one({"_id": ObjectId(transaction_id)}, {"userId": 1})

                if not transaction:
                    continue  # Skip if the transaction is not found

                # Convert userId to ObjectId in case it's stored as a string
                user_id = transaction["userId"]
                if isinstance(user_id, str):
                    user_id = ObjectId(user_id)

                # Fetch the user's details from the users table using the userId from the transaction
                user = mongo.Users.find_one(
                    {"_id": user_id},
                    {"username": 1, "full_name": 1, "email": 1, "phone_no": 1, "profile_photo": 1, "gender": 1}
                )

                if not user:
                    continue  # Skip if user is not found

                # Append the transaction_id and detailed user info as a key-value pair
                shared_users.append({
                    "transaction_id": str(transaction_id),  # Convert ObjectId to string
                    "user_info": {
                        "username": user["username"],
                        "full_name": user.get("full_name", ""),  # Use .get() to handle potential missing fields
                        "email": user["email"],
                        "phone_no": user.get("phone_no", ""),
                        "profile_photo": user.get("profile_photo", ""),
                        "gender": user.get("gender", ""),
                    }
                })

            except Exception as e:
                print(f"Error processing transaction {transaction_id}: {str(e)}")

        # Return the auditInfo and sharedUsers
        return jsonify({
            "auditInfo": audit_info,
            "sharedUsers": shared_users
        }), 200

    except Exception as e:
        print(f"Error retrieving audit info: {str(e)}")  # Log the error for debugging
        return jsonify({"status": "error", "message": f"Error retrieving audit info: {str(e)}"}), 500

# Get transaction details by transaction ID
@auditor_bp.route('/transactions/<transaction_id>', methods=['GET'])
@token_required
def get_transaction_by_id(current_user, current_role, transaction_id):
    if current_role != 'auditor':
        return jsonify({"message": "Access denied. Auditors only."}), 403

    try:
        # Check if the auditor has access to this transaction
        transaction_record = mongo.transactions.find_one({
            "_id": ObjectId(transaction_id),
        })

        if not transaction_record:
            return jsonify({"status": "error", "message": "You do not have access to this transaction."}), 403

        # Convert ObjectId to string before sending the response
        transaction_record["_id"] = str(transaction_record["_id"])
        transaction_record["userId"] = str(transaction_record["userId"])

        # Remove the sharedWith attribute from the transaction record
        if "sharedWith" in transaction_record:
            del transaction_record["sharedWith"]

        return jsonify({"status": "success", "transaction": transaction_record}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": f"Error retrieving transaction: {str(e)}"}), 500
