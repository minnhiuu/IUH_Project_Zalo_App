import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface DataRowProps {
  icon: string
  iconColor: string
  title: string
  size: string
  cleanupLabel?: string
  onCleanup?: () => void
}

export function DataRow({ icon, iconColor, title, size, cleanupLabel = 'Dọn dẹp', onCleanup }: DataRowProps) {
  return (
    <View className='flex-row items-center px-4 py-3.5 border-b border-border'>
      <Ionicons name={icon as any} size={24} color={iconColor} />
      <Text className='flex-1 text-base text-foreground ml-3'>{title}</Text>
      <View className='flex-row items-center gap-3'>
        <Text className='text-sm text-muted-foreground'>{size}</Text>
        {onCleanup && (
          <TouchableOpacity onPress={onCleanup} className='px-3 py-1 rounded-full bg-secondary'>
            <Text className='text-sm font-medium' style={{ color: '#0068FF' }}>
              {cleanupLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
