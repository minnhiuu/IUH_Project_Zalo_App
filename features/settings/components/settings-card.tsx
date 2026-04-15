import React from 'react'
import { View } from 'react-native'

interface SettingsCardProps {
  children: React.ReactNode
  /** Additional vertical margin above the card. */
  marginTop?: number
}

/**
 * A white-background card wrapper for grouping settings rows.
 * Use it to visually segment related options.
 */
export function SettingsCard({ children, marginTop = 3 }: SettingsCardProps) {
  return (
    <View className='bg-background' style={{ marginTop }}>
      {children}
    </View>
  )
}
