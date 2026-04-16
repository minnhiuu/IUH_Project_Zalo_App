import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse, PageResponse } from '@/types/common.types'
import type { MessageSendRequest, MessageResponse, ConversationResponse, AttachmentInfo } from '../schemas'

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

  revokeMessage: (messageId: string) => http.patch<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.REVOKE(messageId)),

  deleteMessageForMe: (messageId: string) =>
    http.delete<ApiResponse<void>>(API_ENDPOINTS.MESSAGE.DELETE_FOR_ME(messageId)),

  uploadFile: (fileUri: string, fileName: string, mimeType: string, folder: string = 'chat') => {
    const formData = new FormData()
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType
    } as any)
    formData.append('folder', folder)
    return http.post<ApiResponse<AttachmentInfo>>(API_ENDPOINTS.FILE.UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
