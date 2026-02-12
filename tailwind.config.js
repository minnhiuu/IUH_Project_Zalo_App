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
        // Zalo Colors
        brand: {
          blue: '#0190f3',
          'blue-dark': '#005ae0',
          'blue-light': '#e8f3ff',
          navy: '#081b3a',
          gray: {
            100: '#f1f2f4',
            200: '#ececf0',
            400: '#8c8c8c',
            500: '#555555',
          },
          red: '#e53838'
        },
        primary: {
          DEFAULT: '#0068ff',
          50: '#e8f3ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0068ff',
          600: '#0052cc',
          700: '#003d99',
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
        info: '#2196F3',
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