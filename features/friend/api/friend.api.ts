import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type {
  FriendRequestSendRequest,
  FriendRequestResponse,
  FriendResponse,
  FriendshipStatusResponse,
  MutualFriendsResponse,
} from '../schemas'

export const friendApi = {
 
  sendFriendRequest: (request: FriendRequestSendRequest) =>
    http.post<ApiResponse<FriendRequestResponse>>(API_ENDPOINTS.FRIENDSHIP.SEND_REQUEST, request),

  acceptFriendRequest: (friendshipId: string) =>
    http.put<ApiResponse<FriendRequestResponse>>(API_ENDPOINTS.FRIENDSHIP.ACCEPT_REQUEST(friendshipId)),

  declineFriendRequest: (friendshipId: string) =>
    http.put<ApiResponse<void>>(API_ENDPOINTS.FRIENDSHIP.DECLINE_REQUEST(friendshipId)),

  cancelFriendRequest: (friendshipId: string) =>
    http.put<ApiResponse<void>>(API_ENDPOINTS.FRIENDSHIP.CANCEL_REQUEST(friendshipId)),

  getReceivedFriendRequests: (page: number = 0, size: number = 10) =>
    http.get<ApiResponse<any>>(`${API_ENDPOINTS.FRIENDSHIP.RECEIVED_REQUESTS}?page=${page}&size=${size}`),

  getSentFriendRequests: (page: number = 0, size: number = 10) =>
    http.get<ApiResponse<any>>(`${API_ENDPOINTS.FRIENDSHIP.SENT_REQUESTS}?page=${page}&size=${size}`),

  getMyFriends: (page: number = 0, size: number = 10) =>
    http.get<ApiResponse<any>>(`${API_ENDPOINTS.FRIENDSHIP.MY_FRIENDS}?page=${page}&size=${size}`),

  unfriend: (friendId: string) =>
    http.delete<ApiResponse<void>>(API_ENDPOINTS.FRIENDSHIP.UNFRIEND(friendId)),

  checkFriendshipStatus: (userId: string) =>
    http.get<ApiResponse<FriendshipStatusResponse>>(API_ENDPOINTS.FRIENDSHIP.CHECK_STATUS(userId)),

  getMutualFriends: (userId: string) =>
    http.get<ApiResponse<MutualFriendsResponse>>(API_ENDPOINTS.FRIENDSHIP.MUTUAL_FRIENDS(userId)),

  getMutualFriendsCount: (userId: string) =>
    http.get<ApiResponse<number>>(API_ENDPOINTS.FRIENDSHIP.MUTUAL_FRIENDS_COUNT(userId)),
}
