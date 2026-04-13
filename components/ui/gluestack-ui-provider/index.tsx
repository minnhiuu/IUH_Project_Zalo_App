import React from 'react'
import { View, ViewStyle } from 'react-native'
import { vars } from 'nativewind'
import { lightTokens, darkTokens } from '@/constants/theme'

// NativeWind vars() converts CSS-variable maps to inline styles on native.
// The token maps are defined once in constants/theme.ts (single source of truth).
const lightVars = vars(lightTokens)
const darkVars = vars(darkTokens)

interface GluestackProviderProps {
  children: React.ReactNode
  /** 'light' | 'dark' – controls which CSS variable set is active */
  mode?: 'light' | 'dark'
  style?: ViewStyle
}

/**
 * GluestackProvider – wraps the app in a View that supplies
 * the correct set of CSS custom-property values for the active theme.
 *
 * On **web** NativeWind uses the `.dark` class on a parent element
 * (handled by tailwind `darkMode: 'class'`).
 *
 * On **native** NativeWind resolves `var(--x)` through `vars()` inline
 * styles, so we set them here.
 */
export function GluestackProvider({ children, mode = 'light', style }: GluestackProviderProps) {
  const themeVars = mode === 'dark' ? darkVars : lightVars

  return (
    <View style={[{ flex: 1 }, themeVars, style]} className={mode === 'dark' ? 'dark' : ''}>
      {children}
    </View>
  )
}

export default GluestackProvider
