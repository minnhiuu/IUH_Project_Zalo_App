import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { MessageSettings, UserSettings } from '../../schemas'

export const getMessageSettings = () => http.get<ApiResponse<MessageSettings>>(API_ENDPOINTS.SETTINGS.MESSAGE)

export const updateMessageSettings = (request: MessageSettings) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.MESSAGE, request)

export const messageSettingsApi = {
  getMessageSettings,
  updateMessageSettings
}
