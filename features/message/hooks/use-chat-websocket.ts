import { useEffect, useState, useCallback, useSyncExternalStore } from 'react'
import { Client } from '@stomp/stompjs'
import { useQueryClient, type InfiniteData, type QueryClient } from '@tanstack/react-query'
import { messageKeys } from '../queries/keys'
import { messageApi } from '../api/message.api'
import { useSendMessage, useRevokeMessage, useDeleteMessageForMe } from '../queries/use-mutations'
import { useAuthStore } from '@/store'
import { getAccessToken, clearTokens } from '@/lib/http'
import { storage } from '@/utils/storageUtils'
import { jwtDecode } from 'jwt-decode'
import apiConfig from '@/config/apiConfig'
import { normalizeDateTime } from '../utils/date-utils'
import { MessageStatus, MessageType } from '../schemas'
import type { MessageResponse, ConversationResponse, MessageSendRequest, ReplyMetadataResponse, AttachmentInfo } from '../schemas'

// ────────── Singleton state ──────────
let singletonClient: Client | null = null
let singletonConnected = false
let singletonUserId: string | null = null
const listeners = new Set<() => void>()

const notifyListeners = () => listeners.forEach((l) => l())
const getConnected = () => singletonConnected
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

const getWsUrl = () => {
  const base = apiConfig.socketUrl.replace(/^http/, 'ws')
  return `${base}/ws/websocket`
}

