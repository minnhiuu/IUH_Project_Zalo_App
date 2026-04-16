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
  content: z.string().optional().default(''),
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
  metadata: Record<string, any> | null
  attachments: AttachmentInfo[] | null
  reactions: Record<string, string[]> | null
  // Fields from ChatNotification (WebSocket)
  unreadCount?: number
  isFromMe?: boolean
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
  lastMessage: string | null
  lastMessageId: string | null
  lastMessageTime: string | null
  isLastMessageFromMe: boolean | null
  lastMessageType: MessageType | null
  unreadCount: number | null
  lastMessageStatus: MessageStatus | null
  members: ConversationMemberResponse[] | null
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
