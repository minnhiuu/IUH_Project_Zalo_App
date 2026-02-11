/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand colors matching web
        brand: {
          blue: '#0190f3',
          'blue-dark': '#005ae0',
          'blue-light': '#e8f3ff',
          navy: '#081b3a',
          'gray-100': '#f1f2f4',
          'gray-200': '#ececf0',
          'gray-400': '#8c8c8c',
          'gray-500': '#555555',
          red: '#e53838'
        },
        // Primary colors matching web
        primary: {
          DEFAULT: '#0068ff',
          foreground: '#ffffff',
          hover: '#005ae0',
          50: '#e8f3ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0068ff',
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433'
        },
        vibrant: {
          blue: '#0190f3',
          hover: '#0184e0'
        },
        // Secondary colors
        secondary: {
          DEFAULT: '#e8f3ff',
          foreground: '#0190f3'
        },
        // Background colors
        background: '#ffffff',
        foreground: 'rgba(0, 0, 0, 0.88)',
        // Card colors
        card: {
          DEFAULT: '#ffffff',
          foreground: 'rgba(0, 0, 0, 0.88)'
        },
        // Popover
        popover: {
          DEFAULT: '#ffffff',
          foreground: 'rgba(0, 0, 0, 0.88)'
        },
        // Muted
        muted: {
          DEFAULT: '#f1f2f4',
          foreground: '#555555'
        },
        // Accent
        accent: {
          DEFAULT: '#f1f2f4',
          foreground: 'rgba(0, 0, 0, 0.88)'
        },
        // Destructive
        destructive: {
          DEFAULT: '#e53838',
          foreground: '#ffffff'
        },
        // Border and input
        border: '#ececf0',
        input: '#ececf0',
        ring: '#0190f3',
        // Status colors
        success: '#00C853',
        warning: '#FFB300',
        error: '#e53838',
        info: '#2196F3',
        // Other
        divider: '#ececf0',
        online: '#4CAF50',
        offline: '#9E9E9E',
        overlay: 'rgba(0, 0, 0, 0.5)'
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif']
      },
      fontSize: {
        '2xs': '10px',
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px'
      },
      spacing: {
        'safe-top': 'var(--safe-area-inset-top)',
        'safe-bottom': 'var(--safe-area-inset-bottom)'
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
        message: '18px',
        avatar: '9999px'
      }
    }
  },
  plugins: []
}
