import { z } from 'zod'

export enum MessageType {
  CHAT = 'CHAT',
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  FILE = 'FILE',
  LINK = 'LINK',
  SYSTEM = 'SYSTEM',
  CALL = 'CALL'
}

export enum MessageStatus {
  NORMAL = 'NORMAL',
  REVOKED = 'REVOKED',
  DELETED_BY_ADMIN = 'DELETED_BY_ADMIN'
}

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export const messageSendRequestSchema = z.object({
  conversationId: z.string().min(1),
  recipientId: z.string().optional(),
  content: z.string().min(1),
  clientMessageId: z.string().optional(),
  replyTo: z
    .object({
      messageId: z.string(),
      senderId: z.string(),
      content: z.string(),
      type: z.nativeEnum(MessageType)
    })
    .optional(),
  isForwarded: z.boolean().optional().default(false),
  attachments: z
    .array(
      z.object({
        key: z.string(),
        url: z.string(),
        fileName: z.string(),
        originalFileName: z.string(),
        contentType: z.string(),
        size: z.number()
      })
    )
    .optional()
})

export type MessageSendRequest = z.infer<typeof messageSendRequestSchema>

export type AttachmentInfo = {
  key: string
  url: string
  fileName: string
  originalFileName: string
  contentType: string
  size: number
}

export type ReplyMetadataResponse = {
  messageId: string
  senderId: string
  senderName: string | null
  content: string
  type: MessageType
}

export type MessageResponse = {
  id: string
  conversationId: string | null
  senderId: string
  senderName: string | null
  senderAvatar: string | null
  content: string | null
  clientMessageId: string | null
  type: MessageType
  createdAt: string | null
  lastModifiedAt: string | null
  replyTo: ReplyMetadataResponse | null
  isForwarded: boolean
  status: MessageStatus
  // Fields from ChatNotification (WebSocket)
  unreadCount?: number
  isFromMe?: boolean
  metadata?: Record<string, unknown>
  attachments?: AttachmentInfo[]
  reactions?: Record<string, string[]>
}

export type ConversationMemberResponse = {
  userId: string
  fullName: string
  avatar: string | null
  lastReadMessageId: string | null
  role: string | null
}

export type ConversationResponse = {
  id: string
  name: string | null
  avatar: string | null
  status: string | null
  lastSeenAt: string | null
  isGroup: boolean
  isDisbanded?: boolean
  lastMessage: string | null
  lastMessageId: string | null
  lastMessageTime: string | null
  isLastMessageFromMe: boolean | null
  lastMessageType: MessageType | null
  unreadCount: number | null
  lastMessageStatus: MessageStatus | null
  members: ConversationMemberResponse[] | null
  settings?: GroupSettings | null
  joinLinkToken?: string | null
  pendingJoinRequestCount?: number | null
  invitedUserIds?: string[] | null
}

export type GroupSettings = {
  memberCanChangeInfo?: boolean
  memberCanPinMessages?: boolean
  memberCanCreateNotes?: boolean
  memberCanCreatePolls?: boolean
  memberCanSendMessages?: boolean
  membershipApprovalEnabled?: boolean
  highlightAdminMessages?: boolean
  newMembersCanReadRecent?: boolean
  joinByLinkEnabled?: boolean
  joinQuestion?: string | null
}

export type GroupConversationCreateRequest = {
  name: string
  avatar?: string | null
  isGroup: true
  memberIds: string[]
}

export type LeaveGroupRequest = {
  silent?: boolean
  transferTo?: string | null
  blockReJoin?: boolean
}

export type SearchMemberResponse = {
  userId: string
  fullName: string
  avatar?: string | null
  phoneNumber?: string | null
  role?: string | null
  isAlreadyMember?: boolean
}

export type GroupMemberListItemResponse = {
  userId: string
  fullName: string
  avatar?: string | null
  phoneNumber?: string | null
  role?: string | null
  joinedAt?: string | null
  isFriend?: boolean
  isCurrentUser?: boolean
  joinMethod?: string | null
  addedBy?: string | null
  addedByName?: string | null
}

export type AdminMemberResponse = {
  userId: string
  fullName: string
  avatar?: string | null
  role?: string | null
}

export type JoinGroupPreviewResponse = {
  conversationId: string
  groupName: string | null
  groupAvatar: string | null
  memberCount: number
  createdByName: string | null
  memberPreviews: { name: string; avatar: string | null }[]
  isAlreadyMember: boolean
  isBlockedFromGroup: boolean
  membershipApprovalEnabled: boolean
  hasPendingRequest: boolean
  joinQuestion: string | null
}

export type JoinRequestResponse = {
  id: string
  conversationId: string
  userId: string
  fullName: string
  avatar: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  requestedAt: string
  processedAt: string | null
  processedBy: string | null
  joinAnswer: string | null
}

export type ChatNotification = {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar: string
  content: string
  type: MessageType
  clientMessageId: string
  timestamp: string
  unreadCount: number
  replyTo: ReplyMetadataResponse | null
  isForwarded: boolean
  isFromMe: boolean
  status: MessageStatus
}

export type ReadReceiptNotification = {
  conversationId: string
  userId: string
  lastReadMessageId: string
}

export type PresenceEvent = {
  userId: string
  status: 'ONLINE' | 'OFFLINE'
}

export type PinnedMessageInfo = {
  messageId: string
  pinnedBy: string
  pinnedByName: string | null
  contentSnapshot: string | null
  messageType: MessageType
  pinnedAt: string
}
