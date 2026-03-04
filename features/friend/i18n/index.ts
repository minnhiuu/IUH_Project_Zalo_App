import i18n from '@/i18n'

// Import friend feature translations
import en from './locales/en.json'
import vi from './locales/vi.json'

// Add friend feature translations to the global i18n instance
// This follows the convention of extending the global namespace
// so that `useTranslation()` can access `t('friend.xxx')` keys
i18n.addResourceBundle('en', 'translation', en, true, true)
i18n.addResourceBundle('vi', 'translation', vi, true, true)

export default i18n
