import React from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

export const LoadingScreen = () => {
  return (
    <LinearGradient colors={['#4A90E2', '#357ABD']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View
        style={{
          width: 80,
          height: 80,
          backgroundColor: 'white',
          borderRadius: 40,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#4A90E2' }}>Z</Text>
      </View>
      <ActivityIndicator size='large' color='#fff' />
      <Text style={{ color: '#fff', marginTop: 16, fontSize: 16, fontWeight: '500' }}>Đang tải...</Text>
    </LinearGradient>
  )
}

export default LoadingScreen
