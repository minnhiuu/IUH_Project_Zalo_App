import { API_ENDPOINTS, http } from '@/config'
import { DeviceTokenRequest } from '@/features/notifications/schema/user-device.schema'
import { ApiResponse } from '@/types'

export const notificationApi = {
  registerDevice: (body: DeviceTokenRequest) =>
    http.post<ApiResponse<string>>(API_ENDPOINTS.NOTIFICATION.REGISTER_DEVICE, body),

  unregisterDevice: (token: string) =>
    http.delete<ApiResponse<string>>(API_ENDPOINTS.NOTIFICATION.UNREGISTER_DEVICE(token))
}
