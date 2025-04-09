import {
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import {useDispatch} from 'react-redux';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  fetchUserProfile,
} from '../store/authSlice'; // Import Redux actions
import axios from 'axios';
import {sha256} from 'js-sha256';
import {jwtDecode} from 'jwt-decode';

const LoginScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [BACKEND_URL, setBACKEND_URL] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkInternetConnectivity = async () => {
      try {
        const state = await NetInfo.fetch();
        if (!state.isConnected) {
          Alert.alert(
            'No Internet Connection',
            'Please check your internet connection and try again',
            [{text: 'Ok'}],
          );
        } else {
          fetchIP(); // Call fetchIP only if connected to the internet
        }
      } catch (error) {
        Alert.alert(
          'Error',
          'An error occurred while checking internet connectivity',
          [{text: 'Ok'}],
        );
      }
    };
    checkInternetConnectivity();
  }, []);

  const fetchIP = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.jsonbin.io/v3/b/6770dcdcad19ca34f8e26b1a/latest?timestamp=${new Date().getTime()}`,
        {
          method: 'GET',
          headers: {
            'X-Master-Key':
              '$2a$10$tNVLRPxumzoBDbMfaYhQhexsIfJFwT38aJaOxYPaKtahTrVKqFp3S',
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        const record = data.record;
        console.log('Data: ', record);
        const url = record?.backend_url.toString();
        console.log('URL: ', url);
        setBACKEND_URL(url); // Update the state with backend URL
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to backend server!');
      console.log(`Error: ${error.message}`);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const handleLogin = async () => {
    if (email === '' || password === '') {
      Alert.alert('Error', 'Please fill all fields', [{text: 'Ok'}]);
      return;
    } else {
      console.log('URL fetched:', BACKEND_URL);
      dispatch(loginStart());

      const hashedPassword = sha256(password);
      console.log('Credentials: ', email, password);
      console.log('Final backend URL used for login:', `http://${BACKEND_URL}/auth/login`);

      try {
        const response = await axios.post(`http://${BACKEND_URL}/auth/login`, {
          username: email,
          password: hashedPassword,
        });

        if (response.status === 200) {
          const {token} = response.data; // Extract token from response
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          // Check if the token is valid and handle roles
          if (decodedToken.exp && decodedToken.exp > currentTime) {
            if (decodedToken.role === 'user') {
              dispatch(loginSuccess({token, backendURL: BACKEND_URL})); // Save token and backend URL to Redux
              dispatch(fetchUserProfile()); // Fetch user profile after successful login
              Alert.alert('Success', 'Login successful', [{text: 'Ok'}]);
              navigation.replace('Main');
            } else {
              handleInvalidRole(); // Function to handle invalid role
            }
          } else {
            Alert.alert('Error', 'Token expired, please log in again', [
              {text: 'Ok'},
            ]);
          }
        } else {
          console.error(response);
          dispatch(loginFailure('Login failed')); // Dispatch login failure
        }
      } catch (err) {
        console.error('Axios Error:', err);
        if (err.response) {
          // Server responded with a status other than 2xx
          console.error('Response Data:', err.response.data);
          console.error('Status:', err.response.status);
          console.error('Headers:', err.response.headers);
          dispatch(loginFailure(err.response.data?.error || 'Login failed. Server responded with error.'));
        } else if (err.request) {
          // Request was made but no response received
          console.error('Request was made but no response received');
          console.error('Request Object:', err.request);
          dispatch(loginFailure('Network error: No response received from server.'));
        } else {
          // Something else happened in setting up the request
          console.error('Error Message:', err.message);
          dispatch(loginFailure(`Unexpected error: ${err.message}`));
        }
      }
      
    }
  };

  const handleInvalidRole = () => {
    Alert.alert('Error', 'Invalid role assigned. Please contact support.', [
      {text: 'Ok'},
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-2">
      <KeyboardAvoidingView>
        <View className="items-center justify-center mt-24">
          <Text className="text-[#003580] text-xl font-bold">Sign In</Text>
          <Text className="text-black mt-3 text-lg font-medium">
            Sign In to your Account
          </Text>
        </View>
        <View className="mt-12 mx-5">
          <View className="">
            <Text className="text-[#003580] text-lg font-semibold">Email</Text>
            <TextInput
              className="w-full py-0 px-1 text-black border-gray-400 border-b text-base font-semibold"
              value={email}
              onChangeText={text => setEmail(text)}
            />
          </View>
          <View className="mt-5">
            <Text className="text-[#003580] text-lg font-semibold">
              Password
            </Text>
            <TextInput
              className="w-full py-0 px-1 text-black border-gray-400 border-b text-base font-semibold"
              value={password}
              secureTextEntry={true}
              onChangeText={text => setPassword(text)}
            />
          </View>
        </View>
        <TouchableOpacity
          className="mt-5 mx-5 bg-[#003580] py-3 items-center justify-center rounded-lg"
          onPress={() => handleLogin()}
          disabled={loading || BACKEND_URL === ''}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white text-lg font-semibold">Login In</Text>
          )}
        </TouchableOpacity>
        <View>
          {!loading && BACKEND_URL === '' && (
            <Text className="text-red-500 text-center mt-5">
              Unable to connect to backend server
            </Text>
          )}

          {loading && BACKEND_URL === '' && (
            <Text className="text-yellow-500 text-center mt-5">
              Connecting to backend... {BACKEND_URL}
            </Text>
          )}

          {!loading && BACKEND_URL !== '' && (
            <Text className="text-blue-700 text-center mt-5">
              Connected to backend: {BACKEND_URL}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
