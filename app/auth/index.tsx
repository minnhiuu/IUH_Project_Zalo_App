import React from 'react'
import { View } from 'react-native'
import { Stack } from 'expo-router'
import { WelcomeScreen } from '@/features/auth'

export default function WelcomeRoute() {
  return (
    <View className='flex-1'>
      <Stack.Screen
        options={{
          title: '',
          headerShown: false
        }}
      />
      <WelcomeScreen />
    </View>
  )
}
