import { API_ENDPOINTS } from '@/config/apiConfig'
import http from '@/lib/http'
import { ApiResponse, PageResponse } from '@/types/common.types'
import { UserSummaryResponse } from '@/features/user'

export const searchApi = {
  searchUsers: (query: string, page = 0, limit = 10) =>
    http.get<ApiResponse<PageResponse<UserSummaryResponse[]>>>(
      `${API_ENDPOINTS.USER.SEARCH}?keyword=${encodeURIComponent(query)}&page=${page}&size=${limit}`
    )
}
