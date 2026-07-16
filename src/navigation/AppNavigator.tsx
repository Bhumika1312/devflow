import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import DSAScreen from '../screens/DSAScreen';
import TimerScreen from '../screens/TimerScreen';
import FocusScreen from '../screens/FocusScreen';

const Tab = createBottomTabNavigator();

const icon = (name: string, focused: boolean) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>
    {name === 'Home' ? '🏡' : name === 'DSA' ? '👨‍💻' : name === 'Timer' ? '🕒' : '🎯'}
  </Text>
);

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => icon(route.name, focused),
          tabBarStyle: { backgroundColor: '#0f0f0f', borderTopColor: '#1a1a1a', height: 60 },
          tabBarActiveTintColor: '#6366f1',
          tabBarInactiveTintColor: '#666',
          headerStyle: { backgroundColor: '#0f0f0f' },
          headerTintColor: '#fff',
          tabBarLabelStyle: { fontSize: 11, marginBottom: 6 },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="DSA" component={DSAScreen} />
        <Tab.Screen name="Timer" component={TimerScreen} />
        <Tab.Screen name="Focus" component={FocusScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}