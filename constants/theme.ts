/**
 * ZALO THEME — Single Source of Truth
 *
 * Architecture:
 *  • Color tokens defined ONCE here as CSS-variable maps (light + dark).
 *  • GluestackProvider imports these maps → NativeWind vars() on native.
 *  • global.css mirrors the same values for TailwindCSS on web.
 *  • tailwind.config.js references var(--color-*) so Tailwind classes
 *    like `bg-background`, `text-foreground` auto-switch with theme.
 *  • RN StyleSheet consumers use the compat helpers (SEMANTIC / DARK_MODE).
 *
 * 👉 When adding a new color: add it to lightTokens + darkTokens here,
 *    then add the matching CSS var in global.css and tailwind.config.js.
 */

// ────────────────────────────────────────────────────────────
// 1. BRAND — Static palette (never changes between themes)
// ────────────────────────────────────────────────────────────
export const BRAND = {
  blue: '#0068FF',
  blueDark: '#005AE0',
  blueLight: '#E5F1FF',
  blueHover: '#C7E0FF',
  blueText: '#0045AD',
  white: '#FFFFFF',
  black: '#000000',
} as const

// ────────────────────────────────────────────────────────────
// 2. STATUS — Static status colors
// ────────────────────────────────────────────────────────────
export const STATUS = {
  success: '#00C853',
  warning: '#FFB300',
  error: '#E53838',
  info: '#0068FF',
} as const

// ────────────────────────────────────────────────────────────
// 3. HEADER — Fixed header configuration
// ────────────────────────────────────────────────────────────
export const HEADER = {
  height: 56,
  paddingHorizontal: 16,
  paddingVertical: 12,
  backgroundColor: BRAND.blueDark,
  textColor: BRAND.white,
  searchPlaceholderColor: 'rgba(255, 255, 255, 0.8)',
  iconSize: { search: 22, qr: 24, add: 30, settings: 26, back: 28 },
} as const

// ────────────────────────────────────────────────────────────
// 4. COLOR TOKENS — Light & Dark  ★ Single Source of Truth ★
//    Keys are CSS variable names → values are hex colors.
//    GluestackProvider passes these directly to NativeWind vars().
// ────────────────────────────────────────────────────────────

export const lightTokens = {
  // Primary
  '--color-primary': '#0068FF',
  '--color-primary-foreground': '#FFFFFF',
  '--color-primary-hover': '#005AE0',

  // Background
  '--color-background': '#FFFFFF',
  '--color-background-secondary': '#F1F2F4',

  // Foreground
  '--color-foreground': '#081B3A',

  // Secondary
  '--color-secondary': '#EBECF0',
  '--color-secondary-foreground': '#081B3A',
  '--color-secondary-hover': '#C6CAD2',

  // Muted
  '--color-muted': '#F1F2F4',
  '--color-muted-foreground': '#5A6981',

  // Accent
  '--color-accent': '#F1F2F4',
  '--color-accent-foreground': '#081B3A',
  '--color-accent-hover': '#E5E7EB',

  // Border / Input / Ring
  '--color-border': '#DBDBDB',
  '--color-input': '#DBDBDB',
  '--color-ring': '#0068FF',

  // Card
  '--color-card': '#FFFFFF',
  '--color-card-foreground': '#081B3A',

  // Popover
  '--color-popover': '#FFFFFF',
  '--color-popover-foreground': '#081B3A',

  // Destructive
  '--color-destructive': '#E53838',
  '--color-destructive-foreground': '#FFFFFF',

  // Divider / Disabled
  '--color-divider': '#F1F2F4',
  '--color-disabled': '#8B96A7',

  // Icons
  '--color-icon-muted': '#9FACBC',
  '--color-icon-hover': '#66A6FF',
  '--color-icon-secondary': '#5A6981',

  // Sidebar
  '--color-sidebar': '#005AE0',
  '--color-sidebar-foreground': '#FFFFFF',
  '--color-sidebar-primary': '#FFFFFF',
  '--color-sidebar-primary-foreground': '#005AE0',
  '--color-sidebar-accent': 'rgba(255,255,255,0.2)',
  '--color-sidebar-accent-foreground': '#FFFFFF',
  '--color-sidebar-border': 'rgba(255,255,255,0.1)',
  '--color-sidebar-ring': '#0068FF',

  // Typography scale (for Gluestack UI v4 components)
  '--color-typography-0': '#FFFFFF',
  '--color-typography-50': '#F2F2F2',
  '--color-typography-100': '#E5E5E5',
  '--color-typography-200': '#CCCCCC',
  '--color-typography-300': '#B3B3B3',
  '--color-typography-400': '#999999',
  '--color-typography-500': '#808080',
  '--color-typography-600': '#666666',
  '--color-typography-700': '#4D4D4D',
  '--color-typography-800': '#333333',
  '--color-typography-900': '#171717',
  '--color-typography-950': '#000000',
} as const

