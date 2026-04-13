import React from 'react'
import { View } from 'react-native'

export function StorageBar() {
  return (
    <View className='h-2 rounded-full flex-row overflow-hidden bg-secondary mt-4'>
      <View className='bg-primary' style={{ flex: 0.35 }} />
      <View className='bg-emerald-400' style={{ flex: 0.25 }} />
      <View className='bg-amber-400' style={{ flex: 0.15 }} />
      <View className='bg-secondary-hover' style={{ flex: 0.25 }} />
    </View>
  )
}
