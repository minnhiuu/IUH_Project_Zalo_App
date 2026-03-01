/**
 * Theme configuration for Zalo Clone App
 * Colors match web design system from index.css
 * Design follows official Zalo brand guidelines
 */

// ==================== BRAND COLORS ====================
// Official Zalo brand palette matching web app (index.css :root)
export const BRAND = {
  // Primary Blues (synced with web --brand-*)
  blue: '#0068FF', // --brand-blue
  blueDark: '#005AE0', // --brand-blue-dark
  blueLight: '#E5F1FF', // --brand-blue-light
  blueHover: '#C7E0FF', // --brand-blue-hover
  blueText: '#0045AD', // --brand-blue-text

  // Secondary
  navy: '#081B3A', // --foreground (web uses as foreground)
  primary: '#0068FF', // --primary
  vibrantBlue: '#0068FF', // --vibrant-blue (same as primary in web light)

  // Grays
  gray100: '#F1F2F4', // --muted
  gray200: '#EBECF0', // --secondary (web)
  gray400: '#5A6981', // --muted-foreground (web)
  gray500: '#081B3A', // --secondary-foreground (web)

  // Status
  red: '#E53838', // --destructive

  // White & Black
  white: '#FFFFFF',
  black: '#000000'
}

// ==================== HEADER CONFIGURATION ====================
// Fixed header dimensions for consistency across all screens
// Matches web sidebar color: #005ae0 (brand-blue-dark)
export const HEADER = {
  height: 56, // Standard header height (excluding SafeArea)
  paddingHorizontal: 16, // px-4
  paddingVertical: 12, // py-3
  backgroundColor: BRAND.blueDark, // #005ae0 - Matches web sidebar
  textColor: BRAND.white,
  searchPlaceholderColor: 'rgba(255, 255, 255, 0.8)',
  iconSize: {
    search: 22,
    qr: 24,
    add: 30,
    settings: 26,
    back: 28
  }
}

// ==================== SEMANTIC COLORS ====================
// Mapped to web CSS variables from index.css :root
export const SEMANTIC = {
  // Backgrounds (web: --background, --muted)
  background: '#FFFFFF', // --background
  backgroundSecondary: '#F1F2F4', // --muted

  // Text (web: --foreground, --muted-foreground)
  foreground: '#081B3A', // --foreground
  textPrimary: '#081B3A', // --foreground
  textSecondary: '#5A6981', // --muted-foreground
  textTertiary: '#5A6981', // --muted-foreground (lighter usage)
  textDisabled: '#8B96A7', // --disabled

  // Primary Actions (web: --primary, --primary-hover)
  primary: '#0068FF', // --primary
  primaryHover: '#005AE0', // --primary-hover
  primaryForeground: '#FFFFFF', // --primary-foreground

  // Vibrant (web: --vibrant-blue)
  vibrantBlue: '#0068FF', // --vibrant-blue (light mode)
  vibrantBlueHover: '#005AE0', // --vibrant-blue-hover

  // Secondary (web: --secondary, --secondary-foreground)
  secondary: '#EBECF0', // --secondary
  secondaryForeground: '#081B3A', // --secondary-foreground
  secondaryHover: '#C6CAD2', // --secondary-hover

  // Muted (web: --muted, --muted-foreground)
  muted: '#F1F2F4', // --muted
  mutedForeground: '#5A6981', // --muted-foreground

  // Accent (web: --accent, --accent-foreground)
  accent: '#F1F2F4', // --accent
  accentForeground: '#081B3A', // --accent-foreground
  accentHover: '#E5E7EB', // --accent-hover

  // Borders & Input (web: --border, --input, --ring)
  border: '#DBDBDB', // --border
  input: '#DBDBDB', // --input
  ring: '#0068FF', // --ring

  // Section Divider
  sectionDivider: '#F1F2F4', // --section-divider

  // Icons (web: --icon-*)
  iconMuted: '#9FACBC', // --icon-muted
  iconHover: '#66A6FF', // --icon-hover
  iconSecondary: '#5A6981', // --icon-secondary

  // Status Colors
  success: '#00C853',
  warning: '#FFB300',
  error: '#E53838',
  destructive: '#E53838', // --destructive
  destructiveForeground: '#FFFFFF', // --destructive-foreground
  info: '#0068FF'
}

// ==================== DARK MODE COLORS ====================
// Synced with web index.css .dark variables
export const DARK_MODE = {
  background: '#22262B', // --background (dark)
  backgroundSecondary: '#2C323A', // --secondary (dark)
  foreground: '#DFE2E7', // --foreground (dark)

  textPrimary: '#DFE2E7', // --foreground (dark)
  textSecondary: '#B6C1CF', // --muted-foreground (dark)
  textTertiary: '#B6C1CF', // --muted-foreground (dark)
  textDisabled: '#8B96A7', // --disabled

  primary: '#0068FF', // --primary (dark)
  primaryHover: '#005AE0', // --primary-hover (dark)
  primaryForeground: '#FFFFFF', // --primary-foreground

  vibrantBlue: '#0068FF', // --vibrant-blue (dark)
  vibrantBlueHover: '#005AE0', // --vibrant-blue-hover (dark)

  secondary: '#2C323A', // --secondary (dark)
  secondaryForeground: '#DFE2E7', // --secondary-foreground (dark)
  secondaryHover: '#38404A', // --secondary-hover (dark)

  muted: '#3E444A', // --muted (dark)
  mutedForeground: '#B6C1CF', // --muted-foreground (dark)

  accent: '#3E444A', // --accent (dark)
  accentForeground: '#FFFFFF', // --accent-foreground (dark)
  accentHover: '#3E444A', // --accent-hover (dark)

  border: 'rgba(255, 255, 255, 0.1)', // --border (dark)
  input: '#1A1D21', // --input (dark)
  ring: '#0068FF', // --ring (dark)
  divider: '#121416', // --section-divider (dark)

  card: '#22262B', // --card (dark)
  cardForeground: '#FFFFFF', // --card-foreground (dark)

  // Sidebar (dark)
  sidebar: '#121416', // --sidebar (dark)
  sidebarForeground: '#FFFFFF', // --sidebar-foreground (dark)

  // Icons
  iconMuted: '#9FACBC', // --icon-muted (dark)
  iconHover: '#66A6FF', // --icon-hover (dark)
  iconSecondary: '#5A6981' // --icon-secondary (dark)
}

