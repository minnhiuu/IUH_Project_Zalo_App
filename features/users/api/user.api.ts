import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { UserResponse, UserUpdateRequest, UserSummaryResponse } from '../schemas/user.schema'

export const getMyProfile = () => http.get<ApiResponse<UserResponse>>(API_ENDPOINTS.USER.ME)

export const updateProfile = (data: UserUpdateRequest) =>
  http.put<ApiResponse<UserResponse>>(API_ENDPOINTS.USER.UPDATE_PROFILE, data)

export const searchUsers = (keyword: string) =>
  http.get<ApiResponse<{ data: UserSummaryResponse[] }>>(API_ENDPOINTS.USER.SEARCH, {
    params: { keyword, size: 20 }
  })

export const getUserById = (userId: string) => http.get<ApiResponse<UserResponse>>(API_ENDPOINTS.USER.GET_BY_ID(userId))

export const userApi = {
  getMyProfile,
  updateProfile,
  searchUsers,
  getUserById
}