const connectSingleton = async (user: any, queryClient: QueryClient) => {
  // Already connected for this user
  if (singletonClient?.active && singletonUserId === user.id) return
  // Disconnect previous if switching users
  if (singletonClient?.active && singletonUserId !== user.id) {
    singletonClient.deactivate()
    singletonClient = null
  }

  const token = await getAccessToken()
  if (!token) return

  singletonUserId = user.id

  const client = new Client({
    brokerURL: getWsUrl(),
    reconnectDelay: 5000,
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    forceBinaryWSFrames: true,
    appendMissingNULLonIncoming: true,
    onConnect: () => {
      singletonConnected = true
      notifyListeners()

      // ────────── /queue/messages ──────────
      client.subscribe('/user/queue/messages', (payload) => {
        const rawMsg = JSON.parse(payload.body)
        const msg: MessageResponse = {
          ...rawMsg,
          createdAt: normalizeDateTime(rawMsg.createdAt || rawMsg.timestamp),
          lastModifiedAt: normalizeDateTime(rawMsg.lastModifiedAt)
        }

        const conversationId = msg.conversationId
        if (!conversationId) return

        const isOwnMessage = msg.isFromMe === true || msg.senderId === user.id

        // Update messages cache
        if (isOwnMessage) {
          queryClient.setQueryData(messageKeys.messages(conversationId), (oldData: InfiniteData<any> | undefined) => {
            if (!oldData) return oldData
            const firstPage = oldData.pages[0]
            const hasOptimistic = firstPage.data.some((m: MessageResponse) => m.clientMessageId === msg.clientMessageId)
            if (hasOptimistic) {
              return {
                ...oldData,
                pages: [
                  {
                    ...firstPage,
                    data: firstPage.data.map((m: MessageResponse) =>
                      m.clientMessageId && m.clientMessageId === msg.clientMessageId
                        ? { ...msg, status: MessageStatus.NORMAL }
                        : m
                    )
                  },
                  ...oldData.pages.slice(1)
                ]
              }
            }
            return {
              ...oldData,
              pages: [
                { ...firstPage, data: [{ ...msg, status: MessageStatus.NORMAL }, ...firstPage.data] },
                ...oldData.pages.slice(1)
              ]
            }
          })
        } else {
          queryClient.setQueryData(messageKeys.messages(conversationId), (oldData: InfiniteData<any> | undefined) => {
            if (!oldData) return oldData
            const firstPage = oldData.pages[0]
            const alreadyExists = firstPage.data.some(
              (m: MessageResponse) =>
                m.id === msg.id || (m.clientMessageId && m.clientMessageId === msg.clientMessageId)
            )
            if (alreadyExists) return oldData
            return {
              ...oldData,
              pages: [{ ...firstPage, data: [msg, ...firstPage.data] }, ...oldData.pages.slice(1)]
            }
          })
        }

        // Update conversations cache (move to top)
        queryClient.setQueryData(messageKeys.conversationList(), (oldData: any) => {
          if (!oldData) return oldData
          const conversations: ConversationResponse[] = Array.isArray(oldData) ? oldData : (oldData?.data ?? [])
          const idx = conversations.findIndex((c) => c.id === conversationId)

          if (idx >= 0) {
            const updated: ConversationResponse = {
              ...conversations[idx],
              lastMessage: msg.content,
              lastMessageTime: msg.createdAt || new Date().toISOString(),
              isLastMessageFromMe: isOwnMessage,
              lastMessageType: msg.type,
              unreadCount:
                msg.unreadCount !== undefined
                  ? msg.unreadCount
                  : (conversations[idx].unreadCount || 0) + (isOwnMessage ? 0 : 1),
              lastMessageStatus: msg.status
            }
            const newList = [updated, ...conversations.filter((_, i) => i !== idx)]
            return Array.isArray(oldData) ? newList : { ...oldData, data: newList }
          } else {
            queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
            return oldData
          }
        })
      })

      // ────────── /queue/presence ──────────
      client.subscribe('/user/queue/presence', (payload) => {
        const presence = JSON.parse(payload.body)
        queryClient.setQueryData(messageKeys.conversationList(), (oldData: any) => {
          if (!oldData) return oldData
          const conversations: ConversationResponse[] = Array.isArray(oldData) ? oldData : (oldData?.data ?? [])
          const newList = conversations.map((conv: ConversationResponse) => {
            if (conv.isGroup) return conv
            const hasMember = conv.members?.some((m) => m.userId === presence.userId)
            if (hasMember) {
              return { ...conv, status: presence.status, lastSeenAt: presence.timestamp }
            }
            return conv
          })
          return Array.isArray(oldData) ? newList : { ...oldData, data: newList }
        })
      })

      // ────────── /queue/read-receipts ──────────
      client.subscribe('/user/queue/read-receipts', (payload) => {
        const receipt = JSON.parse(payload.body)
        queryClient.setQueryData(messageKeys.conversationList(), (oldData: any) => {
          if (!oldData) return oldData
          const conversations: ConversationResponse[] = Array.isArray(oldData) ? oldData : (oldData?.data ?? [])
          const newList = conversations.map((conv: ConversationResponse) => {
            if (conv.id !== receipt.conversationId) return conv
            const updatedMembers = conv.members?.map((m: any) =>
              m.userId === receipt.userId ? { ...m, lastReadMessageId: receipt.lastReadMessageId } : m
            )
            return { ...conv, members: updatedMembers }
          })
          return Array.isArray(oldData) ? newList : { ...oldData, data: newList }
        })
      })

      // ────────── /queue/status-updates ──────────
      client.subscribe('/user/queue/status-updates', (payload) => {
        const update = JSON.parse(payload.body)
        if (update.type === 'MESSAGE_STATUS_UPDATE') {
          queryClient.setQueryData(
            messageKeys.messages(update.conversationId),
            (oldData: InfiniteData<any> | undefined) => {
              if (!oldData) return oldData
              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => ({
                  ...page,
                  data: page.data.map((m: MessageResponse) =>
                    m.id === update.messageId ? { ...m, status: update.newStatus, content: null } : m
                  )
                }))
              }
            }
          )
          queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
        }
      })

      // ────────── /queue/reactions ──────────
      client.subscribe('/user/queue/reactions', (payload) => {
        try {
          const rawEvent = JSON.parse(payload.body)
          const event = rawEvent.type === 'REACTION_UPDATE' ? rawEvent : rawEvent
          if (!event.messageId) return
          const updateFn = (oldData: InfiniteData<any> | undefined) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                data: page.data.map((m: MessageResponse) =>
                  m.id === event.messageId
                    ? {
                        ...m,
                        reactions: event.reactions && Object.keys(event.reactions).length ? event.reactions : undefined
                      }
                    : m
                )
              }))
            }
          }
          if (event.conversationId) {
            queryClient.setQueryData(messageKeys.messages(event.conversationId), updateFn)
          } else {
            // Scan all message caches
            const allKeys = queryClient.getQueryCache().getAll()
            allKeys.forEach((q) => {
              const key = q.queryKey as string[]
              if (key[0] === 'messages' && key[1] === 'chat') {
                queryClient.setQueryData(key, updateFn)
              }
            })
          }
        } catch {
          // ignore parse errors
        }
      })

      // ────────── /queue/conversations ──────────
      client.subscribe('/user/queue/conversations', (payload) => {
        try {
          const newConv = JSON.parse(payload.body)
          if (newConv.id) {
            queryClient.setQueryData(messageKeys.conversationList(), (oldData: any) => {
              if (!oldData) return oldData
              const conversations: ConversationResponse[] = Array.isArray(oldData) ? oldData : (oldData?.data ?? [])
              if (conversations.find((c: ConversationResponse) => c.id === newConv.id)) return oldData
              const newList = [newConv, ...conversations].sort(
                (a: any, b: any) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
              )
              return Array.isArray(oldData) ? newList : { ...oldData, data: newList }
            })
          } else if (newConv.type === 'REFRESH') {
            queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
          }
        } catch {
          queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
        }
      })

      // ────────── /queue/session (FORCE_LOGOUT) ──────────
      client.subscribe('/user/queue/session', async (payload) => {
        try {
          const event = JSON.parse(payload.body)
          if (event?.type !== 'FORCE_LOGOUT') return

          let mySessionId: string | null = null
          try {
            const token = await getAccessToken()
            if (token) {
              const decoded = jwtDecode<{ sessionId?: string }>(token)
              mySessionId = decoded.sessionId ?? null
            }
          } catch {
            mySessionId = null // safe fallback → force logout
          }

          if (mySessionId === null || mySessionId === event.sessionId) {
            await clearTokens()
            await storage.remove('user_data')
            useAuthStore.getState().logoutSuccess()
            queryClient.clear()
            disconnectSingleton(user)
          }
        } catch (error) {
          console.error('[Socket] Error handling session event:', error)
        }
      })

      // Announce presence
      client.publish({
        destination: '/app/user.addUser',
        body: JSON.stringify(user)
      })
    },
    onDisconnect: () => {
      singletonConnected = false
      notifyListeners()
    },
    debug: __DEV__ ? (msg) => console.log('[STOMP]', msg) : undefined
  })

  client.activate()
  singletonClient = client
}

