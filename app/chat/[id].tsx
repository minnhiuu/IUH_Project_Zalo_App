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
  Dimensions,
  BackHandler,
  DeviceEventEmitter,
  TextInput
} from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useDebounce } from '@/hooks/useDebounce'
import { Colors, HEADER } from '@/constants/theme'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAuthStore } from '@/store'
import {
  ChatHeader,
  MessageBubble,
  ChatInputBar,
  DateSeparator,
  MessageListSkeleton,
  ForwardMessageModal,
  GroupChatIntro
} from '@/features/message/components'
import type { FileAsset, BusinessCardAsset } from '@/features/message/components'
import {
  useInfiniteMessages,
  usePartnerConversation,
  useMarkAsRead,
  useConversations,
  usePinnedMessages,
  usePinMessage,
  useUnpinMessage,
  useConversationParticipants
} from '@/features/message/queries'
import { useNavigateSearch } from '@/features/search/queries'
import { SearchNavigationBar } from '@/features/search/components/messages/search-navigation-bar'
import type { ConversationSearchResponse } from '@/features/search/schemas'
import { useChatWebSocket } from '@/features/message/hooks'
import {
  MessageStatus,
  MessageType,
  type MessageResponse,
  type PinnedMessageInfo,
  type ConversationMemberResponse
} from '@/features/message/schemas'
import { parseBusinessCardContent, parseMessageDate, serializeBusinessCard } from '@/features/message/utils'
import { messageApi } from '@/features/message/api'
import { userApi } from '@/features/users/api/user.api'

