import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import React, {useEffect, useLayoutEffect} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {fetchUserProfile} from '../store/authSlice';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {userDetails} = useSelector(state => state.auth);
  const {username, email, phone_no, profile_photo, gender, role} = userDetails;

  useEffect(() => {
    dispatch(fetchUserProfile());
    }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: 'Profile',
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
      },
      headerStyle: {
        backgroundColor: '#1e1e1e',
        height: 70,
        borderBottomColor: 'transparent',
        shadowColor: 'transparent',
      },
      headerTintColor: 'white',
    });
  }, [navigation]);

  return (
    <SafeAreaView className="w-full h-full flex-1 bg-white">
      <StatusBar barStyle={'light-content'} backgroundColor={'#1e1e1e'} />
      <View className="flex-1">
        <View className="h-[114] w-full bg-[#1e1e1e]" />
        <View className="items-center">
          <TouchableOpacity
            style={{
              height: 160,
              width: 160,
              backgroundColor: 'white',
              borderRadius: 999,
              elevation: 5,
              marginTop: -90,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image
              source={{
                uri:
                  profile_photo ||
                  'https://cdn-icons-png.freepik.com/512/7718/7718888.png',
              }}
              resizeMode="contain"
              style={{
                height: 155,
                width: 155,
                borderRadius: 999,
              }}
            />
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-[#242760] my-2">
            {username || 'Your Name'}
          </Text>
          <Text className="text-black text-base">{role || 'Your Role'}</Text>
        </View>

        <View className="flex-row items-center justify-between  mx-5 mt-2">
          <View className="flex-col gap-1">
            <View className="flex-row items-center">
              <MaterialIcons name="email" size={24} color="black" />
              <Text className="text-sm text-[#003580] ml-2">
                {email || 'Email'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="phone" size={24} color="black" />
              <Text className="text-sm text-[#003580] ml-2">
                {phone_no || 'Phone Number'}
              </Text>
            </View>
            <View className="flex-row items-center">
            <MaterialIcons name="person" size={24} color="black" />
            <Text className="text-sm ml-2">{gender || 'Gender'}</Text>
          </View>
          </View>
          <TouchableOpacity
            className="bg-[#003580] w-24 h-8 rounded-md items-center justify-center mx-2">
            <Text className="text-white">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <Text className="border-[#E0E0E0] border-2 h-[1] mt-2" />
        <Text className="text-black font-semibold text-base mx-5 mt-1">
          Recent Activity
        </Text>
        <View className="items-center justify-center w-full h-full">
          <ScrollView
            className="flex-row flex-wrap"
            horizontal
            showsHorizontalScrollIndicator={false}>
            {/* Add logic to display bookings or activities if necessary */}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
