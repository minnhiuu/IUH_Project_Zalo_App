import { API_ENDPOINTS } from '@/config/apiConfig'
import http from '@/lib/http'
import { ApiResponse, PageResponse } from '@/types/common.types'
import {
  ConversationSearchResponse,
  GlobalSearchRequest,
  MessageSearchGroupResponse,
  MessageSearchResponse,
  RecentSearchResponse,
  RecentSearchRequest,
  UserSearchResponse
} from '../schemas/search-schema'
import { SearchType } from '@/constants/enum'

export const searchApi = {
  searchUsers: (query: string, page = 0, limit = 10) =>
    http.get<ApiResponse<PageResponse<UserSearchResponse[]>>>(
      `${API_ENDPOINTS.USER.SEARCH}?keyword=${encodeURIComponent(query)}&page=${page}&size=${limit}`
    ),

  searchContacts: (query: string, page = 0, limit = 10, isGroup?: boolean) =>
    http.get<ApiResponse<PageResponse<ConversationSearchResponse[]>>>('/search/contacts', {
      params: { keyword: query, page, size: limit, isGroup }
    }),

  searchMessages: (request: GlobalSearchRequest, page = 0, limit = 10) =>
    http.get<ApiResponse<PageResponse<MessageSearchResponse[]>>>('/search/messages', {
      params: { ...request, filters: request.filters?.join(','), page, size: limit }
    }),

  searchMessageGroups: (request: GlobalSearchRequest, page = 0, limit = 10) =>
    http.get<ApiResponse<PageResponse<MessageSearchGroupResponse[]>>>('/search/messages/groups', {
      params: { ...request, filters: request.filters?.join(','), page, size: limit }
    }),

  searchFiles: (request: GlobalSearchRequest, page = 0, limit = 10) =>
    http.get<ApiResponse<PageResponse<MessageSearchResponse[]>>>('/search/messages', {
      params: { ...request, page, size: limit, section: 'files' }
    }),

  recordUserClick: (request: { keyword: string; targetUserId: string; rank: number; eventType: 'USER_RESULT_CLICK' }) =>
    http.post<ApiResponse<void>>('/search/events', request),

  getRecentItems: () => http.get<ApiResponse<RecentSearchResponse[]>>(API_ENDPOINTS.USER.RECENT_SEARCH.ITEMS),

  getRecentQueries: () => http.get<ApiResponse<RecentSearchResponse[]>>(API_ENDPOINTS.USER.RECENT_SEARCH.QUERIES),

  addSearchItem: (request: RecentSearchRequest) =>
    http.post<ApiResponse<void>>(API_ENDPOINTS.USER.RECENT_SEARCH.ADD, request),

  removeItem: (id: string, type: SearchType) =>
    http.delete<ApiResponse<void>>(`${API_ENDPOINTS.USER.RECENT_SEARCH.REMOVE(id)}?type=${type}`),

  clearAll: () => http.delete<ApiResponse<void>>(API_ENDPOINTS.USER.RECENT_SEARCH.CLEAR_ALL)
}
