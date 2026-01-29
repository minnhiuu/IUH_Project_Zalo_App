import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <View className={`flex-1 items-center justify-center px-8 ${className || ''}`}>
      <View className='bg-background-secondary rounded-full p-6 mb-4'>
        <Ionicons name={icon} size={48} color='#999999' />
      </View>
      <Text className='text-lg font-semibold text-text text-center mb-2'>{title}</Text>
      {description && <Text className='text-sm text-text-secondary text-center mb-6'>{description}</Text>}
      {actionLabel && onAction && (
        <Button variant='primary' onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  )
}

export default EmptyState
