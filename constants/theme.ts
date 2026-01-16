/**
 * Theme configuration for Zalo Clone App
 * Colors follow Zalo's design system
 */

// Primary Colors - Zalo Blue
export const PRIMARY = {
  DEFAULT: '#0068FF',
  50: '#E6F0FF',
  100: '#CCE0FF',
  200: '#99C2FF',
  300: '#66A3FF',
  400: '#3385FF',
  500: '#0068FF',
  600: '#0052CC',
  700: '#003D99',
  800: '#002966',
  900: '#001433',
};

// Neutral Colors
export const NEUTRAL = {
  white: '#FFFFFF',
  black: '#000000',
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#EEEEEE',
  300: '#E0E0E0',
  400: '#BDBDBD',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

// Semantic Colors
export const SEMANTIC = {
  success: '#00C853',
  warning: '#FFB300',
  error: '#FF3B30',
  info: '#2196F3',
};

// Theme Colors for Light/Dark mode
export const Colors = {
  light: {
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    tint: PRIMARY.DEFAULT,
    border: '#E0E0E0',
    divider: '#F0F0F0',
    icon: '#666666',
    tabIconDefault: '#999999',
    tabIconSelected: PRIMARY.DEFAULT,
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    background: '#1A1A1A',
    backgroundSecondary: '#2A2A2A',
    tint: PRIMARY[300],
    border: '#333333',
    divider: '#2A2A2A',
    icon: '#B0B0B0',
    tabIconDefault: '#808080',
    tabIconSelected: PRIMARY[300],
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
