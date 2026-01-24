import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { LoginForm } from '@/features/auth';

export default function LoginScreen() {
  return (
    <View className="flex-1">
      <Stack.Screen 
        options={{ 
          title: '',
          headerShown: false
        }} 
      />
      <LoginForm language="vi" />
    </View>
  );
}
