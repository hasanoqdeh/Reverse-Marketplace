import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet, Text} from 'react-native';
import {MerchantTabParamList} from '../types/navigation';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import BrowseRequestsScreen from '../screens/requests/BrowseRequestsScreen';
import MyBidsScreen from '../screens/bids/MyBidsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MerchantTabParamList>();

const PRIMARY = '#16A34A';
const INACTIVE = '#9CA3AF';

function TabIcon({
  name,
  focused,
}: {
  name: string;
  focused: boolean;
}): React.JSX.Element {
  const icons: Record<string, string> = {
    home: '⌂',
    list: '☰',
    tag: '⊙',
    person: '⊛',
  };
  return (
    <Text style={[styles.icon, {color: focused ? PRIMARY : INACTIVE}]}>
      {icons[name] ?? '●'}
    </Text>
  );
}

function MerchantNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({focused}) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Requests"
        component={BrowseRequestsScreen}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({focused}) => (
            <TabIcon name="list" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MyBids"
        component={MyBidsScreen}
        options={{
          tabBarLabel: 'My Bids',
          tabBarIcon: ({focused}) => <TabIcon name="tag" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({focused}) => (
            <TabIcon name="person" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  icon: {
    fontSize: 22,
  },
});

export default MerchantNavigator;
