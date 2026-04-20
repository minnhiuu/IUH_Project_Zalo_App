import { useTranslation } from 'react-i18next'
import { createSocialTexts } from './social.texts'

export const useSocialText = () => {
  const { t, i18n } = useTranslation('social')
  const texts = createSocialTexts(t)

  return {
    text: texts,
    language: i18n.language
  }
}
