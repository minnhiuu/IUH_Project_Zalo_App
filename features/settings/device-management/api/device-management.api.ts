import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import { secureStorage } from '@/utils/storageUtils'
import type { AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types/common.types'

/**
 * Logout a specific device by its sessionId.
 * Calls POST /auth/logout-device with { sessionId, refreshToken }.
 */
export const logoutDevice = async (sessionId: string): Promise<AxiosResponse<ApiResponse<void>>> => {
  const refreshToken = await secureStorage.getRefreshToken()
  return http.post<ApiResponse<void>>(API_ENDPOINTS.DEVICE.LOGOUT_DEVICE, {
    sessionId,
    refreshToken
  })
}

/**
 * Logout all other devices except the current one.
 * Calls POST /auth/logout-others with { refreshToken }.
 */
export const logoutOtherDevices = async (): Promise<AxiosResponse<ApiResponse<void>>> => {
  const refreshToken = await secureStorage.getRefreshToken()
  return http.post<ApiResponse<void>>(API_ENDPOINTS.DEVICE.LOGOUT_OTHERS, {
    refreshToken
  })
}

export const deviceManagementApi = {
  logoutDevice,
  logoutOtherDevices
}
