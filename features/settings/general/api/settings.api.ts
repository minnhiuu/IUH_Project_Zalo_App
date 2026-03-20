import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { UserSettings } from '../../schemas'

export const getMySettings = () => http.get<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.ME)

export const getSettingsByUserId = (userId: string) =>
  http.get<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.BY_USER(userId))

export const generalSettingsApi = {
  getMySettings,
  getSettingsByUserId
}
