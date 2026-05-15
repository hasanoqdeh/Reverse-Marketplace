import React, {useEffect} from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import RequestsScreen from '../screens/home/RequestsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import {useAuth} from '../context/AuthContext';
import {AppTabParamList, RootStackParamList} from '../types/navigation';

const TAB_ICONS: Record<string, string> = {
  Home: '⌂',
  Requests: '☰',
  Profile: '◉',
};

function TabIcon({label, focused}: {label: string; focused: boolean}) {
  const color = focused ? '#2563EB' : '#6B7280';
  return (
    <Text style={{fontSize: 20, color}}>{TAB_ICONS[label] ?? '•'}</Text>
  );
}

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppNavigator() {
  const {isAuthenticated, isLoading} = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
    }
  }, [isAuthenticated, isLoading, navigation]);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({focused}) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsScreen}
        options={{tabBarLabel: 'Requests'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}
