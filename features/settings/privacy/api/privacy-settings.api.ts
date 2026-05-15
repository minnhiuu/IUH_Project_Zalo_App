import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { PrivacySettings, UserSettings } from '../../schemas'

const normalizePrivacySettings = (settings: PrivacySettings): PrivacySettings => ({
  ...settings,
  nameSearchVisibility:
    settings.nameSearchVisibility === 'NONE' ? 'PUBLIC' : (settings.nameSearchVisibility ?? 'PUBLIC'),
  phoneSearchVisibility: settings.phoneSearchVisibility ?? 'PUBLIC'
})

export const getPrivacySettings = async () => {
  const response = await http.get<ApiResponse<PrivacySettings>>(API_ENDPOINTS.SETTINGS.PRIVACY)
  return {
    ...response,
    data: {
      ...response.data,
      data: response.data.data ? normalizePrivacySettings(response.data.data) : response.data.data
    }
  }
}

export const updatePrivacySettings = (request: PrivacySettings) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.PRIVACY, normalizePrivacySettings(request))

export const privacySettingsApi = {
  getPrivacySettings,
  updatePrivacySettings
}
