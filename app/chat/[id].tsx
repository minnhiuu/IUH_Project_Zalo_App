import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { Text } from '@/components/ui/text'
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
  useConversations,
  usePinnedMessages,
  usePinMessage,
  useUnpinMessage
} from '@/features/message/queries'
import { useChatWebSocket } from '@/features/message/hooks'
import { MessageStatus, MessageType, type MessageResponse, type PinnedMessageInfo } from '@/features/message/schemas'
import { parseBusinessCardContent, parseMessageDate } from '@/features/message/utils'
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
  const pinMessageMutation = usePinMessage()
  const unpinMessageMutation = useUnpinMessage()
  const { data: conversations = [] } = useConversations(0, 100, true)
  const { data: pinnedMessages = [] } = usePinnedMessages(conversationId, !!conversationId)

  const [inputText, setInputText] = useState('')
  const [replyTo, setReplyTo] = useState<MessageResponse | null>(null)
  const [forwardMessage, setForwardMessage] = useState<MessageResponse | null>(null)
  const [isSendingFile, setIsSendingFile] = useState(false)
  const [showPinnedPanel, setShowPinnedPanel] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  const pinnedMessagesSorted = useMemo(() => {
    return [...pinnedMessages].sort((a, b) => {
      const dateA = parseMessageDate(a.pinnedAt)?.getTime() || 0
      const dateB = parseMessageDate(b.pinnedAt)?.getTime() || 0
      return dateB - dateA
    })
  }, [pinnedMessages])

  const latestPinnedMessage = pinnedMessagesSorted[0] ?? null

  const pinnedMessageIds = useMemo(() => new Set(pinnedMessages.map((pin) => pin.messageId)), [pinnedMessages])

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

  const getPinnedPreviewText = useCallback((pinned: PinnedMessageInfo | null) => {
    if (!pinned) return ''

    const content = (pinned.contentSnapshot || '').trim()
    const businessCard = parseBusinessCardContent(content)

    if (businessCard) {
      return `[Danh thiếp] ${businessCard.name}`
    }

    if (pinned.messageType === MessageType.IMAGE || content === '[IMAGE]') {
      return '[Hình ảnh]'
    }

    if (pinned.messageType === MessageType.FILE || content === '[FILE]') {
      return content && content !== '[FILE]' ? `[File] ${content}` : '[File]'
    }

    return content || '[Tin nhắn]'
  }, [])

  const getPinnedOwnerName = useCallback(
    (pinned: PinnedMessageInfo | null) => {
      if (!pinned) return t('message.pinned.userFallback', { defaultValue: 'Người dùng' })

      const sourceMessage = messages.find(
        (m) => m.id === pinned.messageId || m.clientMessageId === pinned.messageId
      )

      const ownerName = sourceMessage?.senderName?.trim() || pinned.pinnedByName?.trim()
      return ownerName || t('message.pinned.userFallback', { defaultValue: 'Người dùng' })
    },
    [messages, t]
  )

  const extractErrorMessage = useCallback((error: any, fallback: string) => {
    const responseMessage = error?.response?.data?.message
    const errorMessage = error?.message

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage.trim()
    }
    if (typeof errorMessage === 'string' && errorMessage.trim()) {
      return errorMessage.trim()
    }
    return fallback
  }, [])

  const canPinMessage = useCallback((message: MessageResponse) => {
    if (!message.id || message.id.startsWith('temp-')) return false
    if (message.status === MessageStatus.REVOKED) return false
    if (message.type === MessageType.SYSTEM || message.type === MessageType.JOIN || message.type === MessageType.LEAVE) {
      return false
    }
    return true
  }, [])

  const handlePinMessage = useCallback(
    (message: MessageResponse) => {
      if (!conversationId) return

      if (!canPinMessage(message)) {
        Alert.alert(
          t('message.pinned.unsupportedTitle', { defaultValue: 'Không thể ghim' }),
          t('message.pinned.unsupportedDesc', { defaultValue: 'Tin nhắn này không hỗ trợ ghim' })
        )
        return
      }

      const isPinned = pinnedMessageIds.has(message.id)

      if (!isPinned && pinnedMessagesSorted.length >= 3) {
        Toast.show({
          type: 'error',
          text1: t('message.pinned.maxReachedTitle', { defaultValue: 'Không thể ghim' }),
          text2: t('message.pinned.maxReachedDesc', { defaultValue: 'Chỉ được ghim tối đa 3 tin nhắn' }),
          position: 'top',
          topOffset: Math.max(80, Math.round(Dimensions.get('window').height * 0.44)),
          visibilityTime: 2200
        })
        return
      }

      if (isPinned) {
        unpinMessageMutation.mutate(
          { conversationId, messageId: message.id },
          {
            onSuccess: () => {
              Alert.alert(
                t('message.pinned.unpinSuccessTitle', { defaultValue: 'Thành công' }),
                t('message.pinned.unpinSuccessDesc', { defaultValue: 'Đã bỏ ghim tin nhắn' })
              )
            },
            onError: (error) => {
              Alert.alert(
                t('message.pinned.unpinFailTitle', { defaultValue: 'Bỏ ghim thất bại' }),
                extractErrorMessage(
                  error,
                  t('message.pinned.unpinFailDesc', { defaultValue: 'Không thể bỏ ghim tin nhắn' })
                )
              )
            }
          }
        )
        return
      }

      pinMessageMutation.mutate(
        { conversationId, messageId: message.id },
        {
          onSuccess: () => {
            Alert.alert(
              t('message.pinned.pinSuccessTitle', { defaultValue: 'Thành công' }),
              t('message.pinned.pinSuccessDesc', { defaultValue: 'Đã ghim tin nhắn' })
            )
          },
          onError: (error) => {
            Alert.alert(
              t('message.pinned.pinFailTitle', { defaultValue: 'Ghim thất bại' }),
              extractErrorMessage(error, t('message.pinned.pinFailDesc', { defaultValue: 'Không thể ghim tin nhắn' }))
            )
          }
        }
      )
    },
    [
      canPinMessage,
      conversationId,
      extractErrorMessage,
      pinMessageMutation,
      pinnedMessageIds,
      unpinMessageMutation
    ]
  )

  const openPinnedPanel = useCallback(() => {
    if (!latestPinnedMessage) return
    setShowPinnedPanel(true)
  }, [latestPinnedMessage])

  const closePinnedPanel = useCallback(() => {
    setShowPinnedPanel(false)
  }, [])

  const handleSubmitForward = useCallback(
    (conversationIds: string[], note: string) => {
      if (!forwardMessage) return

      const isMediaMessage =
        (forwardMessage.type === MessageType.IMAGE || forwardMessage.type === MessageType.FILE) &&
        !!forwardMessage.attachments?.length

      const rawContent = typeof forwardMessage.content === 'string' ? forwardMessage.content.trim() : ''

      const forwardedPayload = isMediaMessage
        ? forwardMessage.type === MessageType.FILE && rawContent && rawContent !== '[FILE]'
          ? rawContent
          : ''
        : rawContent || '[FORWARDED]'

      const forwardType = isMediaMessage ? forwardMessage.type : MessageType.CHAT
      const forwardAttachments = isMediaMessage ? forwardMessage.attachments || undefined : undefined
      const notePayload = note.trim()

      conversationIds.forEach((targetConversationId) => {
        wsSendMessage(targetConversationId, forwardedPayload, null, true, forwardAttachments, forwardType)
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

      {!!latestPinnedMessage && (
        <View style={{ paddingHorizontal: 10, paddingTop: 6, paddingBottom: 4, backgroundColor: chatBg }}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={openPinnedPanel}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: 74,
              paddingHorizontal: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 3
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                borderWidth: 1.2,
                borderColor: '#36A7FF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10
              }}
            >
              <Ionicons name='chatbubble-ellipses-outline' size={17} color='#36A7FF' />
            </View>

            <View style={{ flex: 1, paddingVertical: 8 }}>
              <Text style={{ fontSize: 15, color: '#2B2B2B' }} numberOfLines={1}>
                {getPinnedPreviewText(latestPinnedMessage)}
              </Text>
              <Text style={{ fontSize: 13, color: '#8A8A8A', marginTop: 2 }} numberOfLines={1}>
                {t('message.pinned.owner', {
                  defaultValue: 'Tin nhắn của {{name}}',
                  name: getPinnedOwnerName(latestPinnedMessage)
                })}
              </Text>
            </View>

            <View style={{ width: 1, height: 38, backgroundColor: '#E4E4E4', marginHorizontal: 12 }} />

            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderWidth: 1.4,
                borderColor: '#B8B8B8',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name='chevron-down' size={18} color='#7D7D7D' />
            </View>
          </TouchableOpacity>
        </View>
      )}

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
                    isPinned={!!item.id && pinnedMessageIds.has(item.id)}
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
                    onPin={handlePinMessage}
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

      <Modal transparent visible={showPinnedPanel} animationType='fade' onRequestClose={closePinnedPanel}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' }}
          onPress={closePinnedPanel}
        >
          <Pressable onPress={() => {}} style={{ marginTop: 104 }}>
            <View
              style={{
                marginHorizontal: 8,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                overflow: 'hidden'
              }}
            >
              <Text
                style={{
                  fontSize: 19,
                  color: '#232323',
                  fontWeight: '700',
                  paddingHorizontal: 14,
                  paddingTop: 12,
                  paddingBottom: 10
                }}
              >
                {t('message.pinned.upcomingTitle', { defaultValue: 'Nhắc hẹn sắp tới' })}
              </Text>
              <View style={{ height: 1, backgroundColor: '#EBEBEB' }} />
              <Text
                style={{
                  fontSize: 18,
                  color: '#8A8F94',
                  textAlign: 'center',
                  paddingVertical: 16
                }}
              >
                {t('message.pinned.upcomingEmpty', { defaultValue: 'Chưa có nhắc hẹn nào' })}
              </Text>
            </View>

            <View
              style={{
                marginHorizontal: 8,
                marginTop: 8,
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                overflow: 'hidden'
              }}
            >
              <Text
                style={{
                  fontSize: 19,
                  color: '#232323',
                  fontWeight: '700',
                  paddingHorizontal: 14,
                  paddingTop: 12,
                  paddingBottom: 10
                }}
              >
                {t('message.pinned.listTitle', { defaultValue: 'Danh sách ghim' })}
              </Text>
              <View style={{ height: 1, backgroundColor: '#EBEBEB' }} />

              {pinnedMessagesSorted.map((pinned, index) => (
                <TouchableOpacity
                  key={`${pinned.messageId}-${index}`}
                  activeOpacity={0.78}
                  onPress={() => {
                    closePinnedPanel()
                    handleReplyMessagePress(pinned.messageId)
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: '#F0F0F0'
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      borderWidth: 1.2,
                      borderColor: '#36A7FF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10
                    }}
                  >
                    <Ionicons name='chatbubble-ellipses-outline' size={17} color='#36A7FF' />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, color: '#2B2B2B' }} numberOfLines={1}>
                      {getPinnedPreviewText(pinned)}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#8A8A8A', marginTop: 2 }} numberOfLines={1}>
                      {t('message.pinned.owner', {
                        defaultValue: 'Tin nhắn của {{name}}',
                        name: getPinnedOwnerName(pinned)
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              {!pinnedMessagesSorted.length && (
                <Text
                  style={{
                    fontSize: 17,
                    color: '#8A8F94',
                    textAlign: 'center',
                    paddingVertical: 14
                  }}
                >
                  {t('message.pinned.empty', { defaultValue: 'Chưa có tin nhắn ghim' })}
                </Text>
              )}
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 10,
                marginHorizontal: 14,
                paddingHorizontal: 6
              }}
            >
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() =>
                  Alert.alert(
                    t('message.pinned.editComingSoonTitle', { defaultValue: 'Thông báo' }),
                    t('message.pinned.editComingSoonDesc', {
                      defaultValue: 'Chức năng chỉnh sửa danh sách ghim đang phát triển.'
                    })
                  )
                }
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
              >
                <Ionicons name='create-outline' size={28} color='#FFFFFF' style={{ marginRight: 8 }} />
                <Text style={{ color: '#FFFFFF', fontSize: 20 }}>
                  {t('message.pinned.edit', { defaultValue: 'Chỉnh sửa' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={closePinnedPanel}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 20, marginRight: 6 }}>
                  {t('message.pinned.collapse', { defaultValue: 'Thu gọn' })}
                </Text>
                <Ionicons name='chevron-up' size={24} color='#FFFFFF' />
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
