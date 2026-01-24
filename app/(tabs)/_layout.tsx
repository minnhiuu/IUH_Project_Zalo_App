import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StatusBar, Platform } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Zalo-style tab configuration
const TAB_CONFIG = {
  messages: {
    name: 'index',
    title: 'Tin nhắn',
    icon: 'chatbubbles',
    iconFocused: 'chatbubbles',
  },
  contacts: {
    name: 'contacts',
    title: 'Danh bạ',
    icon: 'people-outline',
    iconFocused: 'people',
  },
  discover: {
    name: 'discover',
    title: 'Khám phá',
    icon: 'compass-outline',
    iconFocused: 'compass',
  },
  timeline: {
    name: 'timeline',
    title: 'Nhật ký',
    icon: 'time-outline',
    iconFocused: 'time',
  },
  profile: {
    name: 'profile',
    title: 'Cá nhân',
    icon: 'person-outline',
    iconFocused: 'person',
  },
} as const;

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#0068FF"
        translucent={Platform.OS === 'android'}
      />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#0068FF',
          tabBarInactiveTintColor: '#8E8E93',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
            borderTopColor: colorScheme === 'dark' ? '#333333' : '#E5E5E5',
            borderTopWidth: 0.5,
            paddingTop: 10,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            height: Platform.OS === 'ios' ? 88 : 70,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
        }}
      >
      <Tabs.Screen
        name={TAB_CONFIG.messages.name}
        options={{
          title: TAB_CONFIG.messages.title,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.messages.iconFocused : TAB_CONFIG.messages.icon}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name={TAB_CONFIG.contacts.name}
        options={{
          title: TAB_CONFIG.contacts.title,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.contacts.iconFocused : TAB_CONFIG.contacts.icon}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name={TAB_CONFIG.discover.name}
        options={{
          title: TAB_CONFIG.discover.title,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.discover.iconFocused : TAB_CONFIG.discover.icon}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name={TAB_CONFIG.timeline.name}
        options={{
          title: TAB_CONFIG.timeline.title,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.timeline.iconFocused : TAB_CONFIG.timeline.icon}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name={TAB_CONFIG.profile.name}
        options={{
          title: TAB_CONFIG.profile.title,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? TAB_CONFIG.profile.iconFocused : TAB_CONFIG.profile.icon}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
    </>
  );
}
