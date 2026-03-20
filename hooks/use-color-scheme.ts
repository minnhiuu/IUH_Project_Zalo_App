// Re-export a hook that returns the user-selected color scheme
// driven by ThemeProvider (light | dark | system)
import { useTheme } from '@/context'

export function useColorScheme() {
  const theme = useTheme()
  try {
    const { activeTheme } = theme
    return activeTheme
  } catch {
    // Fallback when outside ThemeProvider (e.g. during splash)
    return 'light' as const
  }
}
