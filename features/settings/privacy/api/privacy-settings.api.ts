import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { PrivacySettings, UserSettings } from '../../schemas'

export const getPrivacySettings = () => http.get<ApiResponse<PrivacySettings>>(API_ENDPOINTS.SETTINGS.PRIVACY)

export const updatePrivacySettings = (request: PrivacySettings) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.PRIVACY, request)

export const privacySettingsApi = {
  getPrivacySettings,
  updatePrivacySettings
}
