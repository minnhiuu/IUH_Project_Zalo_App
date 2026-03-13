import { API_ENDPOINTS } from '@/config/apiConfig'
import http from '@/lib/http'
import { ApiResponse, PageResponse } from '@/types/common.types'
import { UserSummaryResponse } from '@/features/users'
import { RecentSearchResponse, RecentSearchRequest } from '../schemas/search-schema'
import { SearchType } from '@/constants/enum'

export const searchApi = {
  searchUsers: (query: string, page = 0, limit = 10) =>
    http.get<ApiResponse<PageResponse<UserSummaryResponse[]>>>(
      `${API_ENDPOINTS.USER.SEARCH}?keyword=${encodeURIComponent(query)}&page=${page}&size=${limit}`
    ),

  getRecentItems: () => http.get<ApiResponse<RecentSearchResponse[]>>(API_ENDPOINTS.USER.RECENT_SEARCH.ITEMS),

  getRecentQueries: () => http.get<ApiResponse<RecentSearchResponse[]>>(API_ENDPOINTS.USER.RECENT_SEARCH.QUERIES),

  addSearchItem: (request: RecentSearchRequest) =>
    http.post<ApiResponse<void>>(API_ENDPOINTS.USER.RECENT_SEARCH.ADD, request),

  removeItem: (id: string, type: SearchType) =>
    http.delete<ApiResponse<void>>(`${API_ENDPOINTS.USER.RECENT_SEARCH.REMOVE(id)}?type=${type}`),

  clearAll: () => http.delete<ApiResponse<void>>(API_ENDPOINTS.USER.RECENT_SEARCH.CLEAR_ALL)
}
