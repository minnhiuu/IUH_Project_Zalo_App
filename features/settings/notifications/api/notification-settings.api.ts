import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { NotificationSettings, UserSettings } from '../../schemas'

export const getNotificationSettings = () =>
  http.get<ApiResponse<NotificationSettings>>(API_ENDPOINTS.SETTINGS.NOTIFICATION)

export const updateNotificationSettings = (request: NotificationSettings) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.NOTIFICATION, request)

export const notificationSettingsApi = {
  getNotificationSettings,
  updateNotificationSettings
}
