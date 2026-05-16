import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAuth} from '../context/AuthContext';
import {RootStackParamList} from '../types/navigation';
import BuyerNavigator from '../modules/buyer/BuyerNavigator';
import MerchantNavigator from '../modules/merchant/MerchantNavigator';

export default function AppNavigator() {
  const {user, isAuthenticated, isLoading} = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigation.reset({index: 0, routes: [{name: 'Auth'}]});
    }
  }, [isAuthenticated, isLoading, navigation]);

  if (user?.role === 'MERCHANT') {
    return <MerchantNavigator />;
  }

  return <BuyerNavigator />;
}
