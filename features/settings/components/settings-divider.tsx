import React from 'react'
import { View } from 'react-native'

interface SettingsDividerProps {
  /** Left inset in points. Defaults to 64 (icon width + padding). */
  inset?: number
}

export function SettingsDivider({ inset = 64 }: SettingsDividerProps) {
  return <View className='h-px bg-divider' style={inset ? { marginLeft: inset } : undefined} />
}
