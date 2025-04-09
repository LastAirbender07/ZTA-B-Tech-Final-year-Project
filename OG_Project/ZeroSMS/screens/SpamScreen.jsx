import { Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native'; // For navigation

const SpamScreen = ({ messages }) => {
  const navigation = useNavigation(); // Hook for navigation

  // Function to open detailed screen for the message
  const handlePress = (message) => {
    navigation.navigate('MessageDetail', { message });
  };

  return (
    <View className="flex-1 pt-4 px-4 bg-[#1a1a1a]">
      <ScrollView className="w-full h-full" contentContainerStyle={{ paddingBottom: 80 }}>
        {messages.map((message, index) => (
          <View
            key={index}
            className={`p-4 rounded-xl shadow-md shadow-blue-500/50 ${
              message.isTransaction ? 'bg-[#2a6f97]' : 'bg-[#2c2c2c]'
            } ${index === 0 ? 'mt-0' : 'mt-4'}`}
          >
            <TouchableOpacity
              className="flex-row items-center gap-4"
              onPress={() => handlePress(message)} // Navigate to detail screen
            >
              <Image
                source={require('../assets/user.png')}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  resizeMode: 'cover',
                }}
              />
              <View className="flex-1">
                <Text className="font-bold text-lg text-white">{message.address}</Text>
                {/* Limit message body to 30 characters */}
                <Text className="text-base text-gray-300 mt-1">
                  {message.body.length > 30
                    ? message.body.substring(0, 30) + '...'
                    : message.body}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-sm text-gray-400">
                  {new Date(message.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                <Text className="text-sm text-gray-400">
                  {new Date(message.date).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true,
                  })}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default SpamScreen;
