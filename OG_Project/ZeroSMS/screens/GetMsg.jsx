import React, { useState, useEffect } from 'react';
import { View, PermissionsAndroid, ActivityIndicator } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import SpamScreen from './SpamScreen';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile } from '../store/authSlice';
import axios from 'axios';

const GetMsg = ({ selectedRange }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Get lastUpdatedSMS and user details from Redux store
  const lastUpdatedSMS = useSelector(state => state.auth.userDetails.lastUpdatedSMS);
  const backendURL = useSelector(state => state.auth.backendURL);
  const token = useSelector(state => state.auth.token);

  useEffect(() => {
    readSMSPermission();
  }, []);

  const readSMSPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('SMS read permission granted');
        readSMS();
      } else {
        console.log('SMS read permission denied');
      }
    } catch (error) {
      console.error('Error requesting SMS read permission:', error);
    }
  };

  const readSMS = () => {
    const filter = { box: '' }; // Filter for SMS inbox
    SmsAndroid.list(
      JSON.stringify(filter),
      fail => {
        console.log('Failed to list SMS messages:', fail);
        setLoading(false); // Set loading to false on failure
      },
      (count, smsList) => {
        const parsedMessages = JSON.parse(smsList);

        // Apply classification for each message
        const classifiedMessages = parsedMessages.map(message => {
          const isTransaction = classifyMessage(message.body);
          return { ...message, isTransaction }; // Add 'isTransaction' field
        });

        setMessages(classifiedMessages); // Set the classified messages
        setLoading(false); // Set loading to false when messages are retrieved

        console.log('Sending transaction SMS...'); 
        sendTransactionSMS(classifiedMessages);
      },
    );
  };

  // Function to classify whether a message is a transaction
  const classifyMessage = messageBody => {
    const transactionKeywords = /bank|money|transaction|credited|debited|balance|withdraw|deposit|bonus|points|claim|redeemed|account|credit|debit|payment|reward|statement|transaction|refund/i;
    return transactionKeywords.test(messageBody); // Return true if message contains transaction-related keywords
  };

  // Function to handle the date filtering logic
  const filterMessagesByDate = messages => {
    const currentTime = Date.now();

    // Calculate the timestamp ranges based on selected filter
    const ranges = {
      default: () => true, // Show all messages
      last3days: () => currentTime - 3 * 24 * 60 * 60 * 1000, // Last 3 days
      last7days: () => currentTime - 7 * 24 * 60 * 60 * 1000, // Last 7 days
      '2weeks': () => currentTime - 14 * 24 * 60 * 60 * 1000, // Last 2 weeks
      '1month': () => currentTime - 30 * 24 * 60 * 60 * 1000, // Last 1 month
    };

    // Apply the filter based on selected range
    return messages.filter(msg => {
      const messageDate = msg.date_sent || msg.date; // Use `date_sent` or `date` field from the SMS message
      return messageDate >= (ranges[selectedRange]() || 0);
    });
  };

  // Function to send transaction SMS to the backend
  const sendTransactionSMS = async (classifiedMessages) => {
    // Filter transaction messages that are more recent than lastUpdatedSMS
    const recentTransactionSMS = classifiedMessages.filter(msg => {
      const messageDate = new Date(msg.date_sent || msg.date);
      return msg.isTransaction && messageDate > new Date(lastUpdatedSMS);
    });

    if (recentTransactionSMS.length > 0) {
      try {
        const response = await axios.post(`http://${backendURL}/user/sms-transaction`, recentTransactionSMS, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Transaction SMS sent successfully:', response.data);
        try {
          dispatch(fetchUserProfile());
        }
        catch (error) {
          console.error('Error fetching user profile:', error.response?.data || error.message);
        }
      } catch (error) {
        console.error('Error sending transaction SMS:', error.response?.data || error.message);
      }
    }
  };

  const filteredMessages = filterMessagesByDate(messages);

  return (
    <View className="w-full h-full">
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <SpamScreen messages={filteredMessages.length > 0 ? filteredMessages : []} />
      )}
    </View>
  );
};

export default GetMsg;
