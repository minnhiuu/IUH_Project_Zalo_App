/**
 * Theme configuration for Zalo Clone App
 * Colors match web design system from index.css
 * Design follows official Zalo brand guidelines
 */

// ==================== BRAND COLORS ====================
// Official Zalo brand palette matching web app
export const BRAND = {
  // Primary Blues
  blue: '#0190F3',           // brand-blue - Main brand color
  blueDark: '#005AE0',       // brand-blue-dark - Darker variant
  blueLight: '#E8F3FF',      // brand-blue-light - Light backgrounds
  
  // Secondary
  navy: '#081B3A',           // brand-navy - Dark text/headers
  primary: '#0068FF',        // primary - Primary actions/buttons
  vibrantBlue: '#0190F3',    // vibrant-blue - Accent color
  
  // Grays
  gray100: '#F1F2F4',        // brand-gray-100 - Light backgrounds
  gray200: '#ECECF0',        // brand-gray-200 - Borders/dividers
  gray400: '#8C8C8C',        // brand-gray-400 - Secondary text
  gray500: '#555555',        // brand-gray-500 - Dark secondary text
  
  // Status
  red: '#E53838',            // brand-red - Error/destructive actions
  
  // White & Black
  white: '#FFFFFF',
  black: '#000000',
};

// ==================== SEMANTIC COLORS ====================
// Mapped to Shadcn UI semantic tokens from web
export const SEMANTIC = {
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F1F2F4',
  
  // Text
  foreground: 'rgba(0, 0, 0, 0.88)',
  textPrimary: 'rgba(0, 0, 0, 0.88)',
  textSecondary: '#555555',
  textTertiary: '#8C8C8C',
  textDisabled: 'rgba(0, 0, 0, 0.38)',
  
  // Primary Actions
  primary: '#0068FF',
  primaryHover: '#005AE0',
  primaryForeground: '#FFFFFF',
  
  // Vibrant (for emphasis)
  vibrantBlue: '#0190F3',
  vibrantBlueHover: '#0184E0',
  
  // Secondary
  secondary: '#E8F3FF',
  secondaryForeground: '#0190F3',
  
  // Muted
  muted: '#F1F2F4',
  mutedForeground: '#555555',
  
  // Accent
  accent: '#F1F2F4',
  accentForeground: 'rgba(0, 0, 0, 0.88)',
  
  // Borders & Input
  border: '#ECECF0',
  input: '#ECECF0',
  ring: '#0190F3',
  
  // Status Colors
  success: '#00C853',
  warning: '#FFB300',
  error: '#E53838',
  destructive: '#E53838',
  destructiveForeground: '#FFFFFF',
  info: '#0190F3',
};

// ==================== DARK MODE COLORS ====================
export const DARK_MODE = {
  background: '#0F1419',      // Navy black (oklch(0.15 0.05 260))
  backgroundSecondary: '#1A1F29',
  foreground: '#FFFFFF',
  
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  
  primary: '#0190F3',
  primaryHover: '#005AE0',
  primaryForeground: '#FFFFFF',
  
  border: 'rgba(255, 255, 255, 0.1)',
  divider: 'rgba(255, 255, 255, 0.05)',
  
  card: '#1A1F29',
  cardForeground: '#FFFFFF',
};

// ==================== COMPONENT-SPECIFIC COLORS ====================
// Colors for specific Zalo UI components
export const COMPONENT = {
  // Bottom Tab Navigation
  tab: {
    active: '#0068FF',
    inactive: '#8C8C8C',
    background: '#FFFFFF',
    border: '#ECECF0',
  },
  
  // Message Bubbles
  message: {
    sent: '#0068FF',          // User's messages (blue)
    sentText: '#FFFFFF',
    received: '#F1F2F4',      // Other's messages (gray)
    receivedText: 'rgba(0, 0, 0, 0.88)',
    timestamp: '#8C8C8C',
  },
  
  // Online Status
  status: {
    online: '#00C853',
    offline: '#8C8C8C',
    away: '#FFB300',
  },
  
  // Sidebar (matching web)
  sidebar: {
    background: '#005AE0',
    foreground: '#FFFFFF',
    primary: '#FFFFFF',
    primaryForeground: '#005AE0',
    accent: 'rgba(0, 0, 0, 0.25)',
    accentForeground: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Buttons
  button: {
    primary: '#0068FF',
    primaryHover: '#005AE0',
    primaryDisabled: 'rgba(1, 144, 243, 0.4)',
    secondary: '#E8F3FF',
    secondaryText: '#0190F3',
  },
  
  // Input Fields
  input: {
    background: '#FFFFFF',
    border: '#ECECF0',
    borderFocus: '#0068FF',
    placeholder: '#8C8C8C',
    disabled: '#F1F2F4',
  },
  
  // Cards & Containers
  card: {
    background: '#FFFFFF',
    border: '#ECECF0',
    shadow: 'rgba(0, 0, 0, 0.08)',
  },
  
  // QR Scanner
  qr: {
    overlay: 'rgba(0, 0, 0, 0.7)',
    frame: '#0068FF',
    success: '#00C853',
    error: '#E53838',
  },
};

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
    divider: SEMANTIC.border,
    icon: SEMANTIC.textSecondary,
    tabIconDefault: COMPONENT.tab.inactive,
    tabIconSelected: COMPONENT.tab.active,
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
    icon: DARK_MODE.textSecondary,
    tabIconDefault: DARK_MODE.textTertiary,
    tabIconSelected: DARK_MODE.primary,
  },
};

// Font Configuration
export const Fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

// Spacing Scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius Scale
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Shadow Styles
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
