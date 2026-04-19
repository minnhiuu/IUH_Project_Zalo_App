/** @type {import('tailwindcss').Config} */
const gluestackPlugin = require('@gluestack-ui/nativewind-utils/tailwind-plugin')

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './node_modules/@gluestack-ui/nativewind-utils/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ==================== BRAND (static, no theme switch) ====================
        brand: {
          blue: '#0068ff',
          'blue-dark': '#005ae0',
          'blue-light': '#e5f1ff',
          'blue-hover': '#c7e0ff',
          'blue-text': '#0045ad',
          navy: '#081b3a',
          gray: {
            100: '#f1f2f4',
            200: '#ebecf0',
            400: '#5a6981',
            500: '#081b3a'
          },
          red: '#e53838'
        },

        // ==================== THEME-AWARE (CSS variable driven) ====================
        primary: {
          DEFAULT: 'var(--color-primary)',
          50: '#e5f1ff',
          100: '#c7e0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0068ff',
          600: '#005ae0',
          700: '#0045ad',
          800: '#002966',
          900: '#001433',
          foreground: 'var(--color-primary-foreground)',
          hover: 'var(--color-primary-hover)'
        },

        // Typography scale (theme-aware for Gluestack UI v4)
        typography: {
          0: 'var(--color-typography-0)',
          50: 'var(--color-typography-50)',
          100: 'var(--color-typography-100)',
          200: 'var(--color-typography-200)',
          300: 'var(--color-typography-300)',
          400: 'var(--color-typography-400)',
          500: 'var(--color-typography-500)',
          600: 'var(--color-typography-600)',
          700: 'var(--color-typography-700)',
          800: 'var(--color-typography-800)',
          900: 'var(--color-typography-900)',
          950: 'var(--color-typography-950)'
        },

        // Status colors (static)
        success: '#00C853',
        warning: '#FFB300',
        error: '#e53838',
        info: '#0068ff',

        // Semantic tokens (theme-aware via CSS variables)
        background: {
          DEFAULT: 'var(--color-background)',
          secondary: 'var(--color-background-secondary)'
        },
        foreground: 'var(--color-foreground)',
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
          hover: 'var(--color-secondary-hover)'
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)'
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
          hover: 'var(--color-accent-hover)'
        },
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        destructive: {
          DEFAULT: 'var(--color-destructive)',
          foreground: 'var(--color-destructive-foreground)'
        },
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)'
        },
        popover: {
          DEFAULT: 'var(--color-popover)',
          foreground: 'var(--color-popover-foreground)'
        },
        sidebar: {
          DEFAULT: 'var(--color-sidebar)',
          foreground: 'var(--color-sidebar-foreground)',
          primary: 'var(--color-sidebar-primary)',
          'primary-foreground': 'var(--color-sidebar-primary-foreground)',
          accent: 'var(--color-sidebar-accent)',
          'accent-foreground': 'var(--color-sidebar-accent-foreground)',
          border: 'var(--color-sidebar-border)',
          ring: 'var(--color-sidebar-ring)'
        },

        // Utility colors (theme-aware)
        disabled: 'var(--color-disabled)',
        divider: 'var(--color-divider)',
        icon: {
          muted: 'var(--color-icon-muted)',
          hover: 'var(--color-icon-hover)',
          secondary: 'var(--color-icon-secondary)'
        }
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        heading: ['Roboto', 'system-ui', 'sans-serif']
      },
      spacing: {
        'safe-top': 'var(--safe-area-inset-top)',
        'safe-bottom': 'var(--safe-area-inset-bottom)'
      }
    }
  },
  plugins: [gluestackPlugin]
}
