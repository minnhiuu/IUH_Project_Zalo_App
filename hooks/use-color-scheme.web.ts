import { useEffect, useState } from 'react'
import { useTheme } from '@/context'

/**
 * Web version: waits for hydration, then returns the user-selected
 * color scheme from ThemeProvider.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setHasHydrated(true)
  }, [])

  try {
    const { activeTheme } = useTheme()
    if (hasHydrated) {
      return activeTheme
    }
  } catch {
    // outside ThemeProvider
  }

  return 'light' as const
}
