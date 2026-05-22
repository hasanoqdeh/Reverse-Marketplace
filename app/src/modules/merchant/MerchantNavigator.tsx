import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MerchantDiscoverScreen from './screens/MerchantDiscoverScreen';
import MerchantActivityScreen from './screens/MerchantActivityScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import ChatListScreen from '../../screens/chat/ChatListScreen';
import NotificationBell from '../../components/NotificationBell';
import {MerchantTabParamList} from '../../types/navigation';

const Tab = createBottomTabNavigator<MerchantTabParamList>();

const ACCENT   = '#16A34A';
const INACTIVE = '#9CA3AF';

const ICONS: Record<string, string> = {
  Discover: '⊞',
  Messages: '💬',
  Profile:  '⊛',
};

function TabIcon({label, focused}: {label: string; focused: boolean}) {
  const color = focused ? ACCENT : INACTIVE;
  if (label === 'Activity') {
    return <NotificationBell size={22} color={color} />;
  }
  return <Text style={{fontSize: 20, color}}>{ICONS[label] ?? '●'}</Text>;
}

export default function MerchantNavigator() {
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
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {fontSize: 11, fontWeight: '500'},
        tabBarIcon: ({focused}) => <TabIcon label={route.name} focused={focused} />,
      })}>
      <Tab.Screen name="Discover"  component={MerchantDiscoverScreen} options={{tabBarLabel: 'Discover'}} />
      <Tab.Screen name="Activity"  component={MerchantActivityScreen} options={{tabBarLabel: 'Activity'}} />
      <Tab.Screen name="Messages"  component={ChatListScreen}          options={{tabBarLabel: 'Messages'}} />
      <Tab.Screen name="Profile"   component={ProfileScreen}           options={{tabBarLabel: 'Profile'}} />
    </Tab.Navigator>
  );
}
