import { z } from 'zod'

export enum FriendStatus {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED'
}

export const friendRequestSendRequestSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID không được để trống'),
  message: z.string().optional()
})

export type FriendRequestSendRequest = z.infer<typeof friendRequestSendRequestSchema>

export const friendRequestActionRequestSchema = z.object({
  friendshipId: z.string().min(1, 'Friendship ID không được để trống')
})

export type FriendRequestActionRequest = z.infer<typeof friendRequestActionRequestSchema>

export type UserSummaryResponse = {
  id: string
  accountId: string
  userName: string
  email: string
  phone: string
  avatar: string
}

export type FriendRequestResponse = {
  id: string
  requestedUserId: string
  requestedUserName: string
  requestedUserAvatar: string
  receivedUserId: string
  receivedUserName: string
  receivedUserAvatar: string
  message: string | null
  status: FriendStatus
  createdAt: string // ISO datetime
  updatedAt: string // ISO datetime
}

export type FriendResponse = {
  userId: string
  userName: string
  userAvatar: string
  userPhone: string
  mutualFriendsCount: number
}

export type FriendSuggestionResponse = {
  userId: string
  fullName: string
  avatar: string
  phoneNumber: string
  mutualFriendsCount: number | null
  sharedGroupsCount: number | null
  contactScore: number | null
  totalScore: number | null
}

export type FriendshipStatusResponse = {
  areFriends: boolean
  status: FriendStatus | null
  friendshipId: string | null
  requestedBy: string | null
}

export type MutualFriendsResponse = {
  count: number
  mutualFriends: FriendResponse[]
}
