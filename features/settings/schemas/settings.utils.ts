import type { LanguageCode } from '@/i18n'
import type { AppLanguage } from './settings.types'

export const toLanguageCode = (language: AppLanguage): LanguageCode => {
  return language === 'EN' ? 'en' : 'vi'
}

export const toAppLanguage = (languageCode: LanguageCode): AppLanguage => {
  return languageCode === 'en' ? 'EN' : 'VI'
}