// ==================== COMPONENT-SPECIFIC COLORS ====================
// Colors for specific Zalo UI components
export const COMPONENT = {
  // Bottom Tab Navigation
  tab: {
    active: '#0068FF', // --primary
    inactive: '#5A6981', // --muted-foreground
    background: '#FFFFFF', // --background
    border: '#DBDBDB' // --border
  },

  // Message Bubbles
  message: {
    sent: '#0068FF', // --primary
    sentText: '#FFFFFF',
    received: '#F1F2F4', // --muted
    receivedText: '#081B3A', // --foreground
    timestamp: '#5A6981' // --muted-foreground
  },

  // Online Status
  status: {
    online: '#00C853',
    offline: '#5A6981', // --muted-foreground
    away: '#FFB300'
  },

  // Sidebar (matching web --sidebar-*)
  sidebar: {
    background: '#005AE0', // --sidebar
    foreground: '#FFFFFF', // --sidebar-foreground
    primary: '#FFFFFF', // --sidebar-primary
    primaryForeground: '#005AE0', // --sidebar-primary-foreground
    accent: 'rgba(255, 255, 255, 0.2)', // --sidebar-accent
    accentForeground: '#FFFFFF', // --sidebar-accent-foreground
    border: 'rgba(255, 255, 255, 0.1)', // --sidebar-border
    ring: '#0068FF' // --sidebar-ring
  },

  // Buttons
  button: {
    primary: '#0068FF', // --primary
    primaryHover: '#005AE0', // --primary-hover
    primaryDisabled: 'rgba(0, 104, 255, 0.4)', // --primary with opacity
    secondary: '#EBECF0', // --secondary
    secondaryText: '#081B3A', // --secondary-foreground
    secondaryHover: '#C6CAD2' // --secondary-hover
  },

  // Input Fields
  input: {
    background: '#FFFFFF', // --background
    border: '#DBDBDB', // --border / --input
    borderFocus: '#0068FF', // --ring
    placeholder: '#5A6981', // --muted-foreground
    disabled: '#F1F2F4' // --muted
  },

  // Cards & Containers
  card: {
    background: '#FFFFFF', // --card
    foreground: '#081B3A', // --card-foreground
    border: '#DBDBDB', // --border
    shadow: 'rgba(0, 0, 0, 0.08)'
  },

  // Popover
  popover: {
    background: '#FFFFFF', // --popover
    foreground: '#081B3A' // --popover-foreground
  },

  // QR Scanner
  qr: {
    overlay: 'rgba(0, 0, 0, 0.7)',
    frame: '#0068FF', // --primary
    success: '#00C853',
    error: '#E53838' // --destructive
  }
}

// ==================== UTILITY FUNCTIONS ====================
export const Colors = {
  light: {
    text: SEMANTIC.textPrimary,
    textSecondary: SEMANTIC.textSecondary,
    textTertiary: SEMANTIC.textTertiary,
    background: SEMANTIC.background,
    backgroundSecondary: SEMANTIC.backgroundSecondary,
    tint: SEMANTIC.primary,
    border: SEMANTIC.border,
    divider: SEMANTIC.sectionDivider,
    icon: SEMANTIC.iconSecondary,
    iconMuted: SEMANTIC.iconMuted,
    iconHover: SEMANTIC.iconHover,
    tabIconDefault: COMPONENT.tab.inactive,
    tabIconSelected: COMPONENT.tab.active
  },
  dark: {
    text: DARK_MODE.textPrimary,
    textSecondary: DARK_MODE.textSecondary,
    textTertiary: DARK_MODE.textTertiary,
    background: DARK_MODE.background,
    backgroundSecondary: DARK_MODE.backgroundSecondary,
    tint: DARK_MODE.primary,
    border: DARK_MODE.border,
    divider: DARK_MODE.divider,
    icon: DARK_MODE.iconSecondary,
    iconMuted: DARK_MODE.iconMuted,
    iconHover: DARK_MODE.iconHover,
    tabIconDefault: DARK_MODE.mutedForeground,
    tabIconSelected: DARK_MODE.primary
  }
}

// Font Configuration
export const Fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System'
}

// Spacing Scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
}

// Border Radius Scale
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999
}

// Shadow Styles
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  }
}

// ==================== COMPLETE THEME OBJECT ====================
// Single source of truth for all app styling
export const ZaloTheme = {
  colors: {
    // Brand colors
    brand: BRAND,
    // Semantic colors
    semantic: SEMANTIC,
    // Dark mode colors
    darkMode: DARK_MODE,
    // Component colors
    component: COMPONENT,
    // Light/Dark modes for useColorScheme()
    light: Colors.light,
    dark: Colors.dark
  },
  header: HEADER,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  fonts: Fonts
} as const

// Type for theme
export type Theme = typeof ZaloTheme

// Default export for easy importing
export default ZaloTheme

