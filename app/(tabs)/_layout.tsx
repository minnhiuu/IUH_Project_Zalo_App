import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'
import { StatusBar, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SEMANTIC, BRAND, COMPONENT } from '@/constants/theme'

// Zalo-style tab configuration
const TAB_CONFIG = {
  messages: {
    name: 'index',
    titleKey: 'tabs.messages',
    icon: 'chatbubble-ellipses-outline',
    iconFocused: 'chatbubble-ellipses'
  },
  contacts: {
    name: 'contacts',
    titleKey: 'tabs.contacts',
    icon: 'people-outline',
    iconFocused: 'people'
  },
  discover: {
    name: 'discover',
    titleKey: 'tabs.discover',
    icon: 'grid-outline',
    iconFocused: 'grid'
  },
  timeline: {
    name: 'timeline',
    titleKey: 'tabs.timeline',
    icon: 'newspaper-outline',
    iconFocused: 'newspaper'
  },
  profile: {
    name: 'profile',
    titleKey: 'tabs.profile',
    icon: 'person-circle-outline',
    iconFocused: 'person-circle'
  }
} as const

export default function TabLayout() {
  const { t } = useTranslation()

  return (
    <>
      <StatusBar barStyle='light-content' backgroundColor={SEMANTIC.primary} translucent={Platform.OS === 'android'} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COMPONENT.tab.active,
          tabBarInactiveTintColor: COMPONENT.tab.inactive,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COMPONENT.tab.background,
            borderTopColor: SEMANTIC.border,
            borderTopWidth: 0.5,
            paddingTop: 10,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            height: Platform.OS === 'ios' ? 88 : 70,
            elevation: 0,
            shadowOpacity: 0
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: 2
          },
          tabBarIconStyle: {
            marginTop: 4
          }
        }}
      >
        <Tabs.Screen
          name={TAB_CONFIG.messages.name}
          options={{
            title: t(TAB_CONFIG.messages.titleKey),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? TAB_CONFIG.messages.iconFocused : TAB_CONFIG.messages.icon}
                size={26}
                color={color}
              />
            )
          }}
        />
        <Tabs.Screen
          name={TAB_CONFIG.contacts.name}
          options={{
            title: t(TAB_CONFIG.contacts.titleKey),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? TAB_CONFIG.contacts.iconFocused : TAB_CONFIG.contacts.icon}
                size={26}
                color={color}
              />
            )
          }}
        />
        <Tabs.Screen
          name={TAB_CONFIG.discover.name}
          options={{
            title: t(TAB_CONFIG.discover.titleKey),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? TAB_CONFIG.discover.iconFocused : TAB_CONFIG.discover.icon}
                size={26}
                color={color}
              />
            )
          }}
        />
        <Tabs.Screen
          name={TAB_CONFIG.timeline.name}
          options={{
            title: t(TAB_CONFIG.timeline.titleKey),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? TAB_CONFIG.timeline.iconFocused : TAB_CONFIG.timeline.icon}
                size={26}
                color={color}
              />
            )
          }}
        />
        <Tabs.Screen
          name={TAB_CONFIG.profile.name}
          options={{
            title: t(TAB_CONFIG.profile.titleKey),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? TAB_CONFIG.profile.iconFocused : TAB_CONFIG.profile.icon}
                size={26}
                color={color}
              />
            )
          }}
        />
      </Tabs>
    </>
  )
}
