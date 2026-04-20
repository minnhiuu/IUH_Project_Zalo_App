import http from '@/lib/http'
import { getAccessToken } from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse, PageResponse } from '@/types/common.types'
import type {
  MessageSendRequest,
  MessageResponse,
  ConversationResponse,
  PinnedMessageInfo,
  GroupConversationCreateRequest,
  LeaveGroupRequest,
  SearchMemberResponse,
  GroupMemberListItemResponse,
  AdminMemberResponse,
  GroupSettings,
  JoinGroupPreviewResponse,
  JoinRequestResponse
} from '../schemas'

export type UploadFileResponse = {
  key: string
  url: string
  fileName: string
  originalFileName: string
  contentType: string
  size: number
}

export const messageApi = {
    createGroupConversation: (request: GroupConversationCreateRequest) =>
      http.post<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.GROUPS, request),

    sendGroupInvites: (conversationId: string, userIds: string[]) =>
      http.post<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.GROUP_INVITES(conversationId), { userIds }),

  getConversations: (page: number = 0, size: number = 20) =>
    http.get<ApiResponse<PageResponse<ConversationResponse[]>>>(
      `${API_ENDPOINTS.MESSAGE.CONVERSATIONS}?page=${page}&size=${size}`
    ),

  getMessages: (conversationId: string, page: number = 0, size: number = 20) =>
    http.get<ApiResponse<PageResponse<MessageResponse[]>>>(
      `${API_ENDPOINTS.MESSAGE.MESSAGES(conversationId)}?page=${page}&size=${size}`
    ),

  sendMessage: (request: MessageSendRequest) => {
    const { conversationId, ...body } = request
    return http.post<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.SEND(conversationId), body)
  },

  getOrCreateConversation: (partnerId: string) =>
    http.get<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.PARTNER_CONVERSATION(partnerId)),

  markAsRead: (conversationId: string) => http.put<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.MARK_READ(conversationId)),

  getUnreadAnchor: (conversationId: string) =>
    http.get<ApiResponse<{ firstUnreadMessageId: string | null; unreadCount: number }>>(
      API_ENDPOINTS.MESSAGE.UNREAD_ANCHOR(conversationId)
    ),

  clearConversationHistory: (conversationId: string) =>
    http.patch<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.CLEAR_HISTORY(conversationId)),

  deleteConversation: (conversationId: string) =>
    http.delete<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.DELETE_CONVERSATION(conversationId)),

  getPinnedMessages: (conversationId: string) =>
    http.get<ApiResponse<PinnedMessageInfo[]>>(API_ENDPOINTS.MESSAGE.PINS(conversationId)),

  pinMessage: (conversationId: string, messageId: string) =>
    http.post<ApiResponse<PinnedMessageInfo>>(API_ENDPOINTS.MESSAGE.PIN_MESSAGE(conversationId, messageId)),

  unpinMessage: (conversationId: string, messageId: string) =>
    http.delete<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.UNPIN_MESSAGE(conversationId, messageId)),

  revokeMessage: (messageId: string) => http.patch<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.REVOKE(messageId)),

  deleteMessageForMe: (messageId: string) =>
    http.delete<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.DELETE_FOR_ME(messageId)),

  uploadFile: async (uri: string, mimeType: string, fileName: string, folder: string = 'chat') => {
    const formData = new FormData()
    formData.append('file', { uri, type: mimeType, name: fileName } as any)
    const token = await getAccessToken()

    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    headers['Content-Type'] = 'multipart/form-data'

    return http.post<ApiResponse<UploadFileResponse>>(
      `${API_ENDPOINTS.FILE.UPLOAD}?folder=${folder}`,
      formData,
      { headers }
    )
  },

  toggleReaction: (messageId: string, emoji: string) =>
    http.post<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.TOGGLE_REACTION(messageId), { emoji }),

  removeAllMyReactions: (messageId: string) =>
    http.delete<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.REMOVE_REACTIONS(messageId)),

  getSeenMembers: (conversationId: string, messageId: string) =>
    http.get<ApiResponse<Array<{ userId: string; fullName: string | null; avatar: string | null }>>>(
      API_ENDPOINTS.MESSAGE.SEEN_MEMBERS(conversationId, messageId)
    ),

  updateGroupName: (conversationId: string, name: string) =>
    http.patch<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.UPDATE_GROUP_NAME(conversationId), null, {
      params: { name }
    }),

  updateGroupAvatar: async (conversationId: string, uri: string, mimeType: string, fileName: string) => {
    const formData = new FormData()
    formData.append('file', { uri, type: mimeType, name: fileName } as any)
    const token = await getAccessToken()
    const headers: Record<string, string> = { 'Content-Type': 'multipart/form-data' }
    if (token) headers.Authorization = `Bearer ${token}`
    return http.patch<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.UPDATE_GROUP_AVATAR(conversationId), formData, {
      headers
    })
  },

  disbandGroup: (conversationId: string) =>
    http.delete<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.DISBAND_GROUP(conversationId)),

  leaveGroup: (conversationId: string, request: LeaveGroupRequest) =>
    http.delete<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.LEAVE_GROUP(conversationId), { data: request }),

  getFriendsDirectory: (conversationId?: string | null) =>
    http.get<ApiResponse<Record<string, SearchMemberResponse[]>>>(API_ENDPOINTS.MESSAGE.FRIENDS_DIRECTORY, {
      params: { conversationId }
    }),

  searchMembersToAdd: (query: string, page = 0, size = 20, conversationId?: string | null) =>
    http.get<ApiResponse<PageResponse<SearchMemberResponse[]>>>(API_ENDPOINTS.MESSAGE.SEARCH_MEMBERS, {
      params: { query, page, size, conversationId }
    }),

  addMembersToGroup: (conversationId: string, memberIds: string[]) =>
    http.post<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.ADD_MEMBERS(conversationId), { memberIds }),

  getGroupMembers: (conversationId: string, params?: { query?: string; page?: number; size?: number }) =>
    http.get<ApiResponse<PageResponse<GroupMemberListItemResponse[]>>>(API_ENDPOINTS.MESSAGE.GROUP_MEMBERS(conversationId), {
      params: {
        query: params?.query,
        page: params?.page ?? 0,
        size: params?.size ?? 20
      }
    }),

  removeMemberFromGroup: (conversationId: string, targetUserId: string, blockFromGroup = false) =>
    http.delete<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.REMOVE_MEMBER(conversationId, targetUserId), {
      params: { blockFromGroup }
    }),

  promoteToAdmin: (conversationId: string, targetUserId: string) =>
    http.patch<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.PROMOTE_ADMIN(conversationId, targetUserId)),

  demoteFromAdmin: (conversationId: string, targetUserId: string) =>
    http.patch<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.DEMOTE_ADMIN(conversationId, targetUserId)),

  transferOwner: (conversationId: string, targetUserId: string) =>
    http.patch<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.TRANSFER_OWNER(conversationId, targetUserId)),

  getGroupAdmins: (conversationId: string, page = 0, size = 20) =>
    http.get<ApiResponse<PageResponse<AdminMemberResponse[]>>>(API_ENDPOINTS.MESSAGE.GROUP_ADMINS(conversationId), {
      params: { page, size }
    }),

  getAdminCandidates: (conversationId: string, query?: string, page = 0, size = 20) =>
    http.get<ApiResponse<PageResponse<AdminMemberResponse[]>>>(API_ENDPOINTS.MESSAGE.ADMIN_CANDIDATES(conversationId), {
      params: { query, page, size }
    }),

  updateGroupSettings: (conversationId: string, settings: Partial<GroupSettings>) =>
    http.patch<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.UPDATE_GROUP_SETTINGS(conversationId), settings),

  refreshJoinLink: (conversationId: string) =>
    http.post<ApiResponse<string>>(API_ENDPOINTS.MESSAGE.REFRESH_JOIN_LINK(conversationId)),

  generateJoinLink: (conversationId: string) =>
    http.post<ApiResponse<string>>(API_ENDPOINTS.MESSAGE.GENERATE_JOIN_LINK(conversationId)),

  joinByLink: (token: string, joinAnswer?: string) =>
    http.post<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.JOIN_BY_LINK(token), { joinAnswer }),

  updateJoinQuestion: (conversationId: string, question: string) =>
    http.put<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.UPDATE_JOIN_QUESTION(conversationId), { question }),

  getJoinPreview: (token: string) =>
    http.get<ApiResponse<JoinGroupPreviewResponse>>(API_ENDPOINTS.MESSAGE.JOIN_PREVIEW(token)),

  getJoinRequests: (conversationId: string, page = 0, size = 20) =>
    http.get<ApiResponse<PageResponse<JoinRequestResponse[]>>>(API_ENDPOINTS.MESSAGE.JOIN_REQUESTS(conversationId), {
      params: { page, size }
    }),

  approveJoinRequest: (conversationId: string, requestId: string) =>
    http.post<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.APPROVE_JOIN_REQUEST(conversationId, requestId)),

  rejectJoinRequest: (conversationId: string, requestId: string) =>
    http.post<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.REJECT_JOIN_REQUEST(conversationId, requestId)),

  cancelMyJoinRequest: (conversationId: string) =>
    http.delete<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.CANCEL_MY_JOIN_REQUEST(conversationId)),

  blockMemberFromGroup: (conversationId: string, targetUserId: string) =>
    http.post<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.BLOCK_MEMBER(conversationId, targetUserId)),

  unblockMemberFromGroup: (conversationId: string, targetUserId: string) =>
    http.delete<ApiResponse<ConversationResponse>>(API_ENDPOINTS.MESSAGE.UNBLOCK_MEMBER(conversationId, targetUserId)),

  getBlockedMembers: (conversationId: string, page = 0, size = 20) =>
    http.get<ApiResponse<PageResponse<SearchMemberResponse[]>>>(API_ENDPOINTS.MESSAGE.BLOCKED_MEMBERS(conversationId), {
      params: { page, size }
    }),

  getBlockCandidates: (conversationId: string, query?: string, page = 0, size = 20) =>
    http.get<ApiResponse<PageResponse<SearchMemberResponse[]>>>(API_ENDPOINTS.MESSAGE.BLOCK_CANDIDATES(conversationId), {
      params: { query, page, size }
    }),

  getMyGroupConversations: (params?: { query?: string; sort?: string; filter?: string; page?: number; size?: number }) =>
    http.get<ApiResponse<PageResponse<ConversationResponse[]>>>(API_ENDPOINTS.MESSAGE.MY_GROUPS, {
      params: {
        query: params?.query,
        sort: params?.sort ?? 'activity_newest',
        filter: params?.filter ?? 'all',
        page: params?.page ?? 0,
        size: params?.size ?? 20
      }
    }),

  getMediaMessages: (conversationId: string, types: string[] = ['IMAGE', 'VIDEO'], page: number = 0, size: number = 50) =>
    http.get<ApiResponse<PageResponse<MessageResponse[]>>>(
      `${API_ENDPOINTS.MESSAGE.MEDIA(conversationId)}?types=${types.join(',')}&page=${page}&size=${size}`
    )
}
