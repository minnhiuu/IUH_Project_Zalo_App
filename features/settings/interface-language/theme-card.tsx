import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { BRAND } from '@/constants/theme'
import type { ThemeMode } from '@/context'
import { useThemeColors } from '@/context/theme-context'
import { ThemePreview } from './theme-preview'

interface ThemeCardProps {
  mode: ThemeMode
  label: string
  isSelected: boolean
  onPress: () => void
  isDark: boolean
}

export function ThemeCard({ mode, label, isSelected, onPress, isDark }: ThemeCardProps) {
  const themeColors = useThemeColors()
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
      <View
        style={{
          width: '100%',
          aspectRatio: 1.5,
          borderRadius: 10,
          borderWidth: isSelected ? 2.5 : 1,
          borderColor: isSelected ? BRAND.blue : themeColors.border,
          overflow: 'hidden'
        }}
      >
        <ThemePreview mode={mode} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: isSelected ? BRAND.blue : themeColors.iconMuted,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.blue }} />}
        </View>
        {/* Use plain style to avoid NativeWind interop issues inside Pressable */}
        <Text style={{ fontSize: 14, color: themeColors.text }}>{label}</Text>
      </View>
    </Pressable>
  )
}
