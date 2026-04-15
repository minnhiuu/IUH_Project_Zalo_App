import React, { useState, useRef, useCallback, useEffect } from 'react'
import { View, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
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
import { normalizeDateTime } from '@/features/message/utils'

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
  const flatListRef = useRef<FlatList>(null)

  // Flatten pages into message list (reversed for inverted FlatList)
  const messages: MessageResponse[] = messagesData?.pages.flatMap((page) => page.data) ?? []
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
            content: replyTo.content || '',
            type: replyTo.type
          }
        : null,
      false
    )

    setInputText('')
    setReplyTo(null)
  }, [inputText, conversationId, replyTo, wsSendMessage])

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
      const normalized = normalizeDateTime(dateStr)
      if (!normalized) return ''
      const d = new Date(normalized)
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
      const currentDate = new Date(normalizeDateTime(current.createdAt) || '')
      const nextDate = new Date(normalizeDateTime(next.createdAt) || '')
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
              const nextMsg = index < messages.length - 1 ? messages[index + 1] : null
              // In inverted list, index 0 = newest. prevMsg = next newer message
              const showAvatar =
                !isOwn && (!prevMsg || prevMsg.senderId !== item.senderId || prevMsg.senderId === currentUserId)
              // Show time only for the newest message in a consecutive sender streak
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
