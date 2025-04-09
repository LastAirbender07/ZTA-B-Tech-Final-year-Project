import { Text, View, ScrollView } from 'react-native';
import React from 'react';

const MessageDetail = ({ route }) => {
  const { message } = route.params; // Get the message passed from SpamScreen

  return (
    <View className="pt-10 pb-16 px-6 bg-[#1a1a1a] h-full">
      <ScrollView>
        <View className="mb-4">
          <Text className="text-lg text-white font-bold">Sender:</Text>
          <Text className="text-base text-gray-300">{message.address}</Text>
        </View>
        <View className="mb-4">
          <Text className="text-lg text-white font-bold">Message:</Text>
          <Text className="text-base text-gray-300 mt-2">{message.body}</Text>
        </View>
        <View className="mb-4">
          <Text className="text-lg text-white font-bold">Date & Time:</Text>
          <Text className="text-base text-gray-300 mt-2">
            {new Date(message.date).toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })}
          </Text>
        </View>
        <View className="mb-4">
          <Text className="text-lg text-white font-bold">Transaction:</Text>
          <Text className="text-base text-gray-300 mt-2">
            {message.isTransaction ? 'Yes' : 'No'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default MessageDetail;
