import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { AccountSecuritySettings, UserSettings } from '../../schemas'

export const getAccountSecuritySettings = () =>
  http.get<ApiResponse<AccountSecuritySettings>>(API_ENDPOINTS.SETTINGS.ACCOUNT_SECURITY)

export const updateAccountSecuritySettings = (request: AccountSecuritySettings) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.ACCOUNT_SECURITY, request)

export const accountSecuritySettingsApi = {
  getAccountSecuritySettings,
  updateAccountSecuritySettings
}
