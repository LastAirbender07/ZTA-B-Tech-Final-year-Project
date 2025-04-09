import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  connectToSparkBackend,
  trainModel,
  updateDataset,
  predictMessages,
} from "../utlis/sparkAPI";
import { useSelector } from "react-redux";
import UpdateDataDiaglog from "./UpdateDataDiaglog";

const SparkNav = ({
  sms,
  handleLabelUpdate,
  handleDeleteTransaction,
  fetchTransactions,
}) => {
  const [loading, setLoading] = useState(false);
  const [sparkUrl, setSparkUrl] = useState(null);
  const [disabled, setDisabled] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [training, setTraining] = useState(false);
  const [updating, setUpdating] = useState(false);

  const user_id = useSelector((state) => state.user.user.user_id);

  const filteredSms = Object.entries(sms).filter(
    ([key, value]) => value.label === null
  );

    // console.log("filteredSms", filteredSms);

  const handleConnect = async () => {
    setDisabled(false);
    setSparkUrl("https://ladybug-resolved-lynx.ngrok-free.app");
    toast.success("Connected to Apache Spark");
  };

  //   const handleConnect = async () => {
  //     setLoading(true);
  //     try {
  //       const sparkUrl = await connectToSparkBackend();
  //       if (sparkUrl) {
  //         console.log(sparkUrl);
  //         setSparkUrl(sparkUrl);
  //         setDisabled(false);
  //         toast.success("Connected to Apache Spark");
  //       } else {
  //         toast.error("Failed to get Spark URL");
  //         setDisabled(true);
  //       }
  //     } catch (error) {
  //       toast.error(error.message);
  //       setDisabled(true);
  //     }
  //     setLoading(false);
  //   };

  const handleTrain = async () => {
    if (sparkUrl && user_id) {
      setLoading(true);
      setTraining(true);
      try {
        const result = await trainModel(sparkUrl, user_id);
        console.log(result);
        toast.success(result.message);
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
      setLoading(false);
      setTraining(false);
    } else {
      toast.error("Please connect to Spark first.");
    }
  };

  const handleUpdateDataset = async (ids, messages, labels) => {
    if (sparkUrl) {
      setLoading(true);
      setUpdating(true);
      try {
        const result = await updateDataset(sparkUrl, messages, labels);
        if (result.message.includes("success")) {
            await handleDeleteTransaction(ids);
        }
        else {
            toast.error("Could not attempt to delete dataset.");
        }
        toast.success(result.message);
      } catch (error) {
        toast.error(error.message);
      }
      setLoading(false);
      setUpdating(false);
    } else {
      toast.error("Please connect to Spark first.");
    }
  };

  const handlePredictMessages = async () => {
    if (!sparkUrl) {
      toast.error("Please connect to Spark first.");
      return;
    }

    const messagesWithIds = filteredSms.map(([id, value]) => ({
      id: value.id,
      message: value.message,
    }));
    console.log(messagesWithIds);
    try {
      setLoading(true);
      setPredicting(true);
      const predictions = await predictMessages(sparkUrl, messagesWithIds);
      toast.success("Prediction completed.");
      console.log(predictions);

      for (const [smsId, prediction] of Object.entries(predictions)) {
        const { label } = prediction;
        await handleLabelUpdate(smsId, label);
      }
      toast.success("Labels updated successfully.");
      fetchTransactions();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setPredicting(false);
    }
  };

  return (
    <div className="mx-auto relative flex gap-9 justify-center items-center pb-5">
      <Button
        variant={`${sparkUrl ? "green" : "yellow"}`}
        onClick={handleConnect}
        disabled={loading}
      >
        {sparkUrl ? (
          "Connected to Apache Spark"
        ) : loading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" /> Please wait
          </div>
        ) : (
          "Connect to Apache Spark"
        )}
      </Button>
      <Button
        variant="dark"
        onClick={handlePredictMessages}
        disabled={disabled || predicting || loading}
      >
        {predicting ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" /> predicting...
          </div>
        ) : (
          "Predict Labels"
        )}
      </Button>
      <Button
        variant="secondary"
        onClick={handleTrain}
        disabled={disabled || loading || training}
      >
        {training ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" /> Training...
          </div>
        ) : (
          "Train Model"
        )}
      </Button>
      <UpdateDataDiaglog
        handleDeleteTransaction={handleDeleteTransaction}
        handleUpdateDataset={handleUpdateDataset}
        fetchTransactions={fetchTransactions}
        disabled={disabled}
        loading={loading}
        updating={updating}
      />
      <Link to={`/model-stats`}>
        <Button>View Model Stats</Button>
      </Link>
    </div>
  );
};

export default SparkNav;