export const darkTokens = {
  // Primary
  '--color-primary': '#0068FF',
  '--color-primary-foreground': '#FFFFFF',
  '--color-primary-hover': '#005AE0',

  // Background
  '--color-background': '#22262B',
  '--color-background-secondary': '#2C323A',

  // Foreground
  '--color-foreground': '#DFE2E7',

  // Secondary
  '--color-secondary': '#2C323A',
  '--color-secondary-foreground': '#DFE2E7',
  '--color-secondary-hover': '#38404A',

  // Muted
  '--color-muted': '#3E444A',
  '--color-muted-foreground': '#B6C1CF',

  // Accent
  '--color-accent': '#3E444A',
  '--color-accent-foreground': '#FFFFFF',
  '--color-accent-hover': '#3E444A',

  // Border / Input / Ring
  '--color-border': 'rgba(255,255,255,0.1)',
  '--color-input': '#1A1D21',
  '--color-ring': '#0068FF',

  // Card
  '--color-card': '#22262B',
  '--color-card-foreground': '#FFFFFF',

  // Popover
  '--color-popover': '#22262B',
  '--color-popover-foreground': '#FFFFFF',

  // Destructive
  '--color-destructive': '#E53838',
  '--color-destructive-foreground': '#FFFFFF',

  // Divider / Disabled
  '--color-divider': '#121416',
  '--color-disabled': '#8B96A7',

  // Icons
  '--color-icon-muted': '#9FACBC',
  '--color-icon-hover': '#66A6FF',
  '--color-icon-secondary': '#5A6981',

  // Sidebar
  '--color-sidebar': '#121416',
  '--color-sidebar-foreground': '#FFFFFF',
  '--color-sidebar-primary': '#FFFFFF',
  '--color-sidebar-primary-foreground': '#121416',
  '--color-sidebar-accent': 'rgba(255,255,255,0.1)',
  '--color-sidebar-accent-foreground': '#FFFFFF',
  '--color-sidebar-border': 'rgba(255,255,255,0.05)',
  '--color-sidebar-ring': '#0068FF',

  // Typography scale (inverted for dark mode)
  '--color-typography-0': '#000000',
  '--color-typography-50': '#171717',
  '--color-typography-100': '#333333',
  '--color-typography-200': '#4D4D4D',
  '--color-typography-300': '#666666',
  '--color-typography-400': '#808080',
  '--color-typography-500': '#999999',
  '--color-typography-600': '#B3B3B3',
  '--color-typography-700': '#CCCCCC',
  '--color-typography-800': '#E5E5E5',
  '--color-typography-900': '#F2F2F2',
  '--color-typography-950': '#FFFFFF',
} as const

// Token map type — uses shared key set with string values (not literal types)
export type TokenKey = keyof typeof lightTokens
export type TokenMap = Record<TokenKey, string>

// ────────────────────────────────────────────────────────────
// 5. HELPERS — Extract values from token maps
// ────────────────────────────────────────────────────────────

/** Pick a raw hex value from a token map by its CSS variable key */
function t(map: TokenMap, key: TokenKey): string {
  return map[key]
}

// ────────────────────────────────────────────────────────────
// 6. SEMANTIC / DARK_MODE — Derived RN-style color objects
//    For components that need inline style={{ color: X }}.
//    Every value comes from the token maps above — no duplication.
// ────────────────────────────────────────────────────────────

export const SEMANTIC = {
  // Backgrounds
  background: t(lightTokens, '--color-background'),
  backgroundSecondary: t(lightTokens, '--color-background-secondary'),

  // Text
  foreground: t(lightTokens, '--color-foreground'),
  textPrimary: t(lightTokens, '--color-foreground'),
  textSecondary: t(lightTokens, '--color-muted-foreground'),
  textDisabled: t(lightTokens, '--color-disabled'),

  // Primary
  primary: t(lightTokens, '--color-primary'),
  primaryHover: t(lightTokens, '--color-primary-hover'),
  primaryForeground: t(lightTokens, '--color-primary-foreground'),

  // Secondary
  secondary: t(lightTokens, '--color-secondary'),
  secondaryForeground: t(lightTokens, '--color-secondary-foreground'),
  secondaryHover: t(lightTokens, '--color-secondary-hover'),

  // Muted
  muted: t(lightTokens, '--color-muted'),
  mutedForeground: t(lightTokens, '--color-muted-foreground'),

  // Accent
  accent: t(lightTokens, '--color-accent'),
  accentForeground: t(lightTokens, '--color-accent-foreground'),

  // Border / Input
  border: t(lightTokens, '--color-border'),
  input: t(lightTokens, '--color-input'),
  ring: t(lightTokens, '--color-ring'),

  // Divider
  divider: t(lightTokens, '--color-divider'),

  // Icons
  iconMuted: t(lightTokens, '--color-icon-muted'),
  iconHover: t(lightTokens, '--color-icon-hover'),
  iconSecondary: t(lightTokens, '--color-icon-secondary'),

  // Status
  destructive: STATUS.error,
  destructiveForeground: '#FFFFFF',
  success: STATUS.success,
  warning: STATUS.warning,
  error: STATUS.error,
  info: STATUS.info,
} as const

