import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import Screens
import HomeScreen from '../screens/main/HomeScreen';
import StoreScreen from '../screens/main/StoreScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import WishlistScreen from '../screens/main/WishlistScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4c6545',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="StoreTab" 
        component={StoreScreen} 
        options={{
          tabBarLabel: 'Cửa hàng',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="storefront-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="WishlistTab" 
        component={WishlistScreen} 
        options={{
          tabBarLabel: 'Yêu thích',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
