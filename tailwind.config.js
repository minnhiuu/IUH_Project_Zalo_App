/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Zalo primary colors
        primary: {
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
        },
        // Secondary colors
        secondary: {
          DEFAULT: '#7B61FF',
          light: '#9D8AFF',
          dark: '#5A3FD6',
        },
        // Background colors
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F5F5',
          tertiary: '#EBEBEB',
        },
        // Text colors
        text: {
          DEFAULT: '#1A1A1A',
          secondary: '#666666',
          tertiary: '#999999',
          light: '#FFFFFF',
        },
        // Status colors
        success: '#00C853',
        warning: '#FFB300',
        error: '#FF3B30',
        info: '#2196F3',
        // Other
        border: '#E0E0E0',
        divider: '#F0F0F0',
        online: '#4CAF50',
        offline: '#9E9E9E',
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
      fontSize: {
        '2xs': '10px',
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
      },
      spacing: {
        'safe-top': 'var(--safe-area-inset-top)',
        'safe-bottom': 'var(--safe-area-inset-bottom)',
      },
      borderRadius: {
        'message': '18px',
        'avatar': '9999px',
      },
    },
  },
  plugins: [],
}

