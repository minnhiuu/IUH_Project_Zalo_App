import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'

// Auth feature translations
import en from './locales/en.json'
import vi from './locales/vi.json'

const authI18n = i18n.createInstance()

authI18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  fallbackLng: 'en',
  lng: getLocales()[0]?.languageCode || 'vi',
  debug: false,

  resources: {
    en: { translation: en },
    vi: { translation: vi }
  },

  interpolation: {
    escapeValue: false
  },

  react: {
    useSuspense: false
  }
})

export default authI18n
