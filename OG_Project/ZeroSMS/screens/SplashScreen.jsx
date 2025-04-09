import React, {useEffect, useState} from 'react';
import {
  View,
  Alert,
  BackHandler,
  Image,
  ActivityIndicator,
} from 'react-native';
import JailMonkey from 'jail-monkey';
import {useNavigation} from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();
  const [isSecure, setIsSecure] = useState(true);
  
  const handleExitApp = () => {
    BackHandler.exitApp();
  };

  useEffect(() => {
    if (JailMonkey.isJailBroken()) {
      setIsSecure(false);
      Alert.alert(
        'Security Alert',
        'This device is rooted. The app cannot run on rooted devices.',
        [{text: 'OK', onPress: handleExitApp}],
      );
      return;
    }

    JailMonkey.isDevelopmentSettingsMode().then(isDevMode => {
      if (isDevMode) {
        setIsSecure(false);
        Alert.alert(
          'Security Alert',
          'Developer options are enabled. Please disable them to continue.',
          [{text: 'OK', onPress: handleExitApp}],
        );
        return;
      }
    });

    JailMonkey.isDebuggedMode().then(isDebugged => {
      if (isDebugged) {
        setIsSecure(false);
        Alert.alert(
          'Security Alert',
          'Developer options are enabled. The app is being debugged and will now exit.',
          [{text: 'OK', onPress: handleExitApp}],
        );
        return;
      }
    });

    const timer = setTimeout(() => {
      if (isSecure) {
        navigation.replace('Login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSecure]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Image
        source={require('../assets/logo.png')}
        style={{width: 150, height: 170}}
      />
      <ActivityIndicator size="large" color="#0000ff" className="mt-4" />
    </View>
  );
};

export default SplashScreen;
