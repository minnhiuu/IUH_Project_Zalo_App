import type { AxiosResponse } from 'axios'
import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import { secureStorage } from '@/utils/storageUtils'
import i18n from '@/i18n'
import type { ApiResponse } from '@/types/common.types'

export interface GeneralSettings {
  languageEn: boolean
  showAllFriends: boolean
}

/**
 * Fetches the authenticated user's general settings from the backend.
 * Endpoint: GET /users/settings/me/general
 */
export const getGeneralSettings = (): Promise<AxiosResponse<ApiResponse<GeneralSettings>>> =>
  http.get<ApiResponse<GeneralSettings>>(API_ENDPOINTS.SETTINGS.ME_GENERAL)

/**
 * Updates the user's general settings (languageEn, showAllFriends) on the backend.
 * Endpoint: PUT /users/settings/general
 */
export const updateGeneralSettings = (
  data: Partial<GeneralSettings>
): Promise<AxiosResponse<ApiResponse<GeneralSettings>>> =>
  http.put<ApiResponse<GeneralSettings>>(API_ENDPOINTS.SETTINGS.GENERAL, data)

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
      const lang = settings.languageEn ? 'en' : 'vi'
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
  syncAcceptLanguage,
}
