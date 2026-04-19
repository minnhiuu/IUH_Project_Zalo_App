import http from '@/lib/http'
import { getAccessToken } from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse, PageResponse } from '@/types/common.types'
import type {
  MessageSendRequest,
  MessageResponse,
  ConversationResponse, 
  AttachmentInfo,
  PinnedMessageInfo
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

  getMediaMessages: (conversationId: string, types: string[] = ['IMAGE', 'VIDEO'], page: number = 0, size: number = 50) =>
    http.get<ApiResponse<PageResponse<MessageResponse[]>>>(
      `${API_ENDPOINTS.MESSAGE.MEDIA(conversationId)}?types=${types.join(',')}&page=${page}&size=${size}`
    )
}
