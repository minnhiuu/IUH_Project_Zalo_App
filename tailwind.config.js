/** @type {import('tailwindcss').Config} */
const gluestackPlugin = require("@gluestack-ui/nativewind-utils/tailwind-plugin");

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
        // Zalo Colors - synced with web index.css :root
        brand: {
          blue: '#0068ff', // --brand-blue
          'blue-dark': '#005ae0', // --brand-blue-dark
          'blue-light': '#e5f1ff', // --brand-blue-light
          'blue-hover': '#c7e0ff', // --brand-blue-hover
          'blue-text': '#0045ad', // --brand-blue-text
          navy: '#081b3a', // --foreground
          gray: {
            100: '#f1f2f4', // --muted
            200: '#ebecf0', // --secondary
            400: '#5a6981', // --muted-foreground
            500: '#081b3a', // --secondary-foreground
          },
          red: '#e53838' // --destructive
        },
        primary: {
          DEFAULT: '#0068ff', // --primary
          50: '#e5f1ff', // --brand-blue-light
          100: '#c7e0ff', // --brand-blue-hover
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0068ff',
          600: '#005ae0', // --primary-hover
          700: '#0045ad', // --brand-blue-text
          800: '#002966',
          900: '#001433',
          foreground: '#ffffff',
          hover: '#005ae0',
        },
        // Thêm typography để tương thích với các component Gluestack v2
        typography: {
          0: '#ffffff',
          50: '#f2f2f2',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4d4d4d',
          800: '#333333',
          900: '#171717',
          950: '#000000',
        },
        // Giữ nguyên các màu khác của bạn...
        success: '#00C853',
        warning: '#FFB300',
        error: '#e53838',
        info: '#0068ff',

        // Semantic tokens matching web
        background: '#ffffff',
        foreground: '#081b3a',
        secondary: {
          DEFAULT: '#ebecf0',
          foreground: '#081b3a',
          hover: '#c6cad2',
        },
        muted: {
          DEFAULT: '#f1f2f4',
          foreground: '#5a6981',
        },
        accent: {
          DEFAULT: '#f1f2f4',
          foreground: '#081b3a',
          hover: '#e5e7eb',
        },
        border: '#dbdbdb',
        input: '#dbdbdb',
        ring: '#0068ff',
        destructive: {
          DEFAULT: '#e53838',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#081b3a',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#081b3a',
        },
        sidebar: {
          DEFAULT: '#005ae0',
          foreground: '#ffffff',
          primary: '#ffffff',
          'primary-foreground': '#005ae0',
          accent: 'rgba(255, 255, 255, 0.2)',
          'accent-foreground': '#ffffff',
          border: 'rgba(255, 255, 255, 0.1)',
          ring: '#0068ff',
        },
        disabled: '#8b96a7',
      },
      fontFamily: {
        // NativeWind v4 ưu tiên tên font hệ thống trên Mobile
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        heading: ['Roboto', 'system-ui', 'sans-serif'], // Thêm font-heading cho Heading component
      },
      // Các config khác giữ nguyên...
      spacing: {
        'safe-top': 'var(--safe-area-inset-top)',
        'safe-bottom': 'var(--safe-area-inset-bottom)'
      },
    }
  },
  plugins: [gluestackPlugin]
}