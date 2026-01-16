import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0068FF',
        tabBarInactiveTintColor: '#999999',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
          borderTopColor: colorScheme === 'dark' ? '#333333' : '#E0E0E0',
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
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
              size={24}
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
              size={24}
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
              size={24}
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
              size={24}
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
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
