import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import AuthNavigator from './src/navigation/AuthNavigator';
import MerchantNavigator from './src/navigation/MerchantNavigator';
import {AuthProvider} from './src/context/AuthContext';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="Auth" component={AuthNavigator} />
            <Stack.Screen name="Merchant" component={MerchantNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
