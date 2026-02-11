import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { UserResponse, UserUpdateRequest } from '../schemas/user.schema'

export const getMyProfile = () => http.get<ApiResponse<UserResponse>>(API_ENDPOINTS.USER.ME)

export const updateProfile = (id: string, data: UserUpdateRequest) =>
  http.put<ApiResponse<UserResponse>>(`${API_ENDPOINTS.USER.UPDATE}/${id}`, data)

export const userApi = {
  getMyProfile,
  updateProfile
}
