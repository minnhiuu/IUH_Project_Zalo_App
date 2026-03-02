import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useColorScheme as useDeviceColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ZaloTheme, Colors, SEMANTIC, DARK_MODE } from '@/constants/theme'

// ── Types ───────────────────────────────────────────────
export type ThemeMode = 'light' | 'dark' | 'system'
export type ActiveTheme = 'light' | 'dark'

interface ThemeContextValue {
  themeMode: ThemeMode
  activeTheme: ActiveTheme
  isDark: boolean
  /** Static theme object (brand, spacing, etc.) */
  theme: typeof ZaloTheme
  /** Resolved light/dark palette for RN styles – e.g., colors.text */
  colors: (typeof Colors)['light']
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
const THEME_STORAGE_KEY = '@zalo_theme_mode'

// ── Provider ────────────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme()
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light')

  const activeTheme: ActiveTheme =
    themeMode === 'system' ? (deviceColorScheme === 'dark' ? 'dark' : 'light') : themeMode
  const isDark = activeTheme === 'dark'
  const colors = isDark ? Colors.dark : Colors.light

  // Persist
  useEffect(() => {
    ;(async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY)
        if (saved === 'light' || saved === 'dark' || saved === 'system') setThemeModeState(saved)
      } catch {}
    })()
  }, [])

  useEffect(() => {
    AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode).catch(() => {})
  }, [themeMode])

  const setThemeMode = useCallback((m: ThemeMode) => setThemeModeState(m), [])

  const toggleTheme = useCallback(() => {
    if (themeMode === 'system') {
      setThemeModeState(deviceColorScheme === 'dark' ? 'light' : 'dark')
    } else {
      setThemeModeState(themeMode === 'light' ? 'dark' : 'light')
    }
  }, [themeMode, deviceColorScheme])

  return (
    <ThemeContext.Provider
      value={{ themeMode, activeTheme, isDark, theme: ZaloTheme, colors, setThemeMode, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// ── Hooks ───────────────────────────────────────────────

/** Full theme context */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

/** Quick-access light/dark palette (Colors.light | Colors.dark) */
export function useThemeColors() {
  return useTheme().colors
}

/** Full semantic map (SEMANTIC | DARK_MODE) for inline RN styles */
export function useSemanticColors() {
  return useTheme().isDark ? DARK_MODE : SEMANTIC
}
