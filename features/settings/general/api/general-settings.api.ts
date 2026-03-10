import type { AxiosResponse } from 'axios'
import { secureStorage } from '@/utils/storageUtils'
import i18n from '@/i18n'
import type { ApiResponse } from '@/types/common.types'
import { settingsApi } from '@/features/settings/api'
import { toAppLanguage, toLanguageCode } from '@/features/settings/schemas'

export interface GeneralSettings {
  languageEn: boolean
}

/**
 * Compatibility wrapper for old callsites.
 */
export const getGeneralSettings = async (): Promise<AxiosResponse<ApiResponse<GeneralSettings>>> => {
  const response = await settingsApi.getLanguageAndInterfaceSettings()

  return {
    ...response,
    data: {
      ...response.data,
      data: {
        languageEn: response.data.data.language === 'EN'
      }
    }
  }
}

/**
 * Compatibility wrapper for old callsites.
 */
export const updateGeneralSettings = (
  data: Partial<GeneralSettings>
): Promise<AxiosResponse<ApiResponse<GeneralSettings>>> => {
  const language = typeof data.languageEn === 'boolean' ? toAppLanguage(data.languageEn ? 'en' : 'vi') : undefined

  return settingsApi.updateLanguageAndInterfaceSettings({ language }).then((response) => ({
    ...response,
    data: {
      ...response.data,
      data: {
        languageEn: response.data.data.languageAndInterface.language === 'EN'
      }
    }
  }))
}

/**
 * Fetches the user's general settings and syncs the language preference into
 * SecureStore + i18n so that every future axios request carries the correct
 * Accept-Language header.
 *
 * Call this after a successful login and on app resume when the user is
 * already authenticated.
 */
export const syncAcceptLanguage = async (): Promise<void> => {
  try {
    const response = await getGeneralSettings()
    const settings = response?.data?.data
    if (settings) {
      const lang = toLanguageCode(settings.languageEn ? 'EN' : 'VI')
      await secureStorage.setAcceptLanguage(lang)
      if (i18n.language !== lang) {
        await i18n.changeLanguage(lang)
      }
    }
  } catch (error) {
    console.warn('[syncAcceptLanguage] Could not sync language from backend:', error)
    // Non-fatal – app continues with the currently active i18n locale
  }
}

export const generalSettingsApi = {
  getGeneralSettings,
  updateGeneralSettings,
  syncAcceptLanguage
}
