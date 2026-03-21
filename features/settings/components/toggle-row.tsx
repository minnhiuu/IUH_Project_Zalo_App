import React from 'react'
import { View, Text, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { cssInterop } from 'nativewind'

cssInterop(Ionicons, {
  className: {
    target: 'style',
    nativeStyleToProp: { color: true }
  }
})

interface ToggleRowProps {
  icon: string
  iconBgClass?: string
  iconColorClass?: string
  title: string
  subtitle?: string
  value: boolean
  onValueChange: (value: boolean) => void
  disabled?: boolean
}

export function ToggleRow({
  icon,
  iconBgClass = 'bg-secondary',
  iconColorClass = 'text-icon-secondary',
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false
}: ToggleRowProps) {
  return (
    <View className='flex-row items-center px-4 py-3 gap-3 bg-background'>
      <View className={`w-10 h-10 rounded-full items-center justify-center ${iconBgClass}`}>
        <Ionicons name={icon as any} size={22} className={iconColorClass} />
      </View>

      <View className='flex-1'>
        <Text className='text-base text-foreground'>{title}</Text>
        {subtitle && <Text className='text-sm text-muted-foreground mt-0.5'>{subtitle}</Text>}
      </View>

      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: '#0068FF' }} disabled={disabled} />
    </View>
  )
}