export default function ChatScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()

  const params = useLocalSearchParams<{
    id: string
    name?: string
    avatar?: string
    userId?: string
    conversationId?: string
    aroundMessageId?: string
    searchKeyword?: string
    isSearchMode?: string
  }>()

  const user = useAuthStore((s) => s.user)
  const currentUserId = user?.id || ''

  const routeAroundMessageId = params.aroundMessageId
  const [activeAroundMessageId, setActiveAroundMessageId] = useState<string | null>(routeAroundMessageId || null)
  const searchKeyword = params.searchKeyword || null
  const consumedJumpTargetRef = useRef<string | null>(null)

  const isSearchMessageJump = !!routeAroundMessageId
  const directConversationId = params.conversationId || (isSearchMessageJump ? params.id : undefined)
  const partnerId = params.userId || (directConversationId ? '' : params.id)

  const { data: partnerConversation } = usePartnerConversation(partnerId, !directConversationId)

  const conversationId = directConversationId || partnerConversation?.id || ''

  // Messages
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    isLoading
  } = useInfiniteMessages(conversationId, 20, !!conversationId, activeAroundMessageId)

  const messages: MessageResponse[] = useMemo(() => {
    return messagesData?.pages.flatMap((page) => page.data) ?? []
  }, [messagesData])
  const lastNonEmptyMessagesRef = useRef<MessageResponse[]>([])
  if (messages.length > 0) {
    lastNonEmptyMessagesRef.current = messages
  }
  const visibleMessages = messages.length > 0 ? messages : lastNonEmptyMessagesRef.current

  const scrollToMessage = useCallback(
    (messageId: string, animated: boolean = true) => {
      const index = messages.findIndex((m) => m.id === messageId)
      if (index === -1) return
      try {
        flatListRef.current?.scrollToIndex({ index, animated, viewPosition: 0.5 })
      } catch {}
      setHighlightedMessageId(messageId)
      setHighlightBackgroundMessageId(messageId)
      setTimeout(() => setHighlightBackgroundMessageId(null), 3000)
    },
    [messages]
  )

  // Mutations
  const {
    sendMessage: wsSendMessage,
    revokeMessage: wsRevokeMessage,
    deleteMessageForMe: wsDeleteForMe,
    sendFileMessage: wsSendFileMessage,
    isUploading
  } = useChatWebSocket()
  const markAsReadMutation = useMarkAsRead()
  const pinMessageMutation = usePinMessage()
  const unpinMessageMutation = useUnpinMessage()
  const { data: conversations = [] } = useConversations(0, 100, true)
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === conversationId),
    [conversations, conversationId]
  )

  const resolvedConversation = activeConversation || partnerConversation
  const isGroupConversation = !!resolvedConversation?.isGroup
  const conversationName = params.name || resolvedConversation?.name || 'Chat'
  const conversationAvatar = params.avatar || resolvedConversation?.avatar
  const isOnline = resolvedConversation?.status === 'ONLINE'
  const lastSeenAt = resolvedConversation?.lastSeenAt
  const groupMembers = resolvedConversation?.members || []
  const effectiveMembers = useMemo<ConversationMemberResponse[]>(() => {
    const base = resolvedConversation?.members || []
    if (!partnerId) return base
    if (base.find((m) => m.userId === partnerId)) return base
    return [
      ...base,
      {
        userId: partnerId,
        fullName: params.name || 'Chat',
        avatar: params.avatar || null,
        lastReadMessageId: null,
        role: null
      }
    ]
  }, [resolvedConversation?.members, partnerId, params.name, params.avatar])
  const myGroupRole = String(groupMembers.find((m) => m.userId === currentUserId)?.role || 'MEMBER').toUpperCase()
  const isMemberRole = myGroupRole === 'MEMBER'
  const groupSettings = (resolvedConversation as any)?.settings || {}
  const isMemberMessageLocked = isGroupConversation && isMemberRole && groupSettings?.memberCanSendMessages === false
  const groupSubtitle = isGroupConversation ? `${groupMembers.length || 0} thành viên` : undefined
  const { data: pinnedMessages = [] } = usePinnedMessages(conversationId, !!conversationId)

  const [inputText, setInputText] = useState('')
  const [replyTo, setReplyTo] = useState<MessageResponse | null>(null)
  const [forwardMessage, setForwardMessage] = useState<MessageResponse | null>(null)
  const [pendingAttachments, setPendingAttachments] = useState<FileAsset[]>([])
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [highlightBackgroundMessageId, setHighlightBackgroundMessageId] = useState<string | null>(null)
  const [showPinnedPanel, setShowPinnedPanel] = useState(false)

  // Search Mode
  const [isSearchMode, setIsSearchMode] = useState(!!params.searchKeyword || params.isSearchMode === 'true')
  const [internalSearchQuery, setInternalSearchQuery] = useState(params.searchKeyword || '')
  const [senderSearchQuery, setSenderSearchQuery] = useState('')
  const [isSenderPickerOpen, setIsSenderPickerOpen] = useState(false)
  const [selectedSearchSender, setSelectedSearchSender] = useState<ConversationSearchResponse | null>(null)
  const [navigationData, setNavigationData] = useState<{
    index: number
    total: number
    currentMessageId: string
  } | null>(null)
  const debouncedSearchQuery = useDebounce(internalSearchQuery, 500)
  const debouncedSenderSearchQuery = useDebounce(senderSearchQuery, 300)

  const navigateSearchMutation = useNavigateSearch()
  const navigateSearch = navigateSearchMutation.mutate
  const isSearchNavigationPending = navigateSearchMutation.isPending
  const flatListRef = useRef<FlatList>(null)
  const searchInputRef = useRef<TextInput | null>(null)
  const lastAutoSearchQueryRef = useRef<string | null>(null)
  const initializedSearchJumpRef = useRef<string | null>(null)
  const selectedSearchSenderId = selectedSearchSender?.recipientId || null
  const senderPickerQuery = isSenderPickerOpen ? debouncedSenderSearchQuery.trim() : ''
  const { data: searchParticipants = [], isFetching: isFetchingSearchParticipants } = useConversationParticipants(
    conversationId,
    senderPickerQuery,
    isSearchMode && isGroupConversation && isSenderPickerOpen
  )
  const searchSenders = useMemo<ConversationSearchResponse[]>(
    () =>
      searchParticipants.map((participant) => ({
        conversationId,
        recipientId: participant.userId,
        name: participant.fullName,
        avatar: participant.avatar,
        group: false,
        memberCount: 0,
        participantNames: null,
        participantAvatars: null,
        displayHighlights: null
      })),
    [conversationId, searchParticipants]
  )
  const headerSearchValue = isSenderPickerOpen ? senderSearchQuery : internalSearchQuery
  const setHeaderSearchValue = isSenderPickerOpen ? setSenderSearchQuery : setInternalSearchQuery
  const selectedSearchSenderName = selectedSearchSender
    ? selectedSearchSender.recipientId === currentUserId
      ? t('search.youWithName', { name: selectedSearchSender.name, defaultValue: `You (${selectedSearchSender.name})` })
      : selectedSearchSender.name
    : null

  // Navigation Logic
  const handleSearchNavigation = useCallback(
    (direction: 'NEXT' | 'PREVIOUS') => {
      const keyword = internalSearchQuery.trim()
      if (!conversationId || (!keyword && !selectedSearchSenderId) || isSearchNavigationPending) return

      let targetId = navigationData?.currentMessageId || activeAroundMessageId || ''
      let targetDirection = direction

      if (navigationData) {
        if (direction === 'NEXT' && navigationData.index === navigationData.total) {
          // At last result, go to FIRST
          targetId = '' // Empty ID to start from beginning
          targetDirection = 'NEXT'
        } else if (direction === 'PREVIOUS' && navigationData.index === 1) {
          // At first result, go to LAST
          targetId = '' // Empty ID to start from beginning
          targetDirection = 'PREVIOUS'
        }
      }

      navigateSearch(
        {
          keyword,
          conversationId,
          currentMessageId: targetId,
          direction: targetDirection,
          senderId: selectedSearchSenderId
        },
        {
          onSuccess: (response) => {
            const data = response.data.data
            setNavigationData({
              index: data.index,
              total: data.total,
              currentMessageId: data.messageId
            })
            consumedJumpTargetRef.current = null
            setActiveAroundMessageId(data.messageId)
          }
        }
      )
    },
    [
      conversationId,
      internalSearchQuery,
      selectedSearchSenderId,
      navigationData,
      activeAroundMessageId,
      navigateSearch,
      isSearchNavigationPending
    ]
  )

  const handleStartSearch = useCallback(() => {
    if ((!internalSearchQuery.trim() && !selectedSearchSenderId) || isSearchNavigationPending) return
    handleSearchNavigation('NEXT')
  }, [internalSearchQuery, selectedSearchSenderId, handleSearchNavigation, isSearchNavigationPending])

  const handleCancelSearch = useCallback(() => {
    setIsSearchMode(false)
    setInternalSearchQuery('')
    setSenderSearchQuery('')
    setIsSenderPickerOpen(false)
    setSelectedSearchSender(null)
    setNavigationData(null)
    setHighlightedMessageId(null)
  }, [setIsSearchMode, setInternalSearchQuery, setNavigationData, setHighlightedMessageId])

  const handleOpenSearch = useCallback(() => {
    setIsSearchMode(true)
    setIsSenderPickerOpen(false)
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }, [])

  const handleOpenSenderPicker = useCallback(() => {
    if (!isGroupConversation) return
    setIsSearchMode(true)
    setIsSenderPickerOpen(true)
    setSenderSearchQuery('')
    requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
  }, [isGroupConversation])

  const handleSelectSearchSender = useCallback((sender: ConversationSearchResponse) => {
    setSelectedSearchSender(sender)
    setIsSenderPickerOpen(false)
    setSenderSearchQuery('')
    setInternalSearchQuery('')
    setNavigationData(null)
    setHighlightedMessageId(null)
    lastAutoSearchQueryRef.current = null
    requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
  }, [])

  const handleSenderLabelPress = useCallback(() => {
    setIsSenderPickerOpen(true)
    setSenderSearchQuery('')
    requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
  }, [])

  const handleSearchKeyPress = useCallback((key: string) => {
    if (key !== 'Backspace' || isSenderPickerOpen || internalSearchQuery.length > 0 || !selectedSearchSender) {
      return
    }

    setSelectedSearchSender(null)
    setSenderSearchQuery('')
    setIsSenderPickerOpen(false)
    setNavigationData(null)
    setHighlightedMessageId(null)
    lastAutoSearchQueryRef.current = null
    requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
  }, [internalSearchQuery, isSenderPickerOpen, selectedSearchSender])

  // React to isSearchMode param change (if user enters from menu again)
  useEffect(() => {
    if (params.isSearchMode === 'true') {
      setIsSearchMode(true)
    }

    // Listen for search toggle event from menu
    const sub = DeviceEventEmitter.addListener('ACTIVATE_CHAT_SEARCH', () => {
      handleOpenSearch()
    })
    return () => sub.remove()
  }, [params.isSearchMode, handleOpenSearch])

  useEffect(() => {
    const trimmedQuery = debouncedSearchQuery.trim()
    const searchKey = `${conversationId}:${selectedSearchSenderId || ''}:${trimmedQuery}`

    if (!isSearchMode || isSenderPickerOpen || !trimmedQuery) {
      if (!trimmedQuery) {
        lastAutoSearchQueryRef.current = null
        setNavigationData(null)
        setHighlightedMessageId(null)
      }
      return
    }

    if (lastAutoSearchQueryRef.current === searchKey) {
      return
    }

    if (activeAroundMessageId && params.searchKeyword === trimmedQuery && !selectedSearchSenderId) {
      return
    }

    if (!conversationId) {
      return
    }

    lastAutoSearchQueryRef.current = searchKey
    navigateSearch(
      {
        keyword: trimmedQuery,
        conversationId,
        currentMessageId: '',
        direction: 'NEXT',
        senderId: selectedSearchSenderId
      },
      {
        onSuccess: (response) => {
          const data = response.data.data
          setNavigationData({
            index: data.index,
            total: data.total,
            currentMessageId: data.messageId
          })
          consumedJumpTargetRef.current = null
          setActiveAroundMessageId(data.messageId)
        }
      }
    )
  }, [
    debouncedSearchQuery,
    selectedSearchSenderId,
    isSenderPickerOpen,
    isSearchMode,
    conversationId,
    params.searchKeyword,
    navigateSearch
  ])

  const pinnedMessagesSorted = useMemo(() => {
    return [...pinnedMessages].sort((a, b) => {
      const dateA = parseMessageDate(a.pinnedAt)?.getTime() || 0
      const dateB = parseMessageDate(b.pinnedAt)?.getTime() || 0
      return dateB - dateA
    })
  }, [pinnedMessages])

  const latestPinnedMessage = pinnedMessagesSorted[0] ?? null

  const pinnedMessageIds = useMemo(
    () => new Set(pinnedMessages.map((pin: PinnedMessageInfo) => pin.messageId)),
    [pinnedMessages]
  )

  useEffect(() => {
    if (!activeAroundMessageId || !messages.length) return
    if (consumedJumpTargetRef.current === activeAroundMessageId) return
    const found = messages.some((message) => message.id === activeAroundMessageId)
    if (!found) return
    consumedJumpTargetRef.current = activeAroundMessageId
    scrollToMessage(activeAroundMessageId)
  }, [activeAroundMessageId, messages, scrollToMessage])

  // Initialize navigation data if jumped from search
  useEffect(() => {
    const keyword = params.searchKeyword?.trim()
    const initKey = keyword && routeAroundMessageId && conversationId ? `${conversationId}:${routeAroundMessageId}:${keyword}` : null

    if (keyword && routeAroundMessageId && conversationId && initializedSearchJumpRef.current !== initKey) {
      initializedSearchJumpRef.current = initKey
      lastAutoSearchQueryRef.current = keyword
      setActiveAroundMessageId(routeAroundMessageId)
      navigateSearch(
        {
          keyword,
          conversationId,
          currentMessageId: routeAroundMessageId,
          direction: 'CURRENT'
        },
        {
          onSuccess: (response) => {
            const data = response.data.data
            setNavigationData({
              index: data.index,
              total: data.total,
              currentMessageId: data.messageId
            })
          }
        }
      )
    }
  }, [params.searchKeyword, routeAroundMessageId, conversationId, navigateSearch])

  // Handle Back Gesture/Button to exit search mode
  useEffect(() => {
    const onBackPress = () => {
      if (isSearchMode) {
        handleCancelSearch()
        return true // Prevent default behavior (going back)
      }
      return false // Use default behavior
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress)
    return () => subscription.remove()
  }, [isSearchMode, handleCancelSearch])

  const latestOwnMessage = messages.find(
    (msg) => msg.senderId === currentUserId && msg.status !== MessageStatus.REVOKED
  )
  const latestOwnMessageKey = latestOwnMessage ? latestOwnMessage.id || latestOwnMessage.clientMessageId || null : null

  useEffect(() => {
    if (conversationId) {
      markAsReadMutation.mutate(conversationId)
    }
  }, [conversationId])

  const handleSend = useCallback(() => {
    if (!conversationId) return

    const trimmedContent = inputText.trim()
    const replyPayload = replyTo
      ? {
          messageId: replyTo.id,
          senderId: replyTo.senderId,
          senderName: replyTo.senderName ?? null,
          content: replyTo.content || '',
          type: replyTo.type
        }
      : null

    if (pendingAttachments.length > 0) {
      wsSendFileMessage(conversationId, pendingAttachments, trimmedContent, replyPayload)
      setPendingAttachments([])
      setInputText('')
      setReplyTo(null)
      return
    }

    if (!trimmedContent) return

    wsSendMessage(conversationId, trimmedContent, replyPayload, false)

    setInputText('')
    setReplyTo(null)
  }, [conversationId, inputText, pendingAttachments, replyTo, wsSendFileMessage, wsSendMessage])

  const handleSendFile = useCallback((assets: FileAsset[]) => {
    setPendingAttachments((current) => [...current, ...assets])
  }, [])

  const handleSendFileImmediate = useCallback(
    (assets: FileAsset[]) => {
      if (!conversationId) return
      const replyPayload = replyTo
        ? {
            messageId: replyTo.id,
            senderId: replyTo.senderId,
            senderName: replyTo.senderName ?? null,
            content: replyTo.content || '',
            type: replyTo.type
          }
        : null
      wsSendFileMessage(conversationId, assets, '', replyPayload)
      setReplyTo(null)
    },
    [conversationId, replyTo, wsSendFileMessage]
  )

  const handleRemovePendingAttachment = useCallback((index: number) => {
    setPendingAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }, [])

  const handleClearPendingAttachments = useCallback(() => {
    setPendingAttachments([])
  }, [])

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

  const handleSendBusinessCards = useCallback(
    async (cards: BusinessCardAsset[]) => {
      if (!conversationId || !cards.length) return

      const resolvedCards = await Promise.all(
        cards.map(async (card) => {
          if (card.includePhone === false) {
            return { ...card, phone: '' }
          }
          if (card.phone?.trim()) return card
          if (!card.userId) return card

          try {
            const response = await userApi.getUserById(card.userId)
            const profile = response.data.data
            const profilePhone = profile?.accountInfo?.phoneNumber || ''
            return { ...card, phone: String(profilePhone || '').trim() }
          } catch {
            return card
          }
        })
      )

      resolvedCards.forEach((card) => {
        const qrValue = card.userId
          ? `bondhub://user/${card.userId}?name=${encodeURIComponent(card.name || '')}`
          : undefined
        const payload = serializeBusinessCard({
          userId: card.userId,
          name: card.name,
          phone: card.includePhone === false ? '' : card.phone || '',
          avatar: card.avatar || null,
          qrValue
        })
        wsSendMessage(conversationId, payload, null, false)
      })
    },
    [conversationId, wsSendMessage]
  )

  const handleBusinessCardPress = useCallback(
    (userId: string) => {
      if (!userId) return
      router.push(`/user-profile/${userId}` as any)
    },
    [router]
  )

  const handleBusinessCardMessagePress = useCallback(
    (userId: string) => {
      if (!userId) return
      const sourceCard = messages
        .map((m) => parseBusinessCardContent(m.content))
        .find((card) => card?.userId === userId)

      const nextName = sourceCard?.name || 'Chat'
      const nextAvatar = sourceCard?.avatar || undefined

      router.push({
        pathname: '/chat/[id]',
        params: { id: userId, userId, name: nextName, avatar: nextAvatar }
      } as any)
    },
    [messages, router]
  )

  const handleReplyMessagePress = useCallback(
    (replyMessageId: string) => {
      const targetIndex = messages.findIndex((m) => m.id === replyMessageId || m.clientMessageId === replyMessageId)
      if (targetIndex >= 0) {
        flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true, viewPosition: 0.5 })
        return
      }
      if (hasNextPage && !isFetchingNextPage) fetchNextPage()
    },
    [messages, hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  const getPinnedPreviewText = useCallback((pinned: PinnedMessageInfo | null) => {
    if (!pinned) return ''
    const content = (pinned.contentSnapshot || '').trim()
    const businessCard = parseBusinessCardContent(content)
    if (businessCard) return `[Danh thiếp] ${businessCard.name}`
    if (pinned.messageType === MessageType.IMAGE || content === '[IMAGE]') return '[Hình ảnh]'
    if (pinned.messageType === MessageType.FILE || content === '[FILE]') {
      return content && content !== '[FILE]' ? `[File] ${content}` : '[File]'
    }
    return content || '[Tin nhắn]'
  }, [])

  const getPinnedOwnerName = useCallback(
    (pinned: PinnedMessageInfo | null) => {
      if (!pinned) return t('message.pinned.userFallback', { defaultValue: 'Người dùng' })
      const sourceMessage = messages.find((m) => m.id === pinned.messageId || m.clientMessageId === pinned.messageId)
      const ownerName = sourceMessage?.senderName?.trim() || pinned.pinnedByName?.trim()
      return ownerName || t('message.pinned.userFallback', { defaultValue: 'Người dùng' })
    },
    [messages, t]
  )

  const handleScroll = useCallback(
    (event: any) => {
      const { contentOffset } = event.nativeEvent
      if (contentOffset.y < 50 && hasPreviousPage && !isFetchingPreviousPage && !isLoading && activeAroundMessageId) {
        fetchPreviousPage()
      }
    },
    [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage, isLoading, activeAroundMessageId]
  )

  const extractErrorMessage = useCallback((error: any, fallback: string) => {
    const responseMessage = error?.response?.data?.message
    const errorMessage = error?.message
    if (typeof responseMessage === 'string' && responseMessage.trim()) return responseMessage.trim()
    if (typeof errorMessage === 'string' && errorMessage.trim()) return errorMessage.trim()
    return fallback
  }, [])

  const canPinMessage = useCallback((message: MessageResponse) => {
    if (!message.id || message.id.startsWith('temp-')) return false
    if (message.status === MessageStatus.REVOKED) return false
    if (message.type === MessageType.SYSTEM || message.type === MessageType.JOIN || message.type === MessageType.LEAVE)
      return false
    return true
  }, [])

  const handlePinMessage = useCallback(
    (message: MessageResponse) => {
      if (!conversationId) return
      if (!canPinMessage(message)) {
        Alert.alert(t('message.pinned.unsupportedTitle'), t('message.pinned.unsupportedDesc'))
        return
      }

      const isPinned = pinnedMessageIds.has(message.id)

      if (!isPinned && pinnedMessagesSorted.length >= 3) {
        Toast.show({
          type: 'error',
          text1: t('message.pinned.maxReachedTitle'),
          text2: t('message.pinned.maxReachedDesc'),
          position: 'top',
          topOffset: Math.max(80, Math.round(Dimensions.get('window').height * 0.44)),
          visibilityTime: 2200
        })
        return
      }

      if (isPinned) {
        unpinMessageMutation.mutate({ conversationId, messageId: message.id })
        return
      }

      pinMessageMutation.mutate({ conversationId, messageId: message.id })
    },
    [
      canPinMessage,
      conversationId,
      pinMessageMutation,
      pinnedMessageIds,
      pinnedMessagesSorted.length,
      unpinMessageMutation,
      t
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
      conversationIds.forEach((targetId) => {
        wsSendMessage(targetId, forwardMessage.content || '', null, true, forwardMessage.attachments)
        if (note.trim()) wsSendMessage(targetId, note.trim(), null, false)
      })
      setForwardMessage(null)
    },
    [forwardMessage, wsSendMessage]
  )

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
    if (index === visibleMessages.length - 1) return true
    const current = visibleMessages[index]
    const next = visibleMessages[index + 1]
    if (!current.createdAt || !next.createdAt) return false
    try {
      const currentDate = parseMessageDate(current.createdAt)
      const nextDate = parseMessageDate(next.createdAt)
      if (!currentDate || !nextDate) return false
      return Math.abs(currentDate.getTime() - nextDate.getTime()) > 30 * 60 * 1000
    } catch {
      return false
    }
  }

  const chatBg = isDark ? '#0D1117' : '#E8ECEF'

  return (
    <View style={{ flex: 1, backgroundColor: chatBg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isSearchMode ? 'dark' : isDark ? 'light' : 'dark'} />
      <ChatHeader
        name={conversationName}
        avatar={conversationAvatar}
        isOnline={isGroupConversation ? undefined : isOnline}
        subtitle={groupSubtitle}
        lastSeenAt={lastSeenAt}
        userId={isGroupConversation ? undefined : partnerId}
        isGroup={isGroupConversation}
        isSearchMode={isSearchMode}
        searchQuery={headerSearchValue}
        setSearchQuery={setHeaderSearchValue}
        searchInputRef={searchInputRef}
        isSenderPickerMode={isSenderPickerOpen}
        selectedSearchSenderName={selectedSearchSenderName}
        onSenderLabelPress={handleSenderLabelPress}
        onSearchKeyPress={handleSearchKeyPress}
        onSearchPress={handleOpenSearch}
        onCancelSearch={handleCancelSearch}
        onSubmitSearch={handleStartSearch}
        onProfilePress={() => {
          if (!isGroupConversation && partnerId) router.push(`/other-profile/${partnerId}` as any)
        }}
        onMenu={() => {
          const targetId = conversationId || partnerId || params.id
          if (!targetId) return
          router.push({
            pathname: '/message-options' as any,
            params: {
              id: targetId,
              name: conversationName,
              isFriend: isGroupConversation ? 'false' : 'true',
              conversationId: conversationId || targetId
            }
          })
        }}
      />

      {isSearchMode && isSenderPickerOpen && isGroupConversation && (
        <View
          style={{
            position: 'absolute',
            top: insets.top + 56,
            left: 0,
            right: 0,
            maxHeight: 300,
            backgroundColor: isDark ? '#111827' : '#FFFFFF',
            zIndex: 1100,
            borderBottomWidth: 0.5,
            borderBottomColor: isDark ? '#374151' : '#E5E7EB'
          }}
        >
          {isFetchingSearchParticipants ? (
            <ActivityIndicator size='small' color='#0068FF' style={{ marginVertical: 18 }} />
          ) : (
            <FlatList
              keyboardShouldPersistTaps='handled'
              data={searchSenders}
              keyExtractor={(item, index) => item.recipientId || `${item.name}-${index}`}
              renderItem={({ item }) => {
                const senderName =
                  item.recipientId === currentUserId
                    ? t('search.youWithName', { name: item.name, defaultValue: `You (${item.name})` })
                    : item.name

                return (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => handleSelectSearchSender(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 38,
                      paddingVertical: 10
                    }}
                  >
                    <UserAvatar source={item.avatar} name={senderName} size='sm' />
                    <Text
                      style={{ marginLeft: 14, fontSize: 18, color: isDark ? '#F9FAFB' : '#222222' }}
                      numberOfLines={1}
                    >
                      {senderName}
                    </Text>
                  </TouchableOpacity>
                )
              }}
              ListEmptyComponent={
                <Text
                  style={{
                    paddingVertical: 20,
                    textAlign: 'center',
                    color: isDark ? '#9CA3AF' : '#8A8F94'
                  }}
                >
                  {t('search.noSenderResults', { defaultValue: 'No senders found' })}
                </Text>
              }
            />
          )}
        </View>
      )}

      {!!latestPinnedMessage && !isLoading && (
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
                {t('message.pinned.owner', { name: getPinnedOwnerName(latestPinnedMessage) })}
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

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {isLoading && visibleMessages.length === 0 && !isSearchMode ? (
          <View style={{ flex: 1 }}>
            <MessageListSkeleton includePinned />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={visibleMessages}
            keyExtractor={(item, index) => item.id || item.clientMessageId || `msg-${index}`}
            inverted
            contentContainerStyle={{
              paddingTop: isSearchMode ? 96 : 8,
              paddingBottom: 8,
              flexGrow: 1
            }}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage()
            }}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              <>
                {isGroupConversation && (
                  <GroupChatIntro
                    groupName={conversationName}
                    isDark={isDark}
                    texts={{
                      shareStory: t('message.groupIntro.shareStory'),
                      createdByYou: t('message.groupIntro.createdByYou'),
                      waveHello: t('message.groupIntro.waveHello'),
                      qrJoin: t('message.groupIntro.qrJoin')
                    }}
                    members={groupMembers}
                  />
                )}
                {isFetchingNextPage && !isSearchMode && (
                  <ActivityIndicator size='small' color='#0068FF' style={{ marginVertical: 10 }} />
                )}
              </>
            }
            renderItem={({ item, index }) => {
              const isOwn = item.senderId === currentUserId
              const prevMsg = index > 0 ? visibleMessages[index - 1] : null
              const nextMsg = index < visibleMessages.length - 1 ? visibleMessages[index + 1] : null
              const showAvatar = !isOwn && (!nextMsg || nextMsg.senderId !== item.senderId)
              const showTime = !prevMsg || prevMsg.senderId !== item.senderId
              const showDateSep = shouldShowDateSeparator(index)

              return (
                <View>
                  {showDateSep && <DateSeparator label={getDateLabel(item.createdAt)} />}
                  <MessageBubble
                    message={item}
                    isOwn={isOwn}
                    isPinned={!!item.id && pinnedMessageIds.has(item.id)}
                    showTime={showTime}
                    showAvatar={showAvatar}
                    showSenderName={isGroupConversation}
                    members={effectiveMembers}
                    onAvatarPress={(uid) => router.push(`/user-profile/${uid}` as any)}
                    onReply={handleReply}
                    onReplyMessagePress={handleReplyMessagePress}
                    onRevoke={isOwn ? handleRevoke : undefined}
                    onDeleteForMe={handleDeleteForMe}
                    onForward={handleForward}
                    onBusinessCardPress={handleBusinessCardPress}
                    onBusinessCardMessagePress={handleBusinessCardMessagePress}
                    onScrollToMessage={scrollToMessage}
                    isHighlighted={item.id === highlightedMessageId}
                    showHighlightBackground={item.id === highlightBackgroundMessageId}
                    onPin={handlePinMessage}
                    highlightKeyword={item.id === highlightedMessageId ? internalSearchQuery || searchKeyword : null}
                    onOpenMessageOptions={() => {
                      const targetId = isGroupConversation ? conversationId : partnerId
                      router.push({
                        pathname: '/message-options' as any,
                        params: {
                          id: targetId,
                          name: conversationName,
                          isFriend: isGroupConversation ? 'false' : 'true',
                          conversationId
                        }
                      })
                    }}
                  />
                </View>
              )
            }}
          />
        )}

        {!isMemberMessageLocked && !isSearchMode && (
          <ChatInputBar
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            placeholder={t('message.inputPlaceholder')}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSendFile={handleSendFile}
            onSendFileImmediate={handleSendFileImmediate}
            selectedAttachments={pendingAttachments}
            onRemoveAttachment={handleRemovePendingAttachment}
            onClearAttachments={handleClearPendingAttachments}
            isUploading={isUploading}
            onSendBusinessCards={handleSendBusinessCards}
          />
        )}
      </KeyboardAvoidingView>

      <ForwardMessageModal
        visible={!!forwardMessage}
        sourceMessage={forwardMessage}
        conversations={conversations}
        onClose={() => setForwardMessage(null)}
        onSubmit={handleSubmitForward}
      />

      <Modal transparent visible={showPinnedPanel} animationType='fade' onRequestClose={closePinnedPanel}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' }} onPress={closePinnedPanel}>
          <Pressable onPress={() => {}} style={{ marginTop: 104 }}>
            <View style={{ marginHorizontal: 8, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
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
                {t('message.pinned.upcomingTitle')}
              </Text>
              <View style={{ height: 1, backgroundColor: '#EBEBEB' }} />
              <Text
                style={{
                  fontSize: 18,
                  color: '#8A8F94',
                  textAlign: 'center',
                  paddingVertical: 40,
                  paddingHorizontal: 20
                }}
              >
                {t('message.pinned.upcomingDesc')}
              </Text>
            </View>

            <View style={{ marginTop: 12, marginHorizontal: 8, backgroundColor: '#FFFFFF', borderRadius: 12 }}>
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingTop: 12,
                  paddingBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Text style={{ fontSize: 19, color: '#232323', fontWeight: '700' }}>
                  {t('message.pinned.listTitle')} ({pinnedMessagesSorted.length})
                </Text>
                <TouchableOpacity onPress={closePinnedPanel}>
                  <Ionicons name='chevron-up' size={24} color='#7D7D7D' />
                </TouchableOpacity>
              </View>
              <View style={{ height: 1, backgroundColor: '#EBEBEB' }} />
              {pinnedMessagesSorted.map((pinned) => (
                <TouchableOpacity
                  key={pinned.messageId}
                  activeOpacity={0.7}
                  onPress={() => {
                    scrollToMessage(pinned.messageId)
                    closePinnedPanel()
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F5F5F5'
                  }}
                >
                  <Ionicons name='chatbubble-ellipses' size={20} color='#36A7FF' style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, color: '#2B2B2B' }} numberOfLines={1}>
                      {getPinnedPreviewText(pinned)}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#8A8A8A', marginTop: 2 }}>
                      {t('message.pinned.owner', { name: getPinnedOwnerName(pinned) })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {isSearchMode && (
        <SearchNavigationBar
          index={navigationData?.index || 0}
          total={navigationData?.total || 0}
          onPrev={() => handleSearchNavigation('PREVIOUS')}
          onNext={() => handleSearchNavigation('NEXT')}
          onSenderPress={isGroupConversation ? handleOpenSenderPicker : undefined}
          isSenderActive={!!selectedSearchSender}
          isLoading={isSearchNavigationPending}
          isDark={isDark}
        />
      )}
    </View>
  )
}