const disconnectSingleton = (user: any) => {
  if (singletonClient) {
    if (singletonClient.connected && user) {
      singletonClient.publish({
        destination: '/app/user.disconnectUser',
        body: JSON.stringify(user)
      })
    }
    singletonClient.deactivate()
    singletonClient = null
    singletonUserId = null
    singletonConnected = false
    notifyListeners()
  }
}

// ────────── Hook ──────────
export const useChatWebSocket = () => {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const connected = useSyncExternalStore(subscribe, getConnected, getConnected)
  const sendMsgMutation = useSendMessage()
  const revokeMsgMutation = useRevokeMessage()
  const deleteMsgMutation = useDeleteMessageForMe()
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (user) {
      connectSingleton(user, queryClient)
    } else {
      disconnectSingleton(user)
    }
    // Don't disconnect on unmount — singleton stays alive
  }, [user, queryClient])

  // ────────── sendMessage ──────────
  const sendMessage = useCallback(
    (
      conversationId: string,
      content: string,
      replyTo?: ReplyMetadataResponse | null,
      isForwarded = false,
      attachments?: AttachmentInfo[]
    ) => {
      if (!singletonClient?.connected || (!content.trim() && !isForwarded && !attachments?.length)) return

      const clientMessageId = `temp-${Date.now()}`
      const request: MessageSendRequest = {
        conversationId,
        content: content.trim(),
        clientMessageId,
        replyTo: replyTo
          ? { messageId: replyTo.messageId, senderId: replyTo.senderId, content: replyTo.content, type: replyTo.type }
          : undefined,
        isForwarded,
        attachments
      }

      const optimisticType = attachments?.length
        ? attachments.some((attachment) => attachment.contentType.startsWith('video/'))
          ? MessageType.VIDEO
          : attachments.some((attachment) => attachment.contentType.startsWith('image/'))
            ? MessageType.IMAGE
            : MessageType.FILE
        : MessageType.CHAT

      sendMsgMutation.mutate(request)

      // Optimistic message in cache
      const now = new Date().toISOString()
      const optimisticMsg: MessageResponse = {
        id: clientMessageId,
        clientMessageId,
        senderId: user?.id || '',
        content,
        type: optimisticType,
        status: MessageStatus.NORMAL,
        createdAt: now,
        lastModifiedAt: now,
        conversationId,
        senderName: user?.fullName ?? null,
        senderAvatar: null,
        replyTo: replyTo ?? null,
        isForwarded,
        attachments
      }

      queryClient.setQueryData(messageKeys.messages(conversationId), (oldData: InfiniteData<any> | undefined) => {
        if (!oldData) return oldData
        const firstPage = oldData.pages[0]
        return {
          ...oldData,
          pages: [{ ...firstPage, data: [optimisticMsg, ...firstPage.data] }, ...oldData.pages.slice(1)]
        }
      })

      // Move conversation to top
      queryClient.setQueryData(messageKeys.conversationList(), (oldData: any) => {
        if (!oldData) return oldData
        const conversations: ConversationResponse[] = Array.isArray(oldData) ? oldData : (oldData?.data ?? [])
        const idx = conversations.findIndex((c) => c.id === conversationId)
        if (idx >= 0) {
          const updated: ConversationResponse = {
            ...conversations[idx],
            lastMessage: content,
            lastMessageTime: now,
            isLastMessageFromMe: true,
            lastMessageType: optimisticType,
            lastMessageStatus: MessageStatus.NORMAL
          }
          const newList = [updated, ...conversations.filter((_, i) => i !== idx)]
          return Array.isArray(oldData) ? newList : { ...oldData, data: newList }
        }
        return oldData
      })
    },
    [user, queryClient, sendMsgMutation]
  )

  // ────────── revokeMessage ──────────
  const revokeMessage = useCallback(
    (messageId: string, conversationId: string) => {
      revokeMsgMutation.mutate({ messageId, conversationId })

      queryClient.setQueryData(messageKeys.messages(conversationId), (oldData: InfiniteData<any> | undefined) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((m: MessageResponse) =>
              m.id === messageId ? { ...m, status: MessageStatus.REVOKED, content: null } : m
            )
          }))
        }
      })
    },
    [queryClient, revokeMsgMutation]
  )

  // ────────── deleteMessageForMe ──────────
  const deleteMessageForMe = useCallback(
    (messageId: string, conversationId: string) => {
      deleteMsgMutation.mutate({ messageId, conversationId })

      queryClient.setQueryData(messageKeys.messages(conversationId), (oldData: InfiniteData<any> | undefined) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((m: MessageResponse) => m.id !== messageId)
          }))
        }
      })
    },
    [queryClient, deleteMsgMutation]
  )

  // ────────── sendFileMessage ──────────
  const sendFileMessage = useCallback(
    async (
      conversationId: string,
      fileAssets: Array<{ uri: string; mimeType: string; fileName: string }>,
      content: string = '',
      replyTo?: ReplyMetadataResponse | null
    ) => {
      if (!singletonClient?.connected || !fileAssets.length) return

      setIsUploading(true)
      try {
        const uploaded = await Promise.all(
          fileAssets.map(async ({ uri, mimeType, fileName }) => {
            const res = await messageApi.uploadFile(uri, mimeType, fileName)
            return res.data.data as AttachmentInfo
          })
        )

        const isImage = fileAssets[0].mimeType?.startsWith('image/')
        const isVideo = fileAssets[0].mimeType?.startsWith('video/')
        const type = isImage ? MessageType.IMAGE : isVideo ? MessageType.VIDEO : MessageType.FILE
        const finalContent = content.trim() || (isImage ? '[Hình ảnh]' : isVideo ? '[Video]' : '[Tệp tin]')

        const clientMessageId = `temp-${Date.now()}`
        const request: MessageSendRequest = {
          conversationId,
          content: finalContent,
          clientMessageId,
          attachments: uploaded,
          replyTo: replyTo
            ? { messageId: replyTo.messageId, senderId: replyTo.senderId, content: replyTo.content, type: replyTo.type }
            : undefined,
          isForwarded: false
        }
        sendMsgMutation.mutate(request)

        const now = new Date().toISOString()
        const optimisticMsg: MessageResponse = {
          id: clientMessageId,
          clientMessageId,
          senderId: user?.id || '',
          content: finalContent,
          type,
          status: MessageStatus.NORMAL,
          createdAt: now,
          lastModifiedAt: now,
          conversationId,
          senderName: user?.fullName ?? null,
          senderAvatar: null,
          replyTo: replyTo ?? null,
          isForwarded: false,
          attachments: uploaded
        }

        queryClient.setQueryData(messageKeys.messages(conversationId), (oldData: InfiniteData<any> | undefined) => {
          if (!oldData) return oldData
          const firstPage = oldData.pages[0]
          return {
            ...oldData,
            pages: [{ ...firstPage, data: [optimisticMsg, ...firstPage.data] }, ...oldData.pages.slice(1)]
          }
        })

        queryClient.setQueryData(messageKeys.conversationList(), (oldData: any) => {
          if (!oldData) return oldData
          const conversations: ConversationResponse[] = Array.isArray(oldData) ? oldData : (oldData?.data ?? [])
          const idx = conversations.findIndex((c) => c.id === conversationId)
          if (idx >= 0) {
            const updated: ConversationResponse = {
              ...conversations[idx],
              lastMessage: finalContent,
              lastMessageTime: now,
              isLastMessageFromMe: true,
              lastMessageType: type,
              lastMessageStatus: MessageStatus.NORMAL
            }
            const newList = [updated, ...conversations.filter((_, i) => i !== idx)]
            return Array.isArray(oldData) ? newList : { ...oldData, data: newList }
          }
          return oldData
        })
      } catch (err) {
        console.error('[sendFileMessage] upload failed:', err)
      } finally {
        setIsUploading(false)
      }
    },
    [user, queryClient, sendMsgMutation]
  )

  return { connected, sendMessage, revokeMessage, deleteMessageForMe, sendFileMessage, isUploading }
}
