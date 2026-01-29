import React from 'react'
import { Text, View } from 'react-native'

interface DividerProps {
  label?: string
  className?: string
}

export function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <View className={`flex-row items-center my-4 ${className || ''}`}>
        <View className='flex-1 h-px bg-divider' />
        <Text className='mx-4 text-sm text-text-tertiary'>{label}</Text>
        <View className='flex-1 h-px bg-divider' />
      </View>
    )
  }

  return <View className={`h-px bg-divider ${className || ''}`} />
}

export default Divider
