import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_URLS } from "../apiUrls";

const UserTransactions = () => {
  const { transId } = useParams();
  const [transactions, setTransactions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authToken = localStorage.getItem("authToken");

  // Get the shared users from Redux state
  const sharedUsers = useSelector((state) => state.user.sharedUsers) || []; // Default to empty array

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          API_URLS.GET_TRANSACTION_BY_ID(transId),
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        setTransactions(response.data.transaction.transactions);
        console.log("Transaction details:", response.data);
        toast.success("Transaction details fetched successfully!");
      } catch (error) {
        setError("Failed to fetch transaction details.");
        toast.error("Failed to fetch transaction details.");
        console.error("Error fetching transaction details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [transId, authToken]);

  const relevantUser = sharedUsers.find((user) => user.transaction_id === transId);
  console.log("Relevant user:", relevantUser);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 to-cyan-200 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Transaction Details for ID: {transId}
      </h2>

      {/* Display Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(transactions).map(([transactionId, transaction]) => (
          <div
            key={transactionId}
            className="bg-white shadow-lg rounded-lg p-6 space-y-4 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              Transaction ID: {transactionId}
            </h3>
            <p className="text-gray-600">Amount: ₹{transaction.amount}</p>
            <p className="text-gray-600">Category: {transaction.category}</p>
            <p className="text-gray-600">Date: {transaction.date}</p>
            <p className="text-gray-600">Description: {transaction.description}</p>
            <p className="text-gray-600">Location: {transaction.location}</p>
          </div>
        ))}
      </div>

      {/* Display Relevant User Information */}
      <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6">
        User Information
      </h2>
      {relevantUser ? (
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-4 hover:shadow-xl transition-shadow">
          <div className="flex items-center space-x-4">
            <img
              src={relevantUser.user_info?.profile_photo}
              alt={relevantUser.user_info?.username}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {relevantUser.user_info?.full_name}
              </h3>
              <p className="text-gray-600">@{relevantUser.user_info?.username}</p>
              <p className="text-gray-600">{relevantUser.user_info?.email}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No user information available.</p>
      )}
    </div>
  );
};

export default UserTransactions;
