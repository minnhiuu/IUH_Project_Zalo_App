import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { ContactSettings, UserSettings } from '../../schemas'

export const getContactSettings = () => http.get<ApiResponse<ContactSettings>>(API_ENDPOINTS.SETTINGS.CONTACT)

export const updateContactSettings = (request: ContactSettings) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.CONTACT, request)

export const contactSettingsApi = {
  getContactSettings,
  updateContactSettings
}
