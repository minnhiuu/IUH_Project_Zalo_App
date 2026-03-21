import { API_ENDPOINTS, http } from '@/config'
import type { DeviceTokenRequest } from '../schemas/user-device.schema'
import type { ApiResponse } from '@/types'
import type {
  NotificationHistoryResponse,
  NotificationFlatHistoryResponse,
  UserNotificationStateResponse
} from '../schemas/notification.schema'

export const notificationApi = {
  registerDevice: (body: DeviceTokenRequest) =>
    http.post<ApiResponse<string>>(API_ENDPOINTS.NOTIFICATION.REGISTER_DEVICE, body),

  unregisterDevice: (token: string) =>
    http.delete<ApiResponse<string>>(API_ENDPOINTS.NOTIFICATION.UNREGISTER_DEVICE(token)),

  getNotificationHistory: (params: { cursor?: string | null; limit?: number }) =>
    http.get<ApiResponse<NotificationHistoryResponse>>('/notifications/history', { params }),

  getUnreadHistory: (params: { cursor?: string | null; limit?: number }) =>
    http.get<ApiResponse<NotificationFlatHistoryResponse>>('/notifications/history/unread', { params }),

  getNotificationState: () => http.get<ApiResponse<UserNotificationStateResponse>>('/notifications/state'),

  markHistoryAsChecked: () => http.post<ApiResponse<void>>('/notifications/checked'),

  markAsRead: (notificationId: string) => http.post<ApiResponse<void>>(`/notifications/${notificationId}/read`),

  markAllAsRead: () => http.post<ApiResponse<void>>('/notifications/read-all')
}
