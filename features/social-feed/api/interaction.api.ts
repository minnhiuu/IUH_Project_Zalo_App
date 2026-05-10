import axiosInstance from '@/config/axiosInstance'
import type { ApiResponse } from '@/types/common.types'

export const interactionApi = {
  recordView: (postId: string) =>
    axiosInstance.post<ApiResponse<void>>(`/interactions/posts/${postId}/view`),

  dislikePost: (postId: string) =>
    axiosInstance.post<ApiResponse<void>>(`/interactions/posts/${postId}/dislike`)
}
