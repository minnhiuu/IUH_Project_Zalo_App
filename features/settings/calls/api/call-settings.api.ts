import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { CallSettings, UserSettings } from '../../schemas'

export const getCallSettings = () => http.get<ApiResponse<CallSettings>>(API_ENDPOINTS.SETTINGS.CALL)

export const updateCallSettings = (request: CallSettings) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.CALL, request)

export const callSettingsApi = {
  getCallSettings,
  updateCallSettings
}
