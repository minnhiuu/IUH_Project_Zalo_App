import i18n from '@/i18n'
import en from './locales/en.json'
import vi from './locales/vi.json'

i18n.addResourceBundle('en', 'translation', en, true, true)
i18n.addResourceBundle('vi', 'translation', vi, true, true)

export default i18n
