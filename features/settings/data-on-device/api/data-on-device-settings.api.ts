import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { DataOnDeviceSettings, UserSettings } from '../../schemas'

export const getDataOnDeviceSettings = () =>
  http.get<ApiResponse<DataOnDeviceSettings>>(API_ENDPOINTS.SETTINGS.DATA_ON_DEVICE)

export const updateDataOnDeviceSettings = (request: DataOnDeviceSettings) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.DATA_ON_DEVICE, request)

export const dataOnDeviceSettingsApi = {
  getDataOnDeviceSettings,
  updateDataOnDeviceSettings
}
