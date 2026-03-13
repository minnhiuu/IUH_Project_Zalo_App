import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { DeviceResponse } from '../schemas/device.schema'

export const getMyDevices = () => http.get<ApiResponse<DeviceResponse[]>>(API_ENDPOINTS.DEVICE.ACTIVE_SESSIONS)

export const deleteDevice = (id: string) => http.delete<ApiResponse<void>>(API_ENDPOINTS.DEVICE.DELETE(id))

export const deviceApi = {
  getMyDevices,
  deleteDevice
}
