import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useColorScheme as useDeviceColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ZaloTheme } from '@/constants/theme'

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'
export type ActiveTheme = 'light' | 'dark'

interface ThemeContextValue {
  // Current theme mode setting
  themeMode: ThemeMode
  // Actual active theme (resolves 'system' to light/dark)
  activeTheme: ActiveTheme
  // Theme colors and values
  theme: typeof ZaloTheme
  // Functions
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEME_STORAGE_KEY = '@zalo_theme_mode'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const deviceColorScheme = useDeviceColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light')

  // Determine active theme based on mode and device settings
  const activeTheme: ActiveTheme =
    themeMode === 'system' ? (deviceColorScheme === 'dark' ? 'dark' : 'light') : themeMode

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference()
  }, [])

  // Save theme preference when it changes
  useEffect(() => {
    saveThemePreference(themeMode)
  }, [themeMode])

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY)
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeModeState(savedTheme as ThemeMode)
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error)
    }
  }

  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    }
  }

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode)
  }

  const toggleTheme = () => {
    if (themeMode === 'system') {
      // If system, toggle based on current device theme
      setThemeModeState(deviceColorScheme === 'dark' ? 'light' : 'dark')
    } else {
      // Toggle between light and dark
      setThemeModeState(themeMode === 'light' ? 'dark' : 'light')
    }
  }

  const value: ThemeContextValue = {
    themeMode,
    activeTheme,
    theme: ZaloTheme,
    setThemeMode,
    toggleTheme
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Hook to access theme context
 * @returns Theme context with mode, colors, and toggle functions
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

/**
 * Hook to get theme-aware colors
 * Automatically switches between light and dark colors
 */
export function useThemeColors() {
  const { activeTheme, theme } = useTheme()
  return theme.colors[activeTheme]
}

/**
 * Hook to get specific theme value by path
 * Example: useThemeValue('colors.brand.primary')
 */
export function useThemeValue<T = any>(path: string): T {
  const { theme } = useTheme()
  const keys = path.split('.')
  let value: any = theme

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      console.warn(`Theme path not found: ${path}`)
      return undefined as T
    }
  }

  return value as T
}
