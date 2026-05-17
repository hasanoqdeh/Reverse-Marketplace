import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardScreen from './screens/DashboardScreen';
import BrowseRequestsScreen from './screens/BrowseRequestsScreen';
import MyBidsScreen from './screens/MyBidsScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import ChatListScreen from '../../screens/chat/ChatListScreen';
import NotificationsScreen from '../../screens/notifications/NotificationsScreen';
import {MerchantTabParamList} from '../../types/navigation';

const Tab = createBottomTabNavigator<MerchantTabParamList>();

const ACCENT = '#16A34A';
const INACTIVE = '#9CA3AF';
const ICONS: Record<string, string> = {Dashboard: '⌂', Requests: '☰', MyBids: '⊙', Chat: '💬', Notifications: '🔔', Profile: '⊛'};

function TabIcon({label, focused}: {label: string; focused: boolean}) {
  return <Text style={{fontSize: 20, color: focused ? ACCENT : INACTIVE}}>{ICONS[label] ?? '●'}</Text>;
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{tabBarLabel: 'Home'}} />
      <Tab.Screen name="Requests" component={BrowseRequestsScreen} options={{tabBarLabel: 'Requests'}} />
      <Tab.Screen name="MyBids" component={MyBidsScreen} options={{tabBarLabel: 'My Bids'}} />
      <Tab.Screen name="Chat" component={ChatListScreen} options={{tabBarLabel: 'Messages'}} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{tabBarLabel: 'Alerts'}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarLabel: 'Profile'}} />
    </Tab.Navigator>
  );
}
