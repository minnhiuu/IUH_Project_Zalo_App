import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { NotificationSettings, UserSettings } from '../../schemas'

type NotificationSettingsWithDeviceMap = NotificationSettings & {
  notificationSettingsByDeviceId?: Record<string, unknown>
}

export const DEFAULT_DND_TIMEZONE = 'GMT+07:00'
export const DEFAULT_DND_ACTIVE_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
]

export const normalizeNotificationSettings = (settings: NotificationSettings): NotificationSettings => {
  const { notificationSettingsByDeviceId: _ignoredDeviceMap, ...publicSettings } =
    settings as NotificationSettingsWithDeviceMap

  return {
    ...publicSettings,
    doNotDisturb: {
      dndEnabled: settings.doNotDisturb?.dndEnabled ?? false,
      dndStartTime: settings.doNotDisturb?.dndStartTime ?? '22:00',
      dndEndTime: settings.doNotDisturb?.dndEndTime ?? '07:00',
      dndTimezone: DEFAULT_DND_TIMEZONE,
      activeDays: settings.doNotDisturb?.activeDays?.length
        ? settings.doNotDisturb.activeDays
        : DEFAULT_DND_ACTIVE_DAYS
    }
  }
}

export const getNotificationSettings = () =>
  http.get<ApiResponse<NotificationSettings>>(API_ENDPOINTS.SETTINGS.NOTIFICATION)

export const updateNotificationSettings = (request: NotificationSettings) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.NOTIFICATION, normalizeNotificationSettings(request))

export const notificationSettingsApi = {
  getNotificationSettings,
  updateNotificationSettings
}
