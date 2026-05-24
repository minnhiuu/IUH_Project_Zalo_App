import type { QueryClient, InfiniteData } from '@tanstack/react-query'
import { messageKeys } from '@/features/message/queries/keys'
import { MessageStatus, MessageType, type MessageResponse, type ConversationResponse } from '@/features/message/schemas'

export type ReminderNotificationPayload = {
  conversationId?: string
  reminderId?: string
  message?: string
  title?: string
  triggeredAt?: string
  remindAt?: string
  isTriggerMessage?: boolean
  hasTriggered?: boolean
}

const parseString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value
  if (value == null) return undefined
  return String(value)
}

const parseBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return undefined
}

const normalizePayload = (raw?: Record<string, unknown>): ReminderNotificationPayload => {
  if (!raw) return {}
  const payload = raw.payload && typeof raw.payload === 'string' ? safeJsonParse(raw.payload) : raw.payload
  const payloadObj = (payload as Record<string, unknown>) || {}

  return {
    conversationId:
      parseString(raw.conversationId) ||
      parseString(raw.conversation_id) ||
      parseString(payloadObj.conversationId),
    reminderId:
      parseString(raw.reminderId) ||
      parseString(raw.reminder_id) ||
      parseString(payloadObj.reminderId) ||
      parseString(payloadObj.referenceId),
    message: parseString(raw.message) || parseString(raw.body) || parseString(payloadObj.message),
    title: parseString(raw.title) || parseString(payloadObj.title),
    triggeredAt: parseString(raw.triggeredAt) || parseString(payloadObj.triggeredAt),
    remindAt: parseString(raw.remindAt) || parseString(payloadObj.remindAt),
    isTriggerMessage: parseBoolean(raw.isTriggerMessage) ?? parseBoolean(payloadObj.isTriggerMessage),
    hasTriggered: parseBoolean(raw.hasTriggered) ?? parseBoolean(payloadObj.hasTriggered)
  }
}

const safeJsonParse = (value: string): Record<string, unknown> | undefined => {
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

export const injectReminderMessage = (
  queryClient: QueryClient,
  rawData: Record<string, unknown>,
  actor?: { id?: string | null; name?: string | null; avatar?: string | null }
) => {
  const payload = normalizePayload(rawData)
  if (!payload.conversationId || !payload.reminderId) return

  const isTriggerMessage = payload.isTriggerMessage === true
  const resolvedTriggeredAt = isTriggerMessage ? payload.triggeredAt || payload.remindAt : payload.triggeredAt
  const hasTriggered = payload.hasTriggered === true || isTriggerMessage

  const content = payload.message || payload.title || 'Nhac nho'
  const createdAt = resolvedTriggeredAt || payload.remindAt || new Date().toISOString()
  const messageId = isTriggerMessage
    ? resolvedTriggeredAt
      ? `${payload.reminderId}-${resolvedTriggeredAt}`
      : `${payload.reminderId}-trigger`
    : payload.reminderId

  const message: MessageResponse = {
    id: messageId,
    conversationId: payload.conversationId,
    senderId: actor?.id || '',
    senderName: actor?.name || null,
    senderAvatar: actor?.avatar || null,
    content,
    clientMessageId: null,
    type: MessageType.SYSTEM,
    createdAt,
    lastModifiedAt: createdAt,
    replyTo: null,
    isForwarded: false,
    status: MessageStatus.NORMAL,
    metadata: {
      action: 'REMINDER',
      payload: {
        reminderId: payload.reminderId,
        title: payload.title,
        message: payload.message,
        triggeredAt: resolvedTriggeredAt,
        remindAt: payload.remindAt,
        conversationId: payload.conversationId,
        isTriggerMessage,
        hasTriggered
      }
    }
  }

  queryClient.setQueryData(messageKeys.messages(payload.conversationId), (oldData: InfiniteData<any> | undefined) => {
    if (!oldData) return oldData
    const updatedPages = oldData.pages.map((page: any) => {
      const updatedData = page.data.map((item: MessageResponse) => {
        if (!isTriggerMessage) return item
        if (item.id !== payload.reminderId && item.clientMessageId !== payload.reminderId) return item
        const meta = (item.metadata || {}) as any
        const metaPayload = (meta.payload || {}) as Record<string, unknown>
        return {
          ...item,
          metadata: {
            ...meta,
            action: 'REMINDER',
            payload: {
              ...metaPayload,
              triggeredAt: resolvedTriggeredAt,
              remindAt: payload.remindAt,
              hasTriggered: true
            }
          }
        }
      })

      return { ...page, data: updatedData }
    })

    const firstPage = updatedPages[0]
    const alreadyExists = firstPage.data.some((m: MessageResponse) => m.id === message.id)
    if (alreadyExists) {
      return { ...oldData, pages: updatedPages }
    }

    return {
      ...oldData,
      pages: [{ ...firstPage, data: [message, ...firstPage.data] }, ...updatedPages.slice(1)]
    }
  })

  queryClient.setQueryData(messageKeys.conversationList(), (oldData: any) => {
    if (!oldData) return oldData
    const conversations: ConversationResponse[] = Array.isArray(oldData) ? oldData : (oldData?.data ?? [])
    const idx = conversations.findIndex((c) => c.id === payload.conversationId)
    if (idx < 0) return oldData

    const current = conversations[idx]
    const updated: ConversationResponse = {
      ...current,
      lastMessage: content,
      lastMessageTime: createdAt,
      isLastMessageFromMe: false,
      lastMessageType: MessageType.SYSTEM,
      unreadCount: (current.unreadCount || 0) + 1,
      lastMessageStatus: MessageStatus.NORMAL
    }

    const newList = [updated, ...conversations.filter((_, i) => i !== idx)]
    return Array.isArray(oldData) ? newList : { ...oldData, data: newList }
  })
}
