from flask import Blueprint, jsonify, request
from bson.objectid import ObjectId
from app.auth.routes import token_required
from datetime import datetime
from app import mongo
import uuid

user_bp = Blueprint('user', __name__)

# Get user profile information
@user_bp.route("/profile", methods=["GET"])
@token_required
def user_profile(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    user = mongo.Users.find_one({"_id": ObjectId(current_user)})
    if user:
        user["_id"] = str(user["_id"])
        return jsonify(user), 200
    return jsonify({"error": "User not found"}), 404

@user_bp.route("/profile", methods=["PUT"])
@token_required
def update_user_profile(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    data = request.get_json()
    result = mongo.Users.update_one(
        {"_id": ObjectId(current_user)},
        {"$set": {
            "full_name": data.get("full_name"),
            "email": data.get("email"),
            "phone_no": data.get("phone_no"),
            "gender": data.get("gender"),
            "profile_photo": data.get("profile_photo")
        }}
    )
    
    if result.modified_count == 1:
        return jsonify({"message": "Profile updated successfully"}), 200
    return jsonify({"error": "Failed to update profile"}), 400

# Add a new transaction for the logged-in user
@user_bp.route("/transactions", methods=["POST"])
@token_required
def add_transaction(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    data = request.get_json()
    
    # Ensure that all required fields are provided
    required_fields = ["description", "paymentType", "category", "amount", "location", "date"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Generate a unique transaction ID
    transaction_id = str(uuid.uuid4())

    # Create the new transaction object
    transaction = {
        "description": data['description'],
        "paymentType": data['paymentType'],
        "category": data['category'],
        "amount": data['amount'],
        "location": data['location'],
        "date": data['date'],
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    # Update the user's transactions record
    result = mongo.transactions.update_one(
        {"userId": ObjectId(current_user)},
        {"$set": {f"transactions.{transaction_id}": transaction}}
    )

    if result.modified_count == 1:
        return jsonify({"message": "Transaction added successfully"}), 200
    elif result.matched_count == 0:
        return jsonify({"error": "User record not found"}), 404
    return jsonify({"error": "Failed to add transaction"}), 400

# Get all transactions for the logged-in user
@user_bp.route("/transactions", methods=["GET"])
@token_required
def get_transactions(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    user_record = mongo.transactions.find_one({"userId": ObjectId(current_user)})
    if user_record and "transactions" in user_record:
        return jsonify(user_record["transactions"]), 200
    return jsonify({"error": "Transactions not found"}), 404


# Update a specific transaction for the logged-in user
@user_bp.route("/transactions/<transaction_id>", methods=["PUT"])
@token_required
def update_transaction(current_user, current_role, transaction_id):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    data = request.get_json()

    # Ensure that all required fields are provided
    required_fields = ["description", "paymentType", "category", "amount", "location", "date"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Create the updated transaction object
    updated_transaction = {
        "description": data['description'],
        "paymentType": data['paymentType'],
        "category": data['category'],
        "amount": data['amount'],
        "location": data['location'],
        "date": data['date'],
        "updatedAt": datetime.utcnow()  # Only update the updatedAt field
    }

    # Update the transaction
    result = mongo.transactions.update_one(
        {"userId": ObjectId(current_user)},
        {"$set": {f"transactions.{transaction_id}": updated_transaction}}
    )

    if result.modified_count == 1:
        return jsonify({"message": "Transaction updated successfully"}), 200
    elif result.matched_count == 0:
        return jsonify({"error": "User record not found"}), 404
    return jsonify({"error": "Failed to update transaction"}), 400


# Delete a specific transaction for the logged-in user
@user_bp.route("/transactions/<transaction_id>", methods=["DELETE"])
@token_required
def delete_transaction(current_user, current_role, transaction_id):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    result = mongo.transactions.update_one(
        {"userId": ObjectId(current_user)},
        {"$unset": {f"transactions.{transaction_id}": ""}}
    )

    if result.modified_count == 1:
        return jsonify({"message": "Transaction deleted successfully"}), 200
    elif result.matched_count == 0:
        return jsonify({"error": "User record not found"}), 404
    return jsonify({"error": "Failed to delete transaction"}), 400

@user_bp.route("/transactions/share", methods=["POST"])
@token_required
def share_transactions(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    data = request.get_json()
    auditor_id = data.get("auditor_id")
    transaction_id = data.get("transaction_id")

    if not auditor_id or not transaction_id:
        return jsonify({"error": "Missing required fields: auditor_id, transaction_id"}), 400

    try:
        # Check if the transaction exists for the user
        transaction_record = mongo.transactions.find_one({"userId": ObjectId(current_user), "_id": ObjectId(transaction_id)})

        if not transaction_record:
            return jsonify({"status": "error", "message": "No transactions found for this user."}), 404

        # Check if the auditor exists in the auditInfo collection
        auditor_record = mongo.auditInfo.find_one({"_id": ObjectId(auditor_id)})
        if not auditor_record:
            return jsonify({"status": "error", "message": "Auditor not found."}), 404

        # Add the auditor_id to the sharedWith array if not already present for this transaction
        if auditor_id not in transaction_record.get("sharedWith", []):
            # Update the transaction's sharedWith array
            mongo.transactions.update_one(
                {"userId": ObjectId(current_user), "_id": ObjectId(transaction_id)},
                {"$addToSet": {"sharedWith": auditor_id}}
            )

            # Update the auditor's "hasAccessTo" array with the transaction_id
            update_result = mongo.auditInfo.update_one(
                {"_id": ObjectId(auditor_id)},
                {"$addToSet": {"hasAccessTo": transaction_id}}
            )

            # Log the result of the update to see if the auditor's record was updated
            if update_result.modified_count == 0:
                print(f"Failed to update auditor's hasAccessTo array for auditor_id: {auditor_id}")

            return jsonify({"status": "success", "message": "Transactions shared with auditor successfully.", "data": {"transactionId": transaction_id, "auditorId": auditor_id}}), 200
        else:
            return jsonify({"status": "error", "message": "Auditor already has access."}), 400

    except Exception as e:
        return jsonify({"status": "error", "message": f"Error sharing transactions: {str(e)}"}), 500

@user_bp.route("/transactions/revoke", methods=["POST"])
@token_required
def revoke_access(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    data = request.get_json()
    auditor_id = data.get("auditor_id")
    transaction_id = data.get("transaction_id")

    if not auditor_id or not transaction_id:
        return jsonify({"error": "Missing required fields: auditor_id, transaction_id"}), 400

    try:
        # Find the user's transaction record
        transaction_record = mongo.transactions.find_one({"userId": ObjectId(current_user)})

        if not transaction_record:
            return jsonify({"status": "error", "message": "No transactions found for this user."}), 404

        # Remove the auditor_id from the sharedWith array if present
        if auditor_id in transaction_record.get("sharedWith", []):
            # Remove the auditor from sharedWith array
            mongo.transactions.update_one(
                {"userId": ObjectId(current_user)},
                {"$pull": {"sharedWith": auditor_id}}
            )

            # Remove the transaction_id from the auditor's hasAccessTo array
            mongo.auditinfo.update_one(
                {"_id": ObjectId(auditor_id)},
                {"$pull": {"hasAccessTo": transaction_id}}
            )

            updated_transaction_record = mongo.transactions.find_one({"userId": ObjectId(current_user)})
            return jsonify({"status": "success", "message": "Auditor access revoked successfully.", "data": updated_transaction_record}), 200
        else:
            return jsonify({"status": "error", "message": "Auditor does not have access to revoke."}), 400

    except Exception as e:
        return jsonify({"status": "error", "message": f"Error revoking access: {str(e)}"}), 500

    
@user_bp.route("/user-transactions", methods=["GET"])
@token_required
def get_user_transactions(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    user_record = mongo.transactions.find_one({"userId": ObjectId(current_user)}, {"sharedWith": 1, "_id": 1})
    
    if user_record:
        # Extract the sharedWith array and the transaction ID
        shared_with = user_record.get("sharedWith", [])
        transaction_id = str(user_record['_id'])  # Get the transaction ID
        
        return jsonify({"sharedWith": shared_with, "transactionId": transaction_id}), 200
    
    return jsonify({"error": "No transactions found for the user."}), 404


@user_bp.route("/auditors", methods=["GET"])
@token_required
def get_auditors(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    try:
        auditors = mongo.auditInfo.find({}, {"hasAccessTo": 0})  # Exclude hasAccessTo
        auditor_list = []
        
        for auditor in auditors:
            # Convert ObjectId to string for all necessary fields
            auditor["_id"] = str(auditor["_id"])
            auditor["user_id"] = str(auditor["user_id"])  # Convert user_id if present
            auditor["hasAccessToLength"] = len(auditor.get("hasAccessTo", []))  # Add length of hasAccessTo
            auditor_list.append(auditor)

        return jsonify(auditor_list), 200
    except Exception as e:
        print(e)
        return jsonify({"status": "error", "message": f"Error retrieving auditors: {str(e)}"}), 500

# Add a new SMS transaction for the logged-in user
@user_bp.route("/sms-transaction", methods=["POST"])
@token_required
def add_sms_transaction(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    data = request.get_json()
    print(data)

    # Check if data is a list
    if not isinstance(data, list):
        return jsonify({"error": "Invalid data format. Expected a list."}), 400

    try:
        # Process each SMS in the incoming list
        for sms in data:
            if 'address' not in sms or 'body' not in sms:
                return jsonify({"error": "Missing required fields in SMS data."}), 400
            
            # Generate a unique key for the SMS transaction
            sms_key = str(uuid.uuid4())

            # Create the SMS transaction object
            sms_transaction = {
                "sender": sms['address'],
                "message": sms['body'],
                "timestamp": datetime.fromtimestamp(sms['date'] / 1000.0),
                "label": None
            }

            # Update the user's transaction record with the SMS transaction
            result = mongo.transactions.update_one(
                {"userId": ObjectId(current_user)},
                {"$set": {f"transactionFromSMS.{sms_key}": sms_transaction}}
            )

            if result.modified_count == 0:
                return jsonify({"error": "User record not found or SMS transaction not added."}), 404

        # Update the lastUpdatedSMS in the Users table
        mongo.Users.update_one(
            {"_id": ObjectId(current_user)},
            {"$set": {"lastUpdatedSMS": datetime.utcnow()}}
        )

        return jsonify({"message": "SMS transactions added and user updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Error adding SMS transaction: {str(e)}"}), 500


@user_bp.route("/sms-transactions", methods=["GET"])
@token_required
def get_sms_transactions(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    try:
        # Fetch the user's transaction record
        user_transactions = mongo.transactions.find_one({"userId": ObjectId(current_user)})

        if not user_transactions:
            return jsonify({"error": "No transaction record found for the user."}), 404

        # Extract SMS transactions from the document
        sms_transactions = user_transactions.get("transactionFromSMS", {})

        # If no SMS transactions found, return an empty list
        if not sms_transactions:
            return jsonify({"message": "No SMS transactions found."}), 200

        return jsonify(sms_transactions), 200

    except Exception as e:
        return jsonify({"error": f"Error retrieving SMS transactions: {str(e)}"}), 500

@user_bp.route("/update-sms-labels", methods=["POST"])
@token_required
def update_sms_labels(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    data = request.get_json()
    print(data)

    # Check if data is a list of SMS objects with an id and label
    if not isinstance(data, list):
        return jsonify({"error": "Invalid data format. Expected a list."}), 400

    try:
        print(data)
        for sms in data:
            if 'id' not in sms or 'label' not in sms:
                print("Missing required fields (id, label) in SMS data.")
                return jsonify({"error": "Missing required fields (id, label) in SMS data."}), 400

            sms_id = sms['id']
            label = sms['label']

            # Update the SMS label or create it if it does not exist
            result = mongo.transactions.update_one(
                {
                    "userId": ObjectId(current_user),
                    f"transactionFromSMS.{sms_id}": {"$exists": True}
                },
                {
                    "$set": {f"transactionFromSMS.{sms_id}.label": label}
                },
                upsert=True  
            )

            if result.modified_count == 0:
                print(f"SMS with id {sms_id} not found or label not updated.")
                return jsonify({"error": f"SMS with id {sms_id} not found or label not updated."}), 404

        return jsonify({"message": "SMS labels updated successfully."}), 200

    except Exception as e:
        print("Error updating SMS labels:", e)
        return jsonify({"error": f"Error updating SMS labels: {str(e)}"}), 500

@user_bp.route("/delete-sms-transaction", methods=["POST"])
@token_required
def delete_sms_transaction(current_user, current_role):
    if current_role != 'user':
        return jsonify({"error": "Access denied. Users only."}), 403

    data = request.get_json()

    if not data or 'ids' not in data:
        return jsonify({"error": "Missing 'ids' field in the request."}), 400

    sms_ids = data['ids']

    if not isinstance(sms_ids, list) or not sms_ids:
        return jsonify({"error": "'ids' must be a non-empty list."}), 400

    try:
        unset_fields = {f"transactionFromSMS.{sms_id}": "" for sms_id in sms_ids}

        result = mongo.transactions.update_one(
            {"userId": ObjectId(current_user)},
            {"$unset": unset_fields}
        )

        if result.modified_count == 0:
            return jsonify({"error": "None of the specified SMS IDs were found."}), 404

        return jsonify({"message": "SMS transactions deleted successfully.", "deleted_ids": sms_ids}), 200

    except Exception as e:
        return jsonify({"error": f"Error deleting SMS transactions: {str(e)}"}), 500

@user_bp.route("/model-stats", methods=["GET"])
@token_required
def get_model_stats(current_user, current_role):
    if current_role != 'user':
        return jsonify({"message": "Access denied. Users only."}), 403

    try:
        user_transactions = mongo.transactions.find_one({"userId": ObjectId(current_user)})
        if not user_transactions:
            return jsonify({"error": "No transaction record found for the user."}), 404

        model_stats = user_transactions.get("Model Stats", {})
        if not model_stats:
            return jsonify({"message": "No model stats found."}), 200

        return jsonify(model_stats), 200

    except Exception as e:
        return jsonify({"error": f"Error retrieving model stats: {str(e)}"}), 500