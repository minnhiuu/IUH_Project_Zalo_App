import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { View, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { useAuthStore } from '@/store'
import {
  ChatHeader,
  MessageBubble,
  ChatInputBar,
  DateSeparator,
  MessageListSkeleton,
  ForwardMessageModal
} from '@/features/message/components'
import {
  useInfiniteMessages,
  usePartnerConversation,
  useMarkAsRead,
  useConversations
} from '@/features/message/queries'
import { useChatWebSocket } from '@/features/message/hooks'
import { MessageStatus, MessageType, type MessageResponse } from '@/features/message/schemas'
import { normalizeDateTime, parseMessageDate } from '@/features/message/utils'
import { messageApi } from '@/features/message/api'

export default function ChatScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'

  const params = useLocalSearchParams<{
    id: string
    name?: string
    avatar?: string
    userId?: string
    conversationId?: string
  }>()

  const user = useAuthStore((s) => s.user)
  const currentUserId = user?.id || ''

  // If we have conversationId directly, use it; otherwise get/create via partner
  const partnerId = params.userId || params.id
  const directConversationId = params.conversationId

  const { data: partnerConversation } = usePartnerConversation(
    partnerId,
    !directConversationId // only fetch if we don't have conversationId
  )

  const conversationId = directConversationId || partnerConversation?.id || ''
  const conversationName = params.name || partnerConversation?.name || 'Chat'
  const conversationAvatar = params.avatar || partnerConversation?.avatar
  const isOnline = partnerConversation?.status === 'ONLINE'
  const lastSeenAt = partnerConversation?.lastSeenAt

  // Messages
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteMessages(conversationId, 20, !!conversationId)

  // Mutations
  const {
    sendMessage: wsSendMessage,
    revokeMessage: wsRevokeMessage,
    deleteMessageForMe: wsDeleteForMe
  } = useChatWebSocket()
  const markAsReadMutation = useMarkAsRead()
  const { data: conversations = [] } = useConversations(0, 100, true)

  const [inputText, setInputText] = useState('')
  const [replyTo, setReplyTo] = useState<MessageResponse | null>(null)
  const [forwardMessage, setForwardMessage] = useState<MessageResponse | null>(null)
  const [isSendingFile, setIsSendingFile] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  // Flatten pages into message list (reversed for inverted FlatList)
  // and dedupe by stable key to avoid duplicate React keys from mixed WS/pagination updates.
  const messages: MessageResponse[] = useMemo(() => {
    const flat: MessageResponse[] = messagesData?.pages.flatMap((page) => page.data) ?? []
    const seen = new Set<string>()

    return flat.filter((msg) => {
      const stableKey =
        msg.id ||
        msg.clientMessageId ||
        `${msg.senderId}-${msg.createdAt || ''}-${msg.type}-${typeof msg.content === 'string' ? msg.content : ''}`

      if (seen.has(stableKey)) return false
      seen.add(stableKey)
      return true
    })
  }, [messagesData])
  const latestOwnMessage = messages.find(
    (msg) => msg.senderId === currentUserId && msg.status !== MessageStatus.REVOKED
  )
  const latestOwnMessageKey = latestOwnMessage ? latestOwnMessage.id || latestOwnMessage.clientMessageId || null : null

  // Mark as read when entering chat
  useEffect(() => {
    if (conversationId) {
      markAsReadMutation.mutate(conversationId)
    }
  }, [conversationId])

  const getReplyContentForSend = useCallback((msg: MessageResponse) => {
    if (msg.type === MessageType.IMAGE) {
      const firstAttachment = msg.attachments?.[0]
      return firstAttachment?.url || '[Hình ảnh]'
    }

    if (msg.type === MessageType.FILE) {
      const firstAttachment = msg.attachments?.[0]
      const fileName =
        firstAttachment?.originalFileName ||
        firstAttachment?.fileName ||
        (typeof msg.content === 'string' ? msg.content : '')

      if (fileName && fileName.trim()) {
        return fileName
      }
      return '[File]'
    }

    return msg.content || ''
  }, [])

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !conversationId) return

    wsSendMessage(
      conversationId,
      inputText.trim(),
      replyTo
        ? {
            messageId: replyTo.id,
            senderId: replyTo.senderId,
            senderName: replyTo.senderName ?? null,
            content: getReplyContentForSend(replyTo),
            type: replyTo.type
          }
        : null,
      false
    )

    setInputText('')
    setReplyTo(null)
  }, [inputText, conversationId, replyTo, wsSendMessage, getReplyContentForSend])

  const handleSendImage = useCallback(
    async (images: { uri: string; fileName: string; mimeType: string }[]) => {
      if (!conversationId || images.length === 0) return
      setIsSendingFile(true)
      try {
        const uploadResults = await Promise.all(
          images.map((img) => messageApi.uploadFile(img.uri, img.fileName, img.mimeType, 'chat'))
        )
        const attachments = uploadResults.map((res) => res.data.data)
        wsSendMessage(conversationId, '', null, false, attachments, MessageType.IMAGE)
      } catch (e) {
        Alert.alert('Lỗi', 'Không thể gửi hình ảnh')
      } finally {
        setIsSendingFile(false)
      }
    },
    [conversationId, wsSendMessage]
  )

  const handleSendFile = useCallback(
    async (uri: string, fileName: string, mimeType: string) => {
      if (!conversationId) return
      setIsSendingFile(true)
      try {
        const res = await messageApi.uploadFile(uri, fileName, mimeType, 'chat')
        const attachment = res.data.data
        wsSendMessage(conversationId, fileName, null, false, [attachment], MessageType.FILE)
      } catch (e) {
        Alert.alert('Lỗi', 'Không thể gửi tệp')
      } finally {
        setIsSendingFile(false)
      }
    },
    [conversationId, wsSendMessage]
  )

  const handleRevoke = useCallback(
    (messageId: string) => {
      if (!conversationId) return
      wsRevokeMessage(messageId, conversationId)
    },
    [conversationId, wsRevokeMessage]
  )

  const handleDeleteForMe = useCallback(
    (messageId: string) => {
      if (!conversationId) return
      wsDeleteForMe(messageId, conversationId)
    },
    [conversationId, wsDeleteForMe]
  )

  const handleReply = useCallback((message: MessageResponse) => {
    setReplyTo(message)
  }, [])

  const handleForward = useCallback((message: MessageResponse) => {
    setForwardMessage(message)
  }, [])

  const handleReplyMessagePress = useCallback(
    (replyMessageId: string) => {
      const targetIndex = messages.findIndex(
        (m) => m.id === replyMessageId || m.clientMessageId === replyMessageId
      )

      if (targetIndex >= 0) {
        flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true, viewPosition: 0.5 })
        return
      }

      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [messages, hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  const handleSubmitForward = useCallback(
    (conversationIds: string[], note: string) => {
      if (!forwardMessage) return
      const forwardedPayload =
        forwardMessage.content?.trim() ||
        (forwardMessage.type === MessageType.IMAGE
          ? '[IMAGE]'
          : forwardMessage.type === MessageType.FILE
            ? '[FILE]'
            : '[FORWARDED]')
      const notePayload = note.trim()

      conversationIds.forEach((targetConversationId) => {
        wsSendMessage(targetConversationId, forwardedPayload, null, true)
        if (notePayload) {
          wsSendMessage(targetConversationId, notePayload, null, false)
        }
      })
      setForwardMessage(null)
    },
    [forwardMessage, wsSendMessage]
  )

  // Date separator logic
  const getDateLabel = (dateStr: string | null): string => {
    if (!dateStr) return ''
    try {
      const d = parseMessageDate(dateStr)
      if (!d) return ''
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today.getTime() - 86400000)
      const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

      const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

      if (msgDate.getTime() === today.getTime()) return time
      if (msgDate.getTime() === yesterday.getTime()) return `${time} ${t('message.yesterday')}`
      return `${time} ${d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`
    } catch {
      return ''
    }
  }

  const shouldShowDateSeparator = (index: number) => {
    if (index === messages.length - 1) return true // oldest message (inverted)
    const current = messages[index]
    const next = messages[index + 1] // next = older in inverted list
    if (!current.createdAt || !next.createdAt) return false
    try {
      const currentDate = parseMessageDate(current.createdAt)
      const nextDate = parseMessageDate(next.createdAt)
      if (!currentDate || !nextDate) return false
      // Show separator if messages are > 30 min apart
      return Math.abs(currentDate.getTime() - nextDate.getTime()) > 30 * 60 * 1000
    } catch {
      return false
    }
  }

  const chatBg = isDark ? '#0D1117' : '#E8ECEF'

  return (
    <View style={{ flex: 1, backgroundColor: chatBg }}>
      <ChatHeader
        name={conversationName}
        avatar={conversationAvatar}
        isOnline={isOnline}
        lastSeenAt={lastSeenAt}
        userId={partnerId}
        onProfilePress={() => {
          if (partnerId) router.push(`/other-profile/${partnerId}` as any)
        }}
        onMenu={() => {
          if (!partnerId) return
          router.push({
            pathname: '/message-options' as any,
            params: {
              id: partnerId,
              name: conversationName,
              isFriend: 'true'
            }
          })
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <MessageListSkeleton />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id || item.clientMessageId || `msg-${index}`}
            inverted
            contentContainerStyle={{ paddingVertical: 8 }}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                  index: Math.min(info.index, messages.length - 1),
                  animated: true,
                  viewPosition: 0.5
                })
              }, 150)
            }}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage()
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <ActivityIndicator size='small' color='#0068FF' />
                </View>
              ) : null
            }
            renderItem={({ item, index }) => {
              const isOwn = item.senderId === currentUserId
              const prevMsg = index > 0 ? messages[index - 1] : null
              // In inverted list, index 0 = newest. prevMsg = next newer message
              const showAvatar =
                !isOwn && (!prevMsg || prevMsg.senderId !== item.senderId || prevMsg.senderId === currentUserId)
              // Show time only on the newest message in a consecutive sender streak.
              const showTime = !prevMsg || prevMsg.senderId !== item.senderId
              const showDateSep = shouldShowDateSeparator(index)

              return (
                <View>
                  {showDateSep && <DateSeparator label={getDateLabel(item.createdAt)} />}
                  <MessageBubble
                    message={item}
                    isOwn={isOwn}
                    isLatestOwnMessage={
                      !!latestOwnMessageKey &&
                      (item.id === latestOwnMessageKey || item.clientMessageId === latestOwnMessageKey)
                    }
                    showTime={showTime}
                    showAvatar={showAvatar}
                    onAvatarPress={(userId) => router.push(`/user-profile/${userId}` as any)}
                    onReply={handleReply}
                    onReplyMessagePress={handleReplyMessagePress}
                    onRevoke={isOwn ? handleRevoke : undefined}
                    onDeleteForMe={handleDeleteForMe}
                    onForward={handleForward}
                    onOpenMessageOptions={() => {
                      if (!partnerId) return
                      router.push({
                        pathname: '/message-options' as any,
                        params: {
                          id: partnerId,
                          name: conversationName,
                          isFriend: 'true'
                        }
                      })
                    }}
                  />
                </View>
              )
            }}
          />
        )}

        <ChatInputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          onSendImage={handleSendImage}
          onSendFile={handleSendFile}
          isSendingFile={isSendingFile}
          placeholder={t('message.inputPlaceholder')}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      </KeyboardAvoidingView>

      <ForwardMessageModal
        visible={!!forwardMessage}
        sourceMessage={forwardMessage}
        conversations={conversations}
        onClose={() => setForwardMessage(null)}
        onSubmit={handleSubmitForward}
      />
    </View>
  )
}
