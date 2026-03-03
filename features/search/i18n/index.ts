import i18n from '@/i18n'

// Import search feature translations
import en from './locales/en.json'
import vi from './locales/vi.json'

// Add search feature translations to the global i18n instance
i18n.addResourceBundle('en', 'translation', en, true, true)
i18n.addResourceBundle('vi', 'translation', vi, true, true)

export default i18n
