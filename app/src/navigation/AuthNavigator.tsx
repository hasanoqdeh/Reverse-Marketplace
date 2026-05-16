import React, {useEffect} from 'react';
import {Platform} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import PhoneInputScreen from '../screens/auth/PhoneInputScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import {useAuth} from '../context/AuthContext';
import {AuthStackParamList, RootStackParamList} from '../types/navigation';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  const {isAuthenticated, needsProfileSetup} = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{name: needsProfileSetup ? 'ProfileSetup' : 'App'}],
      });
    }
  }, [isAuthenticated, needsProfileSetup, navigation]);

  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="PhoneInput">
      <Stack.Screen name="PhoneInput" component={PhoneInputScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
    </Stack.Navigator>
  );
}
