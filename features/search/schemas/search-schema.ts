import { z } from 'zod'
import { SearchType } from '@/constants/enum'

export const recentSearchRequestSchema = z.object({
  id: z.string().min(1, 'search.validation.idRequired').optional(),
  name: z.string().min(1, 'search.validation.nameRequired'),
  avatar: z.string().nullable().optional(),
  type: z.enum([SearchType.User, SearchType.Group, SearchType.Keyword])
})

export type RecentSearchRequest = z.infer<typeof recentSearchRequestSchema>

export type RecentSearchResponse = {
  id: string
  name: string
  avatar: string | null
  type: SearchType
  timestamp: number
}

export type UserSearchResponse = {
  id: string
  fullName: string
  avatar: string | null
  phoneNumber?: string | null
  friendshipId?: string | null
  friendshipStatus?: 'ACCEPTED' | 'PENDING' | 'NONE' | string | null
  requestedBy?: string | null
  relationshipLabel?: string | null
  mutualFriendsCount?: number | null
  sharedGroupsCount?: number | null
  inContact?: boolean | null
}

export type ConversationSearchResponse = {
  conversationId: string
  recipientId: string | null
  name: string
  avatar: string | null
  group: boolean
  memberCount: number
  participantNames: string[] | null
  participantAvatars: (string | null)[] | null
  displayHighlights: string | null
  phoneNumber?: string | null
}

export type MessageSearchResponse = {
  messageId: string
  conversationId: string
  senderId: string
  senderName: string | null
  senderAvatar: string | null
  displayContent: string | null
  size: number | null
  type: string
  status: string
  hasAttachment: boolean
  hasLink: boolean
  isGroup: boolean
  conversationName: string | null
  conversationAvatar: string | null
  participantNames: string[] | null
  participantAvatars: (string | null)[] | null
  createdAt: string
  displayHighlights: string | null
}

export type MessageSearchFilter = 'link' | 'file'

export type MessageSearchGroupResponse = {
  messageId: string | null
  conversationId: string
  title: string | null
  avatar: string | null
  isGroup: boolean
  matchCount: number
  previewContent: string | null
  previewHighlights: string | null
  previewType: string | null
  size: number | null
  hasAttachment: boolean
  hasLink: boolean
  lastMatchedAt: string | null
  participantNames: string[] | null
  participantAvatars: (string | null)[] | null
}

export type GlobalSearchRequest = {
  keyword: string
  conversationId?: string
  senderId?: string
  from?: number
  to?: number
  fileType?: string
  filters?: MessageSearchFilter[]
}

export type MessageNavigationResponse = {
  messageId: string
  conversationId: string
  index: number
  total: number
  createdAt: string
  displayHighlights: string | null
  direction: 'NEXT' | 'PREVIOUS' | 'CURRENT'
}
