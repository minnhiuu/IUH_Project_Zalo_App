import axiosInstance from '@/config/axiosInstance'
import type { ApiResponse, PageResponse } from '@/types/common.types'
import type {
  BackendCommentResponse,
  CreateCommentRequest,
  ReactionResponse,
  ToggleReactionRequest,
  UpdateCommentRequest
} from '@/features/social-feed/schemas/comment.schema'

export const commentApi = {
  getRootCommentsByPost: (postId: string, page = 0, size = 20, sortBy = 'NEWEST') =>
    axiosInstance.get<ApiResponse<PageResponse<BackendCommentResponse>>>(`/comments/post/${postId}`, {
      params: { page, size, sortBy }
    }),

  getRepliesByComment: (commentId: string) =>
    axiosInstance.get<ApiResponse<BackendCommentResponse[]>>(`/comments/${commentId}/replies`),

  createComment: (body: CreateCommentRequest) =>
    axiosInstance.post<ApiResponse<BackendCommentResponse>>('/comments', body),

  updateComment: (commentId: string, body: UpdateCommentRequest) =>
    axiosInstance.put<ApiResponse<BackendCommentResponse>>(`/comments/${commentId}`, body),

  deleteComment: (commentId: string) =>
    axiosInstance.delete<ApiResponse<void>>(`/comments/${commentId}`),

  toggleReaction: (body: ToggleReactionRequest) =>
    axiosInstance.post<ApiResponse<ReactionResponse>>('/reactions/toggle', body),

  deleteReaction: (targetId: string, targetType: 'POST' | 'COMMENT') =>
    axiosInstance.delete<ApiResponse<ReactionResponse>>('/reactions', {
      params: { targetId, targetType }
    }),

  searchReactions: (targetType: 'POST' | 'COMMENT', reactionType: ReactionResponse['type']) =>
    axiosInstance.get<ApiResponse<ReactionResponse[]>>('/reactions/search', {
      params: { targetType, reactionType }
    })
}
