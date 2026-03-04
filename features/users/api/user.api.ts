import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { UserResponse, UserUpdateRequest, UserSummaryResponse, UserImageResponse } from '../schemas/user.schema'

export const getMyProfile = () => http.get<ApiResponse<UserResponse>>(API_ENDPOINTS.USER.ME)

export const updateProfile = (data: UserUpdateRequest) =>
  http.put<ApiResponse<UserResponse>>(API_ENDPOINTS.USER.UPDATE_PROFILE, data)

export const updateBio = (bio: string) =>
  http.patch<ApiResponse<UserResponse>>(API_ENDPOINTS.USER.UPDATE_BIO, { bio })

export const updateAvatar = (formData: FormData) =>
  http.patch<ApiResponse<UserImageResponse>>(API_ENDPOINTS.USER.UPDATE_AVATAR, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

export const updateBackground = (formData: FormData, y: number = 0) =>
  http.patch<ApiResponse<UserImageResponse>>(API_ENDPOINTS.USER.UPDATE_BACKGROUND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    params: { y }
  })

export const updateBackgroundPosition = (y: number) =>
  http.patch<ApiResponse<UserImageResponse>>(API_ENDPOINTS.USER.UPDATE_BACKGROUND_POSITION, null, {
    params: { y }
  })

export const searchUsers = (keyword: string) =>
  http.get<ApiResponse<{ data: UserSummaryResponse[] }>>(API_ENDPOINTS.USER.SEARCH, {
    params: { keyword, size: 20 }
  })

export const getUserById = (userId: string) => http.get<ApiResponse<UserResponse>>(API_ENDPOINTS.USER.GET_BY_ID(userId))

export const userApi = {
  getMyProfile,
  updateProfile,
  updateBio,
  updateAvatar,
  updateBackground,
  updateBackgroundPosition,
  searchUsers,
  getUserById
}
