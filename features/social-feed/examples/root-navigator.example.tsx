import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MessageCircle, Users, Grid3x3, BookOpen, User } from 'lucide-react-native'
import { SocialFeedPage } from '../screens/social-feed-page'

// Placeholder screens (thay thế bằng actual screens)
function MessagesScreen() {
  return null
}

function ContactsScreen() {
  return null
}

function ExploreScreen() {
  return null
}

function ProfileScreen() {
  return null
}

const Tab = createBottomTabNavigator()

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopColor: '#27272a',
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            marginTop: 4,
            fontWeight: '600',
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#71717a',
        }}
      >
        <Tab.Screen
          name='Messages'
          component={MessagesScreen}
          options={{
            tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
            tabBarLabel: 'Tin nhắn',
          }}
        />

        <Tab.Screen
          name='Contacts'
          component={ContactsScreen}
          options={{
            tabBarIcon: ({ color }) => <Users size={24} color={color} />,
            tabBarLabel: 'Danh bạ',
          }}
        />

        <Tab.Screen
          name='Explore'
          component={ExploreScreen}
          options={{
            tabBarIcon: ({ color }) => <Grid3x3 size={24} color={color} />,
            tabBarLabel: 'Khám phá',
          }}
        />

        <Tab.Screen
          name='Feed'
          component={SocialFeedPage}
          options={{
            tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
            tabBarLabel: 'Tường nhà',
            tabBarBadge: 1,
          }}
        />

        <Tab.Screen
          name='Profile'
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }) => <User size={24} color={color} />,
            tabBarLabel: 'Cá nhân',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
