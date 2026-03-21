import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type {
  BlockUserRequest,
  UpdateBlockPreferenceRequest,
  BlockedUserResponse,
  BlockedUserDetailResponse
} from '../schemas/block.schema'

export const blockApi = {
  blockUser: (body: BlockUserRequest) =>
    http.post<ApiResponse<BlockedUserResponse>>(API_ENDPOINTS.BLOCK.BLOCK, body),

  unblockUser: (blockedUserId: string) =>
    http.delete<ApiResponse<void>>(API_ENDPOINTS.BLOCK.UNBLOCK(blockedUserId)),

  updateBlockPreference: (blockedUserId: string, body: UpdateBlockPreferenceRequest) =>
    http.patch<ApiResponse<BlockedUserResponse>>(API_ENDPOINTS.BLOCK.UPDATE_PREFERENCE(blockedUserId), body),

  getMyBlockedUsers: () =>
    http.get<ApiResponse<BlockedUserResponse[]>>(API_ENDPOINTS.BLOCK.LIST),

  getMyBlockedUsersWithDetails: () =>
    http.get<ApiResponse<BlockedUserDetailResponse[]>>(API_ENDPOINTS.BLOCK.LIST_DETAILS),

  isUserBlocked: (userId: string) =>
    http.get<ApiResponse<boolean>>(API_ENDPOINTS.BLOCK.CHECK(userId)),

  getBlockDetails: (blockedUserId: string) =>
    http.get<ApiResponse<BlockedUserResponse>>(API_ENDPOINTS.BLOCK.DETAILS(blockedUserId))
}