export const DARK_MODE = {
  // Backgrounds
  background: t(darkTokens, '--color-background'),
  backgroundSecondary: t(darkTokens, '--color-background-secondary'),

  // Text
  foreground: t(darkTokens, '--color-foreground'),
  textPrimary: t(darkTokens, '--color-foreground'),
  textSecondary: t(darkTokens, '--color-muted-foreground'),
  textDisabled: t(darkTokens, '--color-disabled'),

  // Primary
  primary: t(darkTokens, '--color-primary'),
  primaryHover: t(darkTokens, '--color-primary-hover'),
  primaryForeground: t(darkTokens, '--color-primary-foreground'),

  // Secondary
  secondary: t(darkTokens, '--color-secondary'),
  secondaryForeground: t(darkTokens, '--color-secondary-foreground'),
  secondaryHover: t(darkTokens, '--color-secondary-hover'),

  // Muted
  muted: t(darkTokens, '--color-muted'),
  mutedForeground: t(darkTokens, '--color-muted-foreground'),

  // Accent
  accent: t(darkTokens, '--color-accent'),
  accentForeground: t(darkTokens, '--color-accent-foreground'),

  // Border / Input
  border: t(darkTokens, '--color-border'),
  input: t(darkTokens, '--color-input'),
  ring: t(darkTokens, '--color-ring'),

  // Divider
  divider: t(darkTokens, '--color-divider'),

  // Icons
  iconMuted: t(darkTokens, '--color-icon-muted'),
  iconHover: t(darkTokens, '--color-icon-hover'),
  iconSecondary: t(darkTokens, '--color-icon-secondary'),

  // Status (same in dark)
  destructive: STATUS.error,
  destructiveForeground: '#FFFFFF',
  success: STATUS.success,
  warning: STATUS.warning,
  error: STATUS.error,
  info: STATUS.info,
} as const

// ────────────────────────────────────────────────────────────
// 7. Colors — Quick-access light/dark map for useThemeColor()
// ────────────────────────────────────────────────────────────

export const Colors = {
  light: {
    text: SEMANTIC.textPrimary,
    textSecondary: SEMANTIC.textSecondary,
    background: SEMANTIC.background,
    backgroundSecondary: SEMANTIC.backgroundSecondary,
    tint: SEMANTIC.primary,
    border: SEMANTIC.border,
    divider: SEMANTIC.divider,
    icon: SEMANTIC.iconSecondary,
    iconMuted: SEMANTIC.iconMuted,
    tabIconDefault: SEMANTIC.mutedForeground,
    tabIconSelected: SEMANTIC.primary,
  },
  dark: {
    text: DARK_MODE.textPrimary,
    textSecondary: DARK_MODE.textSecondary,
    background: DARK_MODE.background,
    backgroundSecondary: DARK_MODE.backgroundSecondary,
    tint: DARK_MODE.primary,
    border: DARK_MODE.border,
    divider: DARK_MODE.divider,
    icon: DARK_MODE.iconSecondary,
    iconMuted: DARK_MODE.iconMuted,
    tabIconDefault: DARK_MODE.mutedForeground,
    tabIconSelected: DARK_MODE.primary,
  },
} as const

// ────────────────────────────────────────────────────────────
// 8. LAYOUT TOKENS — Spacing, Radius, Shadows
// ────────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const

export const Shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
} as const

// ────────────────────────────────────────────────────────────
// 9. COMPOSITE THEME OBJECT — For ThemeProvider context
// ────────────────────────────────────────────────────────────

export const ZaloTheme = {
  colors: { brand: BRAND, status: STATUS, light: Colors.light, dark: Colors.dark },
  header: HEADER,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
} as const

export type Theme = typeof ZaloTheme

export default ZaloTheme

