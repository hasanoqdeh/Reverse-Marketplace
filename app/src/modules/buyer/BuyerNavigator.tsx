import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import RequestsScreen from './screens/RequestsScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import {BuyerTabParamList} from '../../types/navigation';

const Tab = createBottomTabNavigator<BuyerTabParamList>();

const ACCENT = '#2563EB';
const INACTIVE = '#6B7280';
const ICONS: Record<string, string> = {Home: '⌂', Requests: '☰', Profile: '◉'};

function TabIcon({label, focused}: {label: string; focused: boolean}) {
  return <Text style={{fontSize: 20, color: focused ? ACCENT : INACTIVE}}>{ICONS[label] ?? '•'}</Text>;
}

export default function BuyerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {fontSize: 12, fontWeight: '500'},
        tabBarIcon: ({focused}) => <TabIcon label={route.name} focused={focused} />,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{tabBarLabel: 'Home'}} />
      <Tab.Screen name="Requests" component={RequestsScreen} options={{tabBarLabel: 'Requests'}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarLabel: 'Profile'}} />
    </Tab.Navigator>
  );
}
