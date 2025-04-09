import {Text, View, SafeAreaView, StatusBar} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import GetMsg from './GetMsg';


const HomeScreen = () => {
  const navigation = useNavigation();
  const [selectedRange, setSelectedRange] = useState('default');

  const handleFilterChange = (itemValue) => {
    setSelectedRange(itemValue);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1e1e1e]">
      <StatusBar barStyle={'light-content'} backgroundColor={'#1e1e1e'} />
      <View className="flex flex-row items-center justify-between p-4 bg-[#1e1e1e] shadow-lg">
        <Text className="text-[25px] font-bold text-slate-100">
          Messages Screen
        </Text>
        <View className="w-[140px] rounded-xl">
          <Picker
            selectedValue={selectedRange}
            onValueChange={handleFilterChange}
            style={{ color: 'white', height: 50, width: 140, backgroundColor: '#3d3d3d', borderRadius: 8 }}
          >
            <Picker.Item label="All Messages" value="default" />
            <Picker.Item label="Last 3 Days" value="last3days" />
            <Picker.Item label="Last 7 Days" value="last7days" />
            <Picker.Item label="Last 2 Weeks" value="2weeks" />
            <Picker.Item label="Last 1 Month" value="1month" />
          </Picker>
        </View>
      </View>
      <GetMsg selectedRange={selectedRange}/>
    </SafeAreaView>
  );
};

export default HomeScreen;
