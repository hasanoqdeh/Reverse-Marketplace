import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {AuthProvider} from './src/context/AuthContext';
import {RootStackParamList} from './src/types/navigation';
import SplashScreen from './src/screens/splash/SplashScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import ProfileSetupScreen from './src/screens/profile/ProfileSetupScreen';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import CreateRequestScreen from './src/modules/buyer/screens/CreateRequestScreen';
import RequestDetailScreen from './src/modules/buyer/screens/RequestDetailScreen';
import SubmitBidScreen from './src/modules/merchant/screens/SubmitBidScreen';
import BidDetailScreen from './src/modules/merchant/screens/BidDetailScreen';
import RequestBidsScreen from './src/modules/buyer/screens/RequestBidsScreen';
import ChatRoomScreen from './src/screens/chat/ChatRoomScreen';
import RateTransactionScreen from './src/screens/rating/RateTransactionScreen';
import MerchantStoreScreen from './src/screens/merchant/MerchantStoreScreen';
import MerchantSetupScreen from './src/screens/merchant/MerchantSetupScreen';
import NotificationsScreen from './src/screens/notifications/NotificationsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{headerShown: false, animation: 'fade'}}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            <Stack.Screen name="App" component={AppNavigator} />
            <Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{animation: 'slide_from_bottom'}} />
            <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{animation: 'slide_from_right'}} />
            <Stack.Screen name="SubmitBid" component={SubmitBidScreen} options={{animation: 'slide_from_bottom'}} />
            <Stack.Screen name="BidDetail" component={BidDetailScreen} options={{animation: 'slide_from_right'}} />
            <Stack.Screen name="RequestBids" component={RequestBidsScreen} options={{animation: 'slide_from_right'}} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{animation: 'slide_from_right'}} />
            <Stack.Screen name="RateTransaction" component={RateTransactionScreen} options={{animation: 'slide_from_bottom'}} />
            <Stack.Screen name="MerchantStore" component={MerchantStoreScreen} options={{animation: 'slide_from_right'}} />
            <Stack.Screen name="MerchantSetup" component={MerchantSetupScreen} options={{animation: 'slide_from_bottom'}} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{animation: 'slide_from_right'}} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{animation: 'slide_from_right'}} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
