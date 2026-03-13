import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import { secureStorage } from '@/utils/storageUtils'
import i18n from '@/i18n'
import type { ApiResponse } from '@/types/common.types'
import type { LanguageAndInterfaceSettings, UserSettings } from '../../schemas'
import { toLanguageCode } from '../../schemas'

export const getLanguageAndInterfaceSettings = () =>
  http.get<ApiResponse<LanguageAndInterfaceSettings>>(API_ENDPOINTS.SETTINGS.LANGUAGE_AND_INTERFACE)

export const updateLanguageAndInterfaceSettings = (request: Partial<LanguageAndInterfaceSettings>) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.LANGUAGE_AND_INTERFACE, request)

export const syncAcceptLanguage = async (): Promise<void> => {
  try {
    const response = await getLanguageAndInterfaceSettings()
    const settings = response?.data?.data
    if (!settings) {
      return
    }

    const languageCode = toLanguageCode(settings.language)
    await secureStorage.setAcceptLanguage(languageCode)

    if (i18n.language !== languageCode) {
      await i18n.changeLanguage(languageCode)
    }
  } catch (error) {
    console.warn('[settingsApi.syncAcceptLanguage] Could not sync language from backend:', error)
  }
}

export const interfaceLanguageApi = {
  getLanguageAndInterfaceSettings,
  updateLanguageAndInterfaceSettings,
  syncAcceptLanguage
}
