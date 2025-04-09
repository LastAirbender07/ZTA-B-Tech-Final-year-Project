import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/ui/Header";
import NavBar from "../components/NavBar";
import { API_URLS } from "../apiUrls";
import SMS_Card from "@/components/SMS_Card";
import SparkNav from "@/components/SparkNav";
import { toast } from "react-hot-toast";

const GetSMS = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authToken = localStorage.getItem("authToken");

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(API_URLS.GET_SMS_TRANSACTIONS, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const res = Object.entries(response.data).map(([id, value]) => ({
        id,
        message: value.message,
        timestamp: value.timestamp,
        label: value.label || null,
      }));
      // console.log("transactions\n", res);
      setTransactions(res);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError("Failed to fetch SMS transactions.");
      setLoading(false);
      return null;
    }
  };

  const handleLabelUpdate = async (smsId, newLabel) => {
    try {
      const response = await axios.post(
        API_URLS.UPDATE_SMS_LABELS,
        [
          {
            id: smsId,
            label: newLabel,
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to update label.");
    }
  };

  const handleDeleteTransaction = async (smsIds) => {
    console.log(smsIds);
    try {
      const response = await axios.post(
        API_URLS.DELETE_SMS_TRANSACTION,
        { ids: smsIds },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log(response.data.message); 
      return response.data;
    } catch (err) {
      toast.error("Failed to delete SMS transaction.");
      console.log(err.response?.data?.error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [authToken]);

  return (
    <div className="min-h-screen mx-auto z-20">
      <NavBar />
      <Header />
      <div className="mx-auto relative justify-center p-4">
        {loading ? (
          <p>Loading SMS transactions...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <div>
            <SparkNav
              sms={transactions}
              handleLabelUpdate={handleLabelUpdate}
              handleDeleteTransaction={handleDeleteTransaction}
              fetchTransactions={fetchTransactions}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(transactions).map((smsKey) => {
                const sms = transactions[smsKey];
                return <SMS_Card key={smsKey} sms={sms} />;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetSMS;
