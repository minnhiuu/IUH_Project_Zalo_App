// Re-export a hook that returns the user-selected color scheme
// driven by ThemeProvider (light | dark | system)
import { useTheme } from '@/context'

export function useColorScheme() {
  try {
    const { activeTheme } = useTheme()
    return activeTheme
  } catch {
    // Fallback when outside ThemeProvider (e.g. during splash)
    return 'light' as const
  }
}
