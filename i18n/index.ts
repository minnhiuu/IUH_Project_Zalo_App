import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import en from './locales/en.json'
import vi from './locales/vi.json'

// Define supported languages
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' }
} as const

export type LanguageCode = keyof typeof LANGUAGES

// Get device language
const getDeviceLanguage = (): LanguageCode => {
  const deviceLanguage = Localization.getLocales()[0]?.languageCode

  // Check if device language is supported, default to Vietnamese
  if (deviceLanguage && deviceLanguage in LANGUAGES) {
    return deviceLanguage as LanguageCode
  }

  return 'vi' // Default to Vietnamese
}

// Resources for i18n
const resources = {
  en: { translation: en },
  vi: { translation: vi }
}

// Initialize i18n
i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'vi',

  interpolation: {
    escapeValue: false // React already escapes values
  },

  // Namespace configuration
  defaultNS: 'translation',
  ns: ['translation'],

  // React-i18next configuration
  react: {
    useSuspense: false
  },

  // Compatibility for v4
  compatibilityJSON: 'v4'
})

// Helper function to change language
export const changeLanguage = async (languageCode: LanguageCode): Promise<void> => {
  await i18n.changeLanguage(languageCode)
}

// Helper function to get current language
export const getCurrentLanguage = (): LanguageCode => {
  return i18n.language as LanguageCode
}

// Helper to check if language is supported
export const isSupportedLanguage = (code: string): code is LanguageCode => {
  return code in LANGUAGES
}

export default i18n
