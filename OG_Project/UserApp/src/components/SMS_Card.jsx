import React from "react";

const SMS_Card = ({ sms, smsKey }) => {
  return (
    <div key={smsKey} className="p-4 border rounded shadow-sm">
      <p>
        <strong>Sender: </strong> {sms.sender}
      </p>
      <p>
        <strong>Message: </strong> {sms.message}
      </p>
      <p>
        <strong>Timestamp: </strong>
        {new Date(sms.timestamp).toLocaleString()}
      </p>
      <p>
        <strong>label: </strong> {sms.label || "N/A"}
      </p>
    </div>
  );
};

export default SMS_Card;
