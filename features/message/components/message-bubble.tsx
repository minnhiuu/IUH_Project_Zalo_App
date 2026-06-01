import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  TouchableOpacity,
  Alert,
  Clipboard,
  Modal,
  Pressable,
  Animated,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Text as RNText
} from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system/legacy'
import * as MediaLibrary from 'expo-media-library'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { MessageStatus, MessageType, type MessageResponse, type ConversationMemberResponse } from '../schemas'
import { useAuthStore } from '@/store'
import { useToggleReaction, useRemoveAllMyReactions } from '../queries/use-mutations'
import { useJoinGroupByLink, useJoinPreview } from '../queries'
import { messageApi } from '../api/message.api'
import { normalizeDateTime } from '../utils/date-utils'
import { FileBadge } from './file-badge'
import { MessageMediaContent } from './media-content'
import { MessageReactionBar, EMOJIS } from './message-reaction-bar'
import { SeenMembersModal } from './seen-members-modal'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { messageKeys } from '../queries/keys'
import { parseBusinessCardContent, parseGroupLinkContent, parseGroupLinkToken, parseMentionsForRender } from '../utils'
import { GroupLinkCard } from './group/group-link-card'
import { BusinessCardMessage } from './business-card-message'
import { CallMessage } from './call-message'
import Toast from 'react-native-toast-message'
import { BONDHUB_AI } from '@/constants/system'
import { AiMessageBubble } from './ai-message-bubble'
import { useAiStreamingStore } from '../hooks/ai-streaming-registry'
import { parseAiSuggestions, parseAiQuestion, AI_SUGGESTION_EVENT } from '../utils/ai-parser'
import { DeviceEventEmitter } from 'react-native'
import { AiSuggestionChips } from './ai-suggestion-chips'

interface MessageBubbleProps {
  message: MessageResponse
  isOwn: boolean
  isPinned?: boolean
  isLatestOwnMessage?: boolean
  showTime?: boolean
  showAvatar?: boolean
  showSenderName?: boolean
  isGroupConversation?: boolean
  members?: ConversationMemberResponse[] | null
  onAvatarPress?: (userId: string) => void
  onBusinessCardPress?: (userId: string) => void
  onBusinessCardMessagePress?: (userId: string) => void
  onReply?: (message: MessageResponse) => void
  onRevoke?: (messageId: string) => void
  onDeleteForMe?: (messageId: string) => void
  onForward?: (message: MessageResponse) => void
  onPin?: (message: MessageResponse) => void
  onOpenMessageOptions?: () => void
  onReplyMessagePress?: (messageId: string) => void
  onScrollToMessage?: (messageId: string) => void
  isHighlighted?: boolean
  activeGroupCallId?: string | null
  onJoinGroupCall?: (roomId: string, callKind: 'voice' | 'video') => void
  onRecall?: (receiverId: string) => void
  showHighlightBackground?: boolean
  highlightKeyword?: string | null
  onOpenExpirationModal?: () => void
}

export function MessageBubble({
  message,
  isOwn,
  isPinned = false,
  isLatestOwnMessage = false,
  showTime = true,
  showAvatar = true,
  showSenderName = false,
  isGroupConversation = false,
  members,
  onAvatarPress,
  onBusinessCardPress,
  onBusinessCardMessagePress,
  onReply,
  onRevoke,
  onDeleteForMe,
  onForward,
  onPin,
  onOpenMessageOptions,
  onReplyMessagePress,
  onScrollToMessage,
  isHighlighted = false,
  activeGroupCallId,
  onJoinGroupCall,
  onRecall,
  showHighlightBackground = false,
  highlightKeyword = null,
  onOpenExpirationModal
}: MessageBubbleProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'
  const [showActions, setShowActions] = useState(false)
  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser?.id || ''
  const { mutate: toggleReactionMutate } = useToggleReaction()
  const { mutate: removeReactionsMutate } = useRemoveAllMyReactions()
  const [groupLinkPreviewOpen, setGroupLinkPreviewOpen] = useState(false)
  const [activeGroupLinkToken, setActiveGroupLinkToken] = useState<string | null>(null)
  const [activeGroupLinkPayload, setActiveGroupLinkPayload] = useState<{
    groupName?: string
    groupAvatar?: string | null
  } | null>(null)
  const [joinQuestionOpen, setJoinQuestionOpen] = useState(false)
  const [joinAnswer, setJoinAnswer] = useState('')
  const [showSeenMembersModal, setShowSeenMembersModal] = useState(false)
  const queryClient = useQueryClient()
  const highlightAnim = useRef(new Animated.Value(isHighlighted ? 1 : 0)).current
  const { mutate: joinByLink, isPending: isJoiningByLink } = useJoinGroupByLink()
  const { data: joinPreview, isLoading: isJoinPreviewLoading } = useJoinPreview(
    activeGroupLinkToken || '',
    groupLinkPreviewOpen && !!activeGroupLinkToken
  )

  const aiStream = useAiStreamingStore(message.conversationId)

  useEffect(() => {
    Animated.timing(highlightAnim, {
      toValue: isHighlighted ? 1 : 0,
      duration: 500,
      useNativeDriver: false
    }).start()
  }, [isHighlighted])

  const isAiMessage = message.senderId === BONDHUB_AI.userId && message.type !== 'SYSTEM'
  const aiRawContent = isAiMessage 
    ? ((aiStream?.isStreaming && aiStream?.messageId === message.id) ? aiStream.content : message.content || '')
    : ''
  const { cleanContent, suggestions } = isAiMessage ? parseAiSuggestions(aiRawContent) : { cleanContent: message.content || '', suggestions: [] }
  const { cleanContent: finalContent, isClarification } = isAiMessage ? parseAiQuestion(cleanContent) : { cleanContent: message.content || '', isClarification: false }
  
  const displayContent = isAiMessage ? finalContent : message.content

  const removeAccents = useCallback((value: string) => {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  }, [])

  const renderHighlightedText = useCallback(
    (content: string | null | undefined, keyword: string | null | undefined, style: any) => {
      const value = content || ''
      const parts = parseMentionsForRender(value)
      
      const renderPart = (text: string, isMention: boolean, key: string) => {
        let baseStyle = style
        if (isMention) {
          baseStyle = { ...style, color: isDark ? '#36A7FF' : '#0068FF', fontWeight: '600' }
        }

        const normalizedKeyword = keyword ? removeAccents(keyword.trim()) : ''
        if (!text || !normalizedKeyword) {
          return <Text key={key} style={baseStyle}>{text}</Text>
        }

        const normalizedContent = removeAccents(text)
        const highlightedParts: React.ReactNode[] = []
        let lastIndex = 0
        let matchIndex = normalizedContent.indexOf(normalizedKeyword)

        if (matchIndex === -1) {
          return <Text key={key} style={baseStyle}>{text}</Text>
        }

        while (matchIndex !== -1) {
          if (matchIndex > lastIndex) {
            highlightedParts.push(text.substring(lastIndex, matchIndex))
          }

          const endIndex = matchIndex + normalizedKeyword.length
          highlightedParts.push(
            <Text
              key={`${matchIndex}-${endIndex}`}
              style={{
                backgroundColor: isDark ? 'rgba(234,179,8,0.55)' : '#FDE68A',
                color: isDark ? '#FFFFFF' : '#111827',
                borderRadius: 2
              }}
            >
              {text.substring(matchIndex, endIndex)}
            </Text>
          )

          lastIndex = endIndex
          matchIndex = normalizedContent.indexOf(normalizedKeyword, lastIndex)
        }

        if (lastIndex < text.length) {
          highlightedParts.push(text.substring(lastIndex))
        }

        return <Text key={key} style={baseStyle}>{highlightedParts}</Text>
      }

      return (
        <Text style={style}>
          {parts.map((p, i) => renderPart(p.text, p.isMention, String(i)))}
        </Text>
      )
    },
    [isDark, removeAccents]
  )

  const getReplyAttachmentUrl = (replyMessageId: string): string | null => {
    const conversationId = message.conversationId
    if (!conversationId) return null
    const cached = queryClient.getQueryData<InfiniteData<any>>(messageKeys.messages(conversationId))
    if (!cached) return null
    for (const page of cached.pages) {
      const found = (page.data ?? page.content ?? []).find((m: MessageResponse) => m.id === replyMessageId)
      if (found) return found.attachments?.[0]?.url ?? null
    }
    return null
  }

  const overlayOpacity = useRef(new Animated.Value(0)).current
  const sheetTranslateY = useRef(new Animated.Value(400)).current
  const emojiScale = useRef(new Animated.Value(0)).current

  const isRevoked = message.status === MessageStatus.REVOKED

  const isGroupCall = message.content?.startsWith('[GROUP_CALL]::')
  if (isGroupCall) {
    try {
      const payload = JSON.parse(message.content!.slice('[GROUP_CALL]::'.length))
      if (payload.status === 'ended') {
        return null
      }
    } catch {}
  }

  if (message.type === MessageType.CALL || isGroupCall) {
    return (
      <CallMessage
        message={message}
        isOwn={isOwn}
        activeGroupCallId={activeGroupCallId}
        onAvatarPress={onAvatarPress}
        onJoinGroupCall={onJoinGroupCall}
        onRecall={onRecall}
      />
    )
  }

  if (message.type === MessageType.SYSTEM || message.type === MessageType.JOIN || message.type === MessageType.LEAVE) {
    const meta = (message.metadata || {}) as Record<string, any>
    const resolveDisplayName = (userId?: string | null, fallbackName?: string | null) => {
      if (userId && userId === currentUserId) return t('message.you', { defaultValue: 'Bạn' })
      return fallbackName || t('message.user', { defaultValue: 'Người dùng' })
    }

    const actorName = resolveDisplayName(message.senderId, meta.actorName || message.senderName)
    const payload = (meta.payload || {}) as Record<string, any>
    const targetIds = Array.isArray(meta.targetIds) ? meta.targetIds : []
    const payloadTargetNames = Array.isArray(payload.targetNames) ? payload.targetNames : []
    const targetNamesRaw = (
      targetIds.length > 0
        ? targetIds.map((id: string, index: number) => {
            const byMember = members?.find((m) => m.userId === id)?.fullName
            const byPayload = payloadTargetNames[index]
            return resolveDisplayName(id, byMember || byPayload)
          })
        : payloadTargetNames.map((name: string) => resolveDisplayName(undefined, name))
    )
      .filter(Boolean)
      .filter((name: string) => name !== actorName)

    const formatCompactNames = (names: string[]) => {
      if (names.length <= 2) return names.join(', ')
      return `${names.slice(0, 2).join(', ')} ${t('message.system.andOthers', { count: names.length - 2, defaultValue: `và ${names.length - 2} người khác` })}`
    }

    const targetNamesCompact = formatCompactNames(targetNamesRaw)
    const transferTargetName = (() => {
      const filtered = targetNamesRaw.filter((name) => name !== actorName)
      if (filtered.length > 0) return formatCompactNames(filtered)

      const payloadTransferName =
        (typeof payload.newOwnerName === 'string' && payload.newOwnerName.trim()) ||
        (typeof payload.transferToName === 'string' && payload.transferToName.trim()) ||
        (typeof payload.targetName === 'string' && payload.targetName.trim()) ||
        ''
      if (payloadTransferName) return payloadTransferName

      const payloadTransferId =
        (typeof payload.newOwnerId === 'string' && payload.newOwnerId) ||
        (typeof payload.transferToUserId === 'string' && payload.transferToUserId) ||
        (typeof payload.targetUserId === 'string' && payload.targetUserId) ||
        ''
      if (payloadTransferId) {
        const byMember = members?.find((m) => m.userId === payloadTransferId)?.fullName
        return resolveDisplayName(payloadTransferId, byMember)
      }

      return ''
    })()

    const targetAvatars: Array<{ id: string; avatar: string | null; name: string }> = (
      Array.isArray(meta.targetIds) ? meta.targetIds : []
    )
      .map((id: string, index: number) => ({
        id,
        avatar:
          (Array.isArray(payload.targetAvatars) ? payload.targetAvatars[index] : undefined) ||
          members?.find((m) => m.userId === id)?.avatar ||
          null,
        name:
          members?.find((m) => m.userId === id)?.fullName ||
          (Array.isArray(payload.targetNames) ? payload.targetNames[index] : undefined) ||
          ''
      }))
      .filter((item) => !!item.avatar || !!String(item.name || '').trim())

    const action = String(meta.action || '').toUpperCase()
    const isActorMe = String(message.senderId || '') === String(currentUserId || '')
    const firstTargetId = String(targetIds[0] || '')
    const firstTargetName =
      (firstTargetId &&
        resolveDisplayName(firstTargetId, members?.find((m) => m.userId === firstTargetId)?.fullName)) ||
      (typeof payload.targetName === 'string' ? String(payload.targetName) : '') ||
      targetNamesRaw[0] ||
      t('message.system.unknownMember', { defaultValue: 'một thành viên' })
    const isFirstTargetMe = firstTargetId && String(firstTargetId) === String(currentUserId || '')

    let systemText = message.content || ''
    if (!systemText) {
      const setting = String(payload.setting || '')
      const settingValue = payload.value
      if (action === 'UPDATE_AVATAR') {
        systemText = `${actorName} đã thay đổi ảnh đại diện nhóm`
      } else if (action === 'UPDATE_NAME') {
        const oldName = String(payload.oldName || '').trim()
        const newName = String(payload.newName || '').trim()
        systemText =
          oldName && newName
            ? `${actorName} đã đổi tên nhóm từ ${oldName} thành ${newName}`
            : `${actorName} đã đổi tên nhóm`
      } else if (action === 'GROUP_CREATED' || action === 'CREATE_GROUP') {
        if (isActorMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã tạo nhóm`
        } else if (targetIds.map(String).includes(String(currentUserId || ''))) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã tham gia nhóm`
        } else {
          systemText = `${actorName} đã tạo nhóm`
        }
      } else if (action === 'ADD_MEMBERS' && targetNamesRaw.length) {
        if (targetIds.map(String).includes(String(currentUserId || ''))) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã tham gia nhóm`
        } else {
          systemText = `${targetNamesCompact} đã được ${actorName} thêm vào nhóm`
        }
      } else if (action === 'REMOVE_MEMBER') {
        const removeTargetName =
          firstTargetName || t('message.system.unknownMember', { defaultValue: 'một thành viên' })
        if (isFirstTargetMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã bị xóa khỏi nhóm`
        } else if (isActorMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã xóa ${removeTargetName} khỏi nhóm`
        } else {
          systemText = `${removeTargetName} đã bị ${actorName} xóa khỏi nhóm`
        }
      } else if (action === 'BLOCK_MEMBER') {
        const blockTargetName = firstTargetName || t('message.system.unknownMember', { defaultValue: 'một thành viên' })
        if (isFirstTargetMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã bị chặn khỏi nhóm`
        } else if (isActorMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã chặn ${blockTargetName} khỏi nhóm`
        } else {
          systemText = `${blockTargetName} đã bị ${actorName} chặn khỏi nhóm`
        }
      } else if (action === 'BLOCKED_FROM_JOINING') {
        systemText = `${firstTargetName} đã bị chặn tham gia nhóm`
      } else if (action === 'SELF_BLOCKED_FROM_JOINING') {
        const withLink = payload?.joinLinkEnabled === true
        systemText = withLink
          ? `${firstTargetName} đã bị chặn tham gia lại qua link mời`
          : `${firstTargetName} đã bị chặn tham gia lại nhóm`
      } else if (action === 'PROMOTE_ADMIN') {
        if (isFirstTargetMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã được bổ nhiệm làm phó nhóm`
        } else if (isActorMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã bổ nhiệm ${firstTargetName} làm phó nhóm`
        } else {
          systemText = `${firstTargetName} đã được ${actorName} bổ nhiệm thành phó nhóm`
        }
      } else if (action === 'DEMOTE_ADMIN') {
        if (isFirstTargetMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} không còn là phó nhóm`
        } else if (isActorMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã thu hồi quyền phó nhóm của ${firstTargetName}`
        } else {
          systemText = `${firstTargetName} không còn là phó nhóm`
        }
      } else if (action === 'TRANSFER_OWNER') {
        if (isFirstTargetMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã trở thành trưởng nhóm`
        } else {
          const transferTarget = transferTargetName || firstTargetName
          systemText = isActorMe
            ? `${t('message.you', { defaultValue: 'Bạn' })} đã chuyển quyền trưởng nhóm cho ${transferTarget}`
            : `${actorName} đã chuyển quyền trưởng nhóm cho ${transferTarget}`
        }
      } else if (action === 'UPDATE_SETTINGS' && setting === 'memberCanSendMessages') {
        systemText =
          settingValue === false
            ? isActorMe
              ? `${t('message.you', { defaultValue: 'Bạn' })} chỉ cho phép trưởng/phó nhóm gửi tin nhắn trong nhóm`
              : `${actorName} chỉ cho phép trưởng/phó nhóm gửi tin nhắn trong nhóm`
            : isActorMe
              ? `${t('message.you', { defaultValue: 'Bạn' })} cho phép tất cả thành viên gửi tin nhắn trong nhóm`
              : `${actorName} cho phép tất cả thành viên gửi tin nhắn trong nhóm`
      } else if (action === 'UPDATE_SETTINGS' && setting === 'membershipApprovalEnabled') {
        systemText =
          settingValue === true
            ? 'Hình thức tham gia nhóm được thay đổi thành "Cần phê duyệt".'
            : 'Hình thức tham gia nhóm được thay đổi thành "Không cần phê duyệt".'
      } else if (action === 'UPDATE_SETTINGS' && setting === 'joinByLinkEnabled') {
        systemText =
          settingValue === true ? 'Đã cho phép tham gia nhóm bằng link mời' : 'Đã tắt tham gia nhóm bằng link mời'
      } else if (action === 'JOIN_BY_LINK') {
        systemText = isActorMe
          ? `${t('message.you', { defaultValue: 'Bạn' })} đã tham gia nhóm bằng link`
          : `${actorName} đã tham gia nhóm bằng link`
      } else if (action === 'GENERATE_JOIN_LINK') {
        systemText = isActorMe ? 'Bạn đã tạo link nhóm' : `${actorName} đã tạo link nhóm`
      } else if (action === 'REFRESH_JOIN_LINK') {
        systemText = isActorMe ? 'Bạn đã làm mới link nhóm' : `${actorName} đã làm mới link nhóm`
      } else if (action === 'PIN_MESSAGE') {
        systemText = isActorMe ? 'Bạn đã ghim một tin nhắn' : `${actorName} đã ghim một tin nhắn`
      } else if (action === 'UNPIN_MESSAGE') {
        systemText = isActorMe ? 'Bạn đã bỏ ghim một tin nhắn' : `${actorName} đã bỏ ghim một tin nhắn`
      } else if (action === 'JOIN_REQUEST_CREATED') {
        systemText = isActorMe ? 'Bạn đã gửi yêu cầu tham gia nhóm' : `${actorName} đã gửi yêu cầu tham gia nhóm`
      } else if (action === 'JOIN_REQUEST_APPROVED') {
        if (targetIds.map(String).includes(String(currentUserId || ''))) {
          systemText = `${actorName} đã duyệt yêu cầu tham gia của bạn`
        } else if (isActorMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã duyệt yêu cầu tham gia của ${firstTargetName}`
        } else {
          systemText = `${actorName} đã duyệt yêu cầu tham gia của ${firstTargetName}`
        }
      } else if (action === 'JOIN_REQUEST_REJECTED') {
        systemText = 'Yêu cầu tham gia nhóm đã bị từ chối'
      } else if (action === 'ADD_MEMBERS_FAILED') {
        const failedCount = Number(payload.failedCount || targetIds.length || 0)
        systemText = `Không thể thêm ${failedCount} thành viên vào nhóm`
      } else if (action === 'DISBAND_GROUP') {
        systemText = 'Nhóm đã bị giải tán'
      } else if (action === 'LEAVE_GROUP' || message.type === MessageType.LEAVE) {
        systemText = isActorMe ? `${t('message.you', { defaultValue: 'Bạn' })} đã rời nhóm` : `${actorName} đã rời nhóm`
      } else if (message.type === MessageType.JOIN) {
        systemText = `${actorName} đã tham gia nhóm`
      } else if (action === 'UPDATE_EXPIRATION') {
        const days = Number(meta.days || payload.days || payload.expirationDays || 0)
        if (days > 0) {
          systemText = isActorMe
            ? t('message.system.update_expiration.selfEnable', { days, defaultValue: `Bạn đặt thời gian tự xóa là ${days} ngày` })
            : t('message.system.update_expiration.actorEnable', { actor: actorName, days, defaultValue: `${actorName} đặt thời gian tự xóa là ${days} ngày` })
        } else {
          systemText = isActorMe
            ? t('message.system.update_expiration.selfDisable', { defaultValue: 'Bạn ngừng Tin nhắn tự xóa' })
            : t('message.system.update_expiration.actorDisable', { actor: actorName, defaultValue: `${actorName} ngừng Tin nhắn tự xóa` })
        }
      } else {
        systemText = 'Tin nhắn hệ thống'
      }
    }

    if (action === 'TRANSFER_OWNER' && !isFirstTargetMe) {
      const transferTarget = transferTargetName || firstTargetName
      systemText = isActorMe
        ? `${t('message.you', { defaultValue: 'Bạn' })} đã chuyển quyền trưởng nhóm cho ${transferTarget}`
        : `${actorName} đã chuyển quyền trưởng nhóm cho ${transferTarget}`
    }

    if ((systemText === 'Tin nhắn hệ thống' || !systemText.trim()) && targetNamesRaw.length > 0) {
      systemText = `${targetNamesCompact} đã được ${actorName} thêm vào nhóm`
    }

    const leadingAvatarItems = targetAvatars.length
      ? targetAvatars.slice(0, 3)
      : [
          {
            id: message.senderId || 'actor',
            avatar: isActorMe ? currentUser?.avatar || null : message.senderAvatar || null,
            name: isActorMe ? currentUser?.fullName || actorName : actorName
          }
        ]

    const showPencil =
      action === 'UPDATE_AVATAR' ||
      action === 'UPDATE_NAME' ||
      action === 'UPDATE_SETTINGS' ||
      action === 'GENERATE_JOIN_LINK' ||
      action === 'REFRESH_JOIN_LINK'

    return (
      <View style={{ alignItems: 'center', marginVertical: 6, width: '100%' }}>
        {action === 'UPDATE_EXPIRATION' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8, marginTop: 4, width: '100%' }}>
            <View style={{ flex: 1, height: 1, backgroundColor: isDark ? '#4B5563' : '#9CA3AF' }} />
            <Text style={{ marginHorizontal: 8, fontSize: 11, color: isDark ? '#9CA3AF' : '#8A8F94', fontWeight: '600', textTransform: 'uppercase' }}>
              {Number(meta.days || payload.days || payload.expirationDays || 0) > 0
                ? t('message.disappearing.dividerEnabled', { defaultValue: 'TIN NHẮN TỰ XÓA' })
                : t('message.disappearing.dividerDisabled', { defaultValue: 'NGỪNG TIN NHẮN TỰ XÓA' })}
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: isDark ? '#4B5563' : '#9CA3AF' }} />
          </View>
        )}
        <View style={{ paddingHorizontal: 16, width: '100%', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 3,
              maxWidth: '90%',
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              borderWidth: 0.5,
              borderColor: '#E5EBF1'
            }}
          >
          <View style={{ flexDirection: 'row', marginRight: 6 }}>
            {leadingAvatarItems.map((item, idx) => (
              <View
                key={`${item.id}-${idx}`}
                style={{
                  marginLeft: idx === 0 ? 0 : -6,
                  borderWidth: 1.5,
                  borderColor: '#FFFFFF',
                  borderRadius: 99,
                }}
              >
                <UserAvatar source={item.avatar || undefined} name={item.name} size='xs' />
              </View>
            ))}
          </View>
          {showPencil && <Text style={{ marginRight: 4, color: '#22A06B', fontSize: 11 }}>✎</Text>}
          <RNText
            style={{
              fontSize: 9.5,
              color: '#4B5563',
              textAlign: 'left',
              fontWeight: '500',
              flexShrink: 1,
              lineHeight: 14
            }}
            numberOfLines={2}
          >
            {(() => {
              const useTargetAsPrefix =
                action === 'ADD_MEMBERS' ||
                action === 'PROMOTE_ADMIN' ||
                action === 'DEMOTE_ADMIN' ||
                action === 'REMOVE_MEMBER' ||
                action === 'BLOCK_MEMBER' ||
                systemText.startsWith(targetNamesCompact)
              const prefix = useTargetAsPrefix ? targetNamesCompact : actorName
              const normalized = systemText.startsWith(`${prefix} `) ? systemText.slice(prefix.length + 1) : systemText

              return (
                <RNText>
                  <RNText style={{ fontWeight: '700', color: '#111827' }}>
                    {`${prefix} `}
                  </RNText>
                  {normalized}
                  {action === 'UPDATE_EXPIRATION' && (
                    <RNText>
                      {'. '}
                      <RNText style={{ color: '#0068FF', fontWeight: '500' }} onPress={onOpenExpirationModal}>
                        {t('message.disappearing.changeSettings', { defaultValue: 'Thay đổi cài đặt' })}
                      </RNText>
                    </RNText>
                  )}
                </RNText>
              )
            })()}
          </RNText>
        </View>
      </View>
      </View>
    )
  }

  const bubbleBg = isRevoked
    ? isDark
      ? '#2a2a2a'
      : '#F3F4F6'
    : isOwn
      ? isDark
        ? '#004BA0'
        : '#D5E9FF'
      : isDark
        ? '#2A2F36'
        : '#FFFFFF'

  const textColor = isRevoked ? (isDark ? '#888' : '#9ca3af') : isDark ? '#E8EAED' : '#111827'

  const timeColor = isDark ? '#777' : '#9ca3af'

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      const normalized = normalizeDateTime(dateStr)
      if (!normalized) return ''
      const d = new Date(normalized)
      if (Number.isNaN(d.getTime())) return ''
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const shouldShowDeliveryStatus = isOwn && !isRevoked && (showActions || isLatestOwnMessage)

  const renderDeliveryStatus = () => {
    if (!shouldShowDeliveryStatus) return null

    const readers = members?.filter((m) => m.lastReadMessageId === message.id && m.userId !== currentUserId) || []

    if (readers.length > 0) {
      const maxAvatars = 5
      const visibleReaders = readers.slice(0, maxAvatars)
      const extraCount = readers.length - maxAvatars

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowSeenMembersModal(true)}
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          {visibleReaders.map((r, i) => (
            <View key={r.userId} style={{ marginLeft: i === 0 ? 0 : -4, zIndex: maxAvatars - i }}>
              <UserAvatar source={r.avatar} name={r.fullName || 'User'} size='xxs' />
            </View>
          ))}
          {extraCount > 0 && (
            <View
              style={{
                marginLeft: -4,
                zIndex: 0,
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: isDark ? '#374151' : '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isDark ? '#1F2937' : '#FFFFFF'
              }}
            >
              <Text style={{ fontSize: 8, fontWeight: '700', color: isDark ? '#D1D5DB' : '#4B5563' }}>
                +{extraCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )
    }

    let label = ''
    if (message.id?.startsWith('temp-')) {
      label = t('message.status.sending', { defaultValue: 'Đang gửi...' })
    } else {
      const rawStatus = String((message as any).deliveryStatus || message.status || '').toUpperCase()
      if (!rawStatus) {
        label = t('message.status.sent', { defaultValue: 'Đã gửi' })
      } else if (rawStatus.includes('READ') || rawStatus.includes('SEEN')) {
        label = t('message.status.seen', { defaultValue: 'Đã xem' })
      } else if (rawStatus.includes('RECEIVED') || rawStatus.includes('DELIVERED')) {
        label = t('message.status.received', { defaultValue: 'Đã nhận' })
      } else if (rawStatus.includes('SENDING')) {
        label = t('message.status.sending', { defaultValue: 'Đang gửi...' })
      } else {
        label = t('message.status.sent', { defaultValue: 'Đã gửi' })
      }
    }

    return <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '500' }}>{label}</Text>
  }

  const getDeliveryStatusLabel = () => {
    if (message.id?.startsWith('temp-')) {
      return t('message.status.sending', { defaultValue: 'Đang gửi...' })
    }

    const rawStatus = String((message as any).deliveryStatus || message.status || '').toUpperCase()
    if (!rawStatus) {
      return t('message.status.sent', { defaultValue: 'Đã gửi' })
    }

    if (
      rawStatus.includes('RECEIVED') ||
      rawStatus.includes('DELIVERED') ||
      rawStatus.includes('READ') ||
      rawStatus.includes('SEEN')
    ) {
      return t('message.status.received', { defaultValue: 'Đã nhận' })
    }

    if (rawStatus.includes('SENDING')) {
      return t('message.status.sending', { defaultValue: 'Đang gửi...' })
    }

    return t('message.status.sent', { defaultValue: 'Đã gửi' })
  }

  const openSheet = useCallback(() => {
    if (isRevoked) return
    setShowActions(true)
  }, [isRevoked])

  const closeSheet = useCallback(
    (afterClose?: () => void) => {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 400, duration: 200, useNativeDriver: true })
      ]).start(() => {
        setShowActions(false)
        if (typeof afterClose === 'function') {
          afterClose()
        }
      })
    },
    [overlayOpacity, sheetTranslateY]
  )

  useEffect(() => {
    if (showActions) {
      overlayOpacity.setValue(0)
      sheetTranslateY.setValue(400)
      emojiScale.setValue(0.8)
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          damping: 22,
          stiffness: 280,
          mass: 0.7,
          useNativeDriver: true
        }),
        Animated.spring(emojiScale, {
          toValue: 1,
          damping: 14,
          stiffness: 300,
          mass: 0.5,
          useNativeDriver: true
        })
      ]).start()
    }
  }, [showActions])

  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'reply':
          closeSheet(() => onReply?.(message))
          break
        case 'forward':
          closeSheet(() => onForward?.(message))
          break
        case 'revoke':
          closeSheet(() => {
            Alert.alert(
              t('message.actions.revoke', { defaultValue: 'Thu hồi' }),
              t('message.actions.revokeConfirm', { defaultValue: 'Thu hồi tin nhắn này?' }),
              [
                { text: t('message.actions.cancel', { defaultValue: 'Hủy' }), style: 'cancel' },
                { text: 'OK', onPress: () => onRevoke?.(message.id), style: 'destructive' }
              ]
            )
          })
          break
        case 'delete':
          closeSheet(() => {
            Alert.alert(
              t('message.actions.delete', { defaultValue: 'Xóa ở phía tôi' }),
              t('message.actions.deleteConfirm', { defaultValue: 'Xóa tin nhắn phía bạn?' }),
              [
                { text: t('message.actions.cancel', { defaultValue: 'Hủy' }), style: 'cancel' },
                { text: 'OK', onPress: () => onDeleteForMe?.(message.id), style: 'destructive' }
              ]
            )
          })
          break
        case 'copy':
          closeSheet(() => {
            if (message.content) Clipboard.setString(message.content)
          })
          break
        case 'info':
          if (onOpenMessageOptions) {
            closeSheet(() => onOpenMessageOptions())
            break
          }
          closeSheet(() => {
            Alert.alert(
              t('message.actions.comingSoonTitle', { defaultValue: 'Thông báo' }),
              t('message.actions.comingSoon', { defaultValue: 'Chức năng đang được phát triển.' })
            )
          })
          break
        case 'pin':
          closeSheet(() => onPin?.(message))
          break
        case 'download':
          closeSheet(() => handleDownload())
          break
        case 'reminder':
        case 'select':
        case 'quickMessage':
        case 'translate':
        case 'readText':
        case 'save':
          closeSheet(() => {
            Alert.alert(
              t('message.actions.comingSoonTitle', { defaultValue: 'Thông báo' }),
              t('message.actions.comingSoon', { defaultValue: 'Chức năng đang được phát triển.' })
            )
          })
          break
      }
    },
    [closeSheet, message, onReply, onForward, onRevoke, onDeleteForMe, onPin, onOpenMessageOptions, t]
  )

  const handleDownload = async () => {
    if (!message.attachments?.length) return

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert(
          t('common.error'),
          t('message.actions.downloadPermissionDenied', { defaultValue: 'Cần quyền truy cập thư viện để tải xuống.' })
        )
        return
      }

      Toast.show({
        type: 'info',
        text1: t('message.actions.downloading', { defaultValue: 'Đang tải xuống...' }),
        position: 'bottom'
      })

      const attachment = message.attachments[0]
      const fileUri = attachment.url
      if (!fileUri) return

      const fileName =
        attachment.originalFileName || attachment.fileName || (message.type === 'IMAGE' ? 'image.jpg' : 'video.mp4')
      const localUri = FileSystem.documentDirectory + fileName

      const result = await FileSystem.downloadAsync(fileUri, localUri)
      if (result.status === 200) {
        await MediaLibrary.saveToLibraryAsync(result.uri)
        Toast.show({
          type: 'success',
          text1: t('message.actions.downloadSuccess', { defaultValue: 'Đã lưu vào thư viện.' }),
          position: 'bottom'
        })
      }
    } catch (error) {
      console.error('Download error:', error)
      Toast.show({
        type: 'error',
        text1: t('message.actions.downloadFailed', { defaultValue: 'Tải xuống thất bại.' }),
        position: 'bottom'
      })
    }
  }

  const handleEmojiReaction = useCallback(
    (emoji: string) => {
      if (!message.id || message.id.startsWith('temp-')) return
      closeSheet(() => {
        toggleReactionMutate({
          messageId: message.id,
          emoji,
          conversationId: message.conversationId || '',
          userId: currentUserId
        })
      })
    },
    [message, currentUserId, closeSheet, toggleReactionMutate]
  )

  const handleRemoveReaction = useCallback(() => {
    if (!message.id || message.id.startsWith('temp-')) return
    removeReactionsMutate({
      messageId: message.id,
      conversationId: message.conversationId || '',
      userId: currentUserId
    })
  }, [message, currentUserId, removeReactionsMutate])

  const openGroupLinkPreview = (rawContent?: string | null) => {
    const token = parseGroupLinkToken(rawContent)
    const payload = parseGroupLinkContent(rawContent)
    if (!token) {
      Alert.alert(
        t('message.groupLink.invalidTitle', { defaultValue: 'Link nhóm không hợp lệ' }),
        t('message.groupLink.invalidBody', { defaultValue: 'Không thể mở thông tin nhóm từ link này.' })
      )
      return
    }
    setActiveGroupLinkPayload(payload || null)
    setActiveGroupLinkToken(token)
    setGroupLinkPreviewOpen(true)
  }

  const closeGroupLinkPreview = () => {
    setGroupLinkPreviewOpen(false)
    setJoinQuestionOpen(false)
    setJoinAnswer('')
    setTimeout(() => {
      setActiveGroupLinkToken(null)
      setActiveGroupLinkPayload(null)
    }, 120)
  }

  const extractJoinedConversationId = (response: any): string | null => {
    return response?.id || response?.data?.id || response?.data?.data?.id || null
  }

  const submitJoinByLink = (answer?: string) => {
    if (!activeGroupLinkToken || !joinPreview) return
    joinByLink(
      { token: activeGroupLinkToken, joinAnswer: answer?.trim() || undefined },
      {
        onSuccess: (response: any) => {
          const joinedConversationId = extractJoinedConversationId(response)

          if (joinedConversationId) {
            closeGroupLinkPreview()
            router.push({ pathname: '/chat/[id]' as any, params: { id: joinedConversationId } })
            return
          }

          closeGroupLinkPreview()
          if (joinPreview?.conversationId) {
            queryClient.invalidateQueries({ queryKey: messageKeys.joinRequests(joinPreview.conversationId) })
            queryClient.invalidateQueries({ queryKey: messageKeys.messages(joinPreview.conversationId) })
          }
          Alert.alert(
            t('message.groupLink.requestSentTitle', { defaultValue: 'Đã gửi yêu cầu' }),
            t('message.groupLink.requestSentBody', { defaultValue: 'Yêu cầu tham gia của bạn đang chờ duyệt.' })
          )
        },
        onError: () => {
          Alert.alert(
            t('message.groupLink.joinFailedTitle', { defaultValue: 'Không thể vào nhóm' }),
            t('message.groupLink.joinFailedBody', { defaultValue: 'Vui lòng thử lại sau.' })
          )
        }
      }
    )
  }

  const getFreshJoinPreview = async () => {
    if (!activeGroupLinkToken) return null
    try {
      return await queryClient.fetchQuery({
        queryKey: messageKeys.joinPreview(activeGroupLinkToken),
        queryFn: async () => {
          const response = await messageApi.getJoinPreview(activeGroupLinkToken)
          return response.data.data
        }
      })
    } catch {
      return null
    }
  }

  const handleGroupLinkPrimaryAction = async () => {
    if (!activeGroupLinkToken || !joinPreview) return

    const freshPreview = (await getFreshJoinPreview()) || joinPreview
    if (!freshPreview) return

    const effectivePendingRequest = !!freshPreview.membershipApprovalEnabled && !!freshPreview.hasPendingRequest

    if (freshPreview.isAlreadyMember && freshPreview.conversationId) {
      closeGroupLinkPreview()
      router.push({ pathname: '/chat/[id]' as any, params: { id: freshPreview.conversationId } })
      return
    }

    if (effectivePendingRequest) {
      Alert.alert(
        t('message.groupLink.requestSentTitle', { defaultValue: 'Đã gửi yêu cầu' }),
        t('message.groupLink.requestSentBody', { defaultValue: 'Yêu cầu tham gia của bạn đang chờ duyệt.' })
      )
      return
    }

    if (freshPreview.membershipApprovalEnabled && freshPreview.joinQuestion) {
      setJoinQuestionOpen(true)
      return
    }

    submitJoinByLink()
  }

  const renderBubbleContent = () => {
    if (isRevoked) {
      return <Text style={{ fontSize: 14, color: textColor, fontStyle: 'italic' }}>{t('message.messageRevoked')}</Text>
    }

    if ((message.type === MessageType.IMAGE || message.type === MessageType.VIDEO) && message.attachments?.length) {
      const MEDIA_PLACEHOLDERS = ['[Hình ảnh]', '[Image]', '[Video]', '[IMAGE]', '[VIDEO]']
      const caption = message.content && !MEDIA_PLACEHOLDERS.includes(message.content) ? message.content : null
      const isSending = message.id?.startsWith('temp-')

      const mediaContent = (
        <View>
          <MessageMediaContent attachments={message.attachments} onLongPress={openSheet} />
          {isSending && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ActivityIndicator size='small' color='#fff' />
            </View>
          )}
        </View>
      )

      if (caption) {
        return (
          <View>
            {mediaContent}
            {renderHighlightedText(caption, highlightKeyword, {
              fontSize: 15,
              color: textColor,
              lineHeight: 21,
              paddingHorizontal: 12,
              paddingVertical: 10
            })}
          </View>
        )
      }
      return mediaContent
    }

    const businessCard = parseBusinessCardContent(message.content)
    if (businessCard) {
      return (
        <BusinessCardMessage
          payload={businessCard}
          onCardPress={(userId) => onBusinessCardPress?.(userId)}
          onMessagePress={(userId) => onBusinessCardMessagePress?.(userId)}
          onLongPress={openSheet}
        />
      )
    }

    const groupLink = parseGroupLinkContent(message.content)
    if (groupLink) {
      return (
        <GroupLinkCard
          groupName={groupLink.groupName || ''}
          groupAvatar={groupLink.groupAvatar}
          linkUrl={groupLink.url}
          onPress={() => openGroupLinkPreview(message.content)}
          onLongPress={openSheet}
        />
      )
    }

    if (message.type === MessageType.FILE && message.attachments?.length) {
      const attachmentNames = message.attachments.map((att) => att.originalFileName || att.fileName).filter(Boolean)
      const shouldRenderContent =
        !!message.content &&
        message.content !== '[Tệp tin]' &&
        message.content !== '[File]' &&
        !attachmentNames.includes(message.content)

      const isSending = message.id?.startsWith('temp-')

      return (
        <View style={{ gap: 4 }}>
          {message.attachments.map((att, i) => (
            <View key={i}>
              <FileBadge attachment={att} isDark={isDark} highlightKeyword={highlightKeyword} />
              {isSending && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.4)',
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ActivityIndicator size='small' color='#0068FF' />
                </View>
              )}
            </View>
          ))}
          {shouldRenderContent &&
            renderHighlightedText(message.content, highlightKeyword, {
              fontSize: 15,
              color: textColor,
              lineHeight: 21
            })}
        </View>
      )
    }

    return renderHighlightedText(displayContent || message.content, highlightKeyword, { fontSize: 15, color: textColor, lineHeight: 21 })
  }

  const reactions = message.reactions || {}
  const reactionEntries = Object.entries(reactions).filter(([, users]) => (users as string[]).length > 0)
  const myReaction = Object.entries(reactions).find(([, users]) => (users as string[]).includes(currentUserId))?.[0]
  const MEDIA_PLACEHOLDERS = ['[Hình ảnh]', '[Image]', '[Video]', '[IMAGE]', '[VIDEO]']

  const hasMediaContent =
    !isRevoked &&
    (message.type === MessageType.IMAGE || message.type === MessageType.VIDEO) &&
    !!message.attachments?.length

  const isBusinessCardMessage = !isRevoked && !!parseBusinessCardContent(message.content)

  const hasRealCaption = hasMediaContent && !!message.content && !MEDIA_PLACEHOLDERS.includes(message.content)

  const mediaBubbleBg = hasRealCaption ? bubbleBg : 'transparent'

  const showEmptyReactionBtn =
    hasMediaContent ||
    isBusinessCardMessage ||
    message.type === MessageType.FILE ||
    !!parseGroupLinkContent(message.content)
  const hasReactions = Object.keys(reactions).length > 0
  const needReactionSpace = showEmptyReactionBtn || hasReactions

  const actionRows = buildActionRows(message, isOwn, isDark, isPinned, t)
  const deliveryStatusNode = renderDeliveryStatus()
  const incomingLeftSlotWidth = 36
  const isExpiring = !!(message as any).expiredAt

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        paddingHorizontal: isOwn ? 12 : 4,
        paddingVertical: isHighlighted ? 6 : 0,
        marginBottom: isHighlighted ? 0 : 4,
        marginHorizontal: 4,
        alignItems: 'flex-start',
        borderRadius: 4,
        backgroundColor: showHighlightBackground
          ? isDark
            ? 'rgba(0,104,255,0.22)'
            : 'rgba(0,104,255,0.12)'
          : 'transparent'
      }}
    >
      {!isOwn && (
        <View
          style={{
            width: incomingLeftSlotWidth,
            alignItems: 'flex-start',
            justifyContent: 'flex-start'
          }}
        >
          {showAvatar && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => message.senderId && onAvatarPress?.(message.senderId)}
              style={{ marginRight: 4 }}
            >
              <UserAvatar
                source={message.senderAvatar}
                name={message.senderName || ''}
                size='sm'
                role={
                  isGroupConversation
                    ? (members?.find((m) => m.userId === message.senderId)?.role as
                        | 'OWNER'
                        | 'ADMIN'
                        | 'MEMBER'
                        | undefined)
                    : undefined
                }
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ maxWidth: '80%' }}>
        {showSenderName && message.senderName && !isOwn && (
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2, marginLeft: 4 }}>
            {message.senderName}
          </Text>
        )}

        <View
          style={{
            alignSelf: isOwn ? 'flex-end' : 'flex-start',
            minWidth: isOwn ? '55%' : undefined,
            paddingBottom: needReactionSpace ? 14 : 0
          }}
        >
          <Animated.View
            style={{
              borderRadius: 16,
              backgroundColor: highlightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['transparent', isDark ? 'rgba(54, 167, 255, 0.25)' : 'rgba(0, 104, 255, 0.15)']
              }),
              padding: highlightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 4]
              }),
              borderWidth: highlightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1.5]
              }),
              borderColor: isDark ? '#36A7FF' : '#0068FF',
              transform: [
                {
                  scale: highlightAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.02]
                  })
                }
              ]
            }}
          >
            <TouchableOpacity activeOpacity={0.8} onLongPress={openSheet} delayLongPress={300}>
              <View
                style={{
                  backgroundColor: isBusinessCardMessage ? 'transparent' : (hasMediaContent ? mediaBubbleBg : bubbleBg),
                  borderRadius: isBusinessCardMessage ? 0 : 16,
                  borderTopRightRadius: isBusinessCardMessage ? 0 : isOwn ? 4 : 16,
                  borderTopLeftRadius: isBusinessCardMessage ? 0 : isOwn ? 16 : 4,
                  paddingHorizontal: isBusinessCardMessage
                    ? 0
                    : hasMediaContent && !hasRealCaption
                      ? 0
                      : hasMediaContent
                        ? 0
                        : 12,
                  paddingVertical: isBusinessCardMessage ? 0 : hasMediaContent ? 0 : 10,
                  borderWidth: isBusinessCardMessage
                    ? 0
                    : (isExpiring && !hasMediaContent)
                      ? 1.5
                      : (!isOwn && !isDark && !isRevoked && !(hasMediaContent && !hasRealCaption)
                        ? 0.5
                        : 0),
                  borderStyle: (isExpiring && !hasMediaContent) ? 'dashed' : 'solid',
                  borderColor: (isExpiring && !hasMediaContent) ? (isOwn ? (isDark ? '#36A7FF' : '#99C8FF') : (isDark ? '#4B5563' : '#D1D5DB')) : '#E5E7EB',
                  overflow: hasMediaContent ? 'hidden' : 'visible'
                }}
              >
                {message.replyTo && !isRevoked && (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => onScrollToMessage?.(message.replyTo!.messageId)}
                  >
                    <View
                      style={{
                        borderLeftWidth: 3,
                        borderLeftColor: '#0068FF',
                        backgroundColor: isOwn
                          ? isDark
                            ? 'rgba(0,0,0,0.15)'
                            : 'rgba(0,80,200,0.1)'
                          : isDark
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(0,0,0,0.04)',
                        borderRadius: 6,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        marginBottom: 6,
                        marginHorizontal: hasMediaContent ? 6 : 0,
                        marginTop: hasMediaContent ? 4 : 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      {message.replyTo.type === 'IMAGE' || message.replyTo.type === 'VIDEO'
                        ? (() => {
                            const replyImgUrl = getReplyAttachmentUrl(message.replyTo.messageId)
                            return replyImgUrl ? (
                              <View
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 5,
                                  overflow: 'hidden',
                                  backgroundColor: '#111',
                                  flexShrink: 0,
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <ExpoImage
                                  source={{ uri: replyImgUrl }}
                                  style={{ width: '100%', height: '100%' }}
                                  contentFit='cover'
                                  cachePolicy='memory-disk'
                                />
                                {message.replyTo.type === 'VIDEO' && (
                                  <View
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                  >
                                    <Ionicons name='play-circle' size={20} color='rgba(255,255,255,0.9)' />
                                  </View>
                                )}
                              </View>
                            ) : null
                          })()
                        : null}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#0068FF' }} numberOfLines={1}>
                          {message.replyTo.senderName || 'User'}
                        </Text>
                        <Text style={{ fontSize: 13, color: isDark ? '#aaa' : '#666' }} numberOfLines={2}>
                          {message.replyTo.type === 'IMAGE'
                            ? '📷 Hình ảnh'
                            : message.replyTo.type === 'VIDEO'
                              ? '🎬 Video'
                              : message.replyTo.content}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                {renderBubbleContent()}
              </View>
            </TouchableOpacity>
          </Animated.View>

          <MessageReactionBar
            messageId={message.id}
            conversationId={message.conversationId || ''}
            isOwn={isOwn}
            isDark={isDark}
            isRevoked={isRevoked}
            reactions={reactions}
            members={members}
            currentUserId={currentUserId}
            currentUserName={currentUser?.fullName}
            currentUserAvatar={currentUser?.avatar ?? undefined}
            showEmptyButton={showEmptyReactionBtn}
          />
        </View>

        {(showTime || !!deliveryStatusNode || isPinned) && (
          <View
            style={{
              flexDirection: 'row',
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              marginTop: 2,
              marginHorizontal: 4,
              gap: 6,
              alignItems: 'center'
            }}
          >
            {showTime && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                {!!(message as any).expiredAt && (() => {
                  const diff = new Date((message as any).expiredAt).getTime() - Date.now()
                  let remainingText = ''
                  if (diff > 0) {
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
                    const minutes = Math.floor((diff / 1000 / 60) % 60)
                    if (days > 0) remainingText = t('messages.disappearing.deleteIn.days', { days, hours })
                    else if (hours > 0) remainingText = t('messages.disappearing.deleteIn.hours', { hours, minutes })
                    else remainingText = t('messages.disappearing.deleteIn.minutes', { minutes: Math.max(minutes, 1) })
                  } else {
                    remainingText = t('messages.disappearing.deleteIn.soon')
                  }
                  return (
                    <TouchableOpacity activeOpacity={0.7} onPress={() => Toast.show({ type: 'info', text1: remainingText, position: 'bottom' })}>
                      <View style={{ position: 'relative' }}>
                        <Ionicons name='time-outline' size={12} color={timeColor} style={{ opacity: 0.8 }} />
                      </View>
                    </TouchableOpacity>
                  )
                })()}
                <Text style={{ fontSize: 10.5, color: timeColor }}>{formatTime(message.createdAt)}</Text>
              </View>
            )}
            {!!deliveryStatusNode && deliveryStatusNode}
          </View>
        )}
      </View>

      {/* Zalo-style action modal */}
      <Modal
        visible={showActions}
        transparent
        statusBarTranslucent
        animationType='none'
        onRequestClose={() => closeSheet()}
      >
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            opacity: overlayOpacity
          }}
        />

        <Pressable style={{ flex: 1 }} onPress={() => closeSheet()}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            {/* Selected message preview */}
            {!hasMediaContent && (
              <View
                style={{
                  alignSelf: isOwn ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  marginHorizontal: 16,
                  marginBottom: 8
                }}
              >
                <View
                  style={{
                    backgroundColor: isOwn ? (isDark ? '#004BA0' : '#D5E9FF') : isDark ? '#2A2F36' : '#FFFFFF',
                    borderRadius: 16,
                    borderTopRightRadius: isOwn ? 4 : 16,
                    borderTopLeftRadius: isOwn ? 16 : 4,
                    overflow: 'hidden',
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4
                  }}
                >
                  <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 15, color: isDark ? '#E8EAED' : '#111827', lineHeight: 21 }}>
                      {message.content}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
                    marginTop: 2,
                    marginHorizontal: 4,
                    gap: 6
                  }}
                >
                  <Text style={{ fontSize: 11, color: timeColor }}>{formatTime(message.createdAt)}</Text>
                  {!!getDeliveryStatusLabel() && (
                    <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '500' }}>
                      {getDeliveryStatusLabel()}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Emoji reaction bar */}
            <Animated.View
              style={{
                alignSelf: isOwn ? 'flex-end' : 'flex-start',
                flexDirection: 'row',
                backgroundColor: isDark ? '#1E2732' : '#FFFFFF',
                borderRadius: 28,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginBottom: 12,
                marginLeft: isOwn ? 0 : 16,
                marginRight: isOwn ? 16 : 0,
                gap: 4,
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                transform: [{ scale: emojiScale }]
              }}
            >
              {EMOJIS.map((emoji, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleEmojiReaction(emoji)}
                  activeOpacity={0.7}
                  style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
              {!!myReaction && (
                <TouchableOpacity
                  onPress={handleRemoveReaction}
                  activeOpacity={0.7}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? '#3B1C1C' : '#FEE2E2',
                    marginLeft: 4,
                    alignSelf: 'center'
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#DC2626', fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        </Pressable>

        {/* Bottom sheet with full action grid */}
        <Animated.View
          style={{
            backgroundColor: isDark ? '#1E2732' : '#FFFFFF',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: 36,
            transform: [{ translateY: sheetTranslateY }]
          }}
        >
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: isDark ? '#444' : '#D1D5DB' }} />
          </View>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {actionRows.map((row, rowIdx) => (
              <View key={rowIdx} style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4 }}>
                {row.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.6}
                    onPress={() => handleAction(item.key)}
                    style={{ width: '25%', alignItems: 'center', paddingTop: 14, paddingBottom: 10 }}
                  >
                    <View
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: item.bgColor || (isDark ? '#2A3340' : '#F0F2F5'),
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 6
                      }}
                    >
                      <Ionicons name={item.icon as any} size={23} color={item.iconColor} />
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: item.textColor || (isDark ? '#B0B8C1' : '#4A4A4A'),
                        textAlign: 'center',
                        lineHeight: 16
                      }}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </Modal>

      <Modal
        visible={groupLinkPreviewOpen}
        transparent
        animationType='fade'
        statusBarTranslucent
        onRequestClose={closeGroupLinkPreview}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: 20 }}
          onPress={closeGroupLinkPreview}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              borderRadius: 16,
              backgroundColor: isDark ? '#1D2430' : '#FFFFFF',
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 14,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5EAF1'
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDark ? '#233044' : '#EEF4FF',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 12
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: '#DDE7F7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {activeGroupLinkPayload?.groupAvatar || joinPreview?.groupAvatar ? (
                  <ExpoImage
                    source={{ uri: activeGroupLinkPayload?.groupAvatar || joinPreview?.groupAvatar || '' }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit='cover'
                  />
                ) : (
                  <Ionicons name='people' size={24} color='#6B7A90' />
                )}
              </View>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 12, color: isDark ? '#BBD1F5' : '#295EA6', fontWeight: '600' }}>
                  {t('message.groupLink.groupLabel', { defaultValue: 'Nhóm' })}
                </Text>
                <Text
                  style={{ marginTop: 1, fontSize: 17, fontWeight: '700', color: isDark ? '#EAF1FC' : '#111827' }}
                  numberOfLines={1}
                >
                  {activeGroupLinkPayload?.groupName ||
                    joinPreview?.groupName ||
                    t('message.groupLink.defaultGroupName', { defaultValue: 'Nhóm' })}
                </Text>
              </View>
            </View>

            <Text style={{ marginTop: 6, fontSize: 13, color: isDark ? '#A9B7CC' : '#6B7280' }}>
              {joinPreview
                ? t('message.groupLink.memberCount', {
                    defaultValue: '{{count}} thành viên',
                    count: joinPreview.memberCount
                  })
                : t('message.groupLink.loadingInfo', { defaultValue: 'Đang tải thông tin nhóm...' })}
            </Text>

            {!!joinPreview?.membershipApprovalEnabled && !joinPreview?.hasPendingRequest && (
              <Text style={{ marginTop: 4, fontSize: 12, color: isDark ? '#9FB0C8' : '#7A8699' }}>
                {t('message.groupLink.approvalHint', { defaultValue: 'Nhóm này đang bật duyệt thành viên.' })}
              </Text>
            )}

            <View style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={closeGroupLinkPreview}
                style={{
                  minWidth: 90,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#2A3340' : '#ECEFF3'
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#D2DCEC' : '#4B5563' }}>
                  {t('message.groupLink.close', { defaultValue: 'Đóng' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleGroupLinkPrimaryAction}
                disabled={isJoinPreviewLoading || isJoiningByLink || !joinPreview}
                style={{
                  minWidth: 120,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1E6ED8',
                  opacity: isJoinPreviewLoading || isJoiningByLink || !joinPreview ? 0.6 : 1
                }}
              >
                {isJoinPreviewLoading || isJoiningByLink ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
                    {(() => {
                      const effectivePendingRequest =
                        !!joinPreview?.membershipApprovalEnabled && !!joinPreview?.hasPendingRequest
                      return joinPreview?.isAlreadyMember
                        ? t('message.groupLink.openGroup', { defaultValue: 'Vào nhóm' })
                        : effectivePendingRequest
                          ? t('message.groupLink.requestSent', { defaultValue: 'Đã gửi yêu cầu' })
                          : joinPreview?.membershipApprovalEnabled
                            ? t('message.groupLink.sendRequest', { defaultValue: 'Gửi yêu cầu' })
                            : t('message.groupLink.joinNow', { defaultValue: 'Vào nhóm' })
                    })()}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={joinQuestionOpen}
        transparent
        animationType='fade'
        statusBarTranslucent
        onRequestClose={() => setJoinQuestionOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: 20 }}
          onPress={() => setJoinQuestionOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              borderRadius: 16,
              backgroundColor: isDark ? '#1D2430' : '#FFFFFF',
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 14,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5EAF1'
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#EAF1FC' : '#111827' }}>
              {t('message.groupLink.sendRequest', { defaultValue: 'Gửi yêu cầu' })}
            </Text>
            <Text style={{ marginTop: 8, fontSize: 14, color: isDark ? '#C8D4E6' : '#374151' }}>
              {joinPreview?.joinQuestion ||
                t('message.groupLink.approvalHint', { defaultValue: 'Nhóm này đang bật duyệt thành viên.' })}
            </Text>

            <TextInput
              value={joinAnswer}
              onChangeText={setJoinAnswer}
              multiline
              maxLength={100}
              placeholder={t('message.groupLink.answerPlaceholder', { defaultValue: 'Nhập câu trả lời của bạn...' })}
              placeholderTextColor={isDark ? '#8FA1BD' : '#9CA3AF'}
              style={{
                marginTop: 10,
                minHeight: 92,
                textAlignVertical: 'top',
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: isDark ? '#32435B' : '#D5DDE8',
                color: isDark ? '#EAF1FC' : '#111827',
                backgroundColor: isDark ? '#172131' : '#F8FAFD'
              }}
            />

            <View style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => setJoinQuestionOpen(false)}
                style={{
                  minWidth: 90,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#2A3340' : '#ECEFF3'
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#D2DCEC' : '#4B5563' }}>
                  {t('message.groupLink.close', { defaultValue: 'Đóng' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  if (!joinAnswer.trim()) {
                    Alert.alert(
                      t('message.groupLink.joinFailedTitle', { defaultValue: 'Không thể vào nhóm' }),
                      t('message.groupLink.answerRequired', {
                        defaultValue: 'Vui lòng nhập câu trả lời để gửi yêu cầu.'
                      })
                    )
                    return
                  }
                  setJoinQuestionOpen(false)
                  submitJoinByLink(joinAnswer)
                }}
                disabled={isJoiningByLink}
                style={{
                  minWidth: 120,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1E6ED8',
                  opacity: isJoiningByLink ? 0.6 : 1
                }}
              >
                {isJoiningByLink ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
                    {t('message.groupLink.sendRequest', { defaultValue: 'Gửi yêu cầu' })}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      <SeenMembersModal
        visible={showSeenMembersModal}
        onClose={() => setShowSeenMembersModal(false)}
        members={members?.filter((m) => m.lastReadMessageId === message.id && m.userId !== currentUserId) || []}
        currentUserId={currentUserId}
      />
    </View>
  )
}

type ActionItem = {
  key: string
  icon: string
  label: string
  iconColor: string
  bgColor?: string
  textColor?: string
}

function buildActionRows(
  message: MessageResponse,
  isOwn: boolean,
  isDark: boolean,
  isPinned: boolean,
  t: (k: string, o?: any) => string
): ActionItem[][] {
  const blue = '#0068FF'
  const orange = '#FF8C00'
  const red = '#EF4444'
  const gray = isDark ? '#8899A6' : '#65676B'

  // Row 1
  const row1: ActionItem[] = [
    {
      key: 'reply',
      icon: 'arrow-undo-outline',
      label: t('message.actions.reply', { defaultValue: 'Trả lời' }),
      iconColor: blue
    },
    {
      key: 'forward',
      icon: 'arrow-redo-outline',
      label: t('message.actions.forward', { defaultValue: 'Chuyển tiếp' }),
      iconColor: blue
    },
    {
      key: 'save',
      icon: 'folder-open-outline',
      label: t('message.actions.save', { defaultValue: 'Lưu My Documents' }),
      iconColor: '#1EA7D8'
    },
    {
      key: 'revoke',
      icon: 'refresh-outline',
      label: t('message.actions.revoke', { defaultValue: 'Thu hồi' }),
      iconColor: orange
    }
  ]

  // Row 2
  const row2: ActionItem[] = [
    {
      key: 'copy',
      icon: 'copy-outline',
      label: t('message.actions.copy', { defaultValue: 'Sao chép' }),
      iconColor: blue
    },
    {
      key: 'pin',
      icon: isPinned ? 'pin' : 'pin-outline',
      label: isPinned
        ? t('message.actions.unpin', { defaultValue: 'Bỏ ghim' })
        : t('message.actions.pin', { defaultValue: 'Ghim' }),
      iconColor: orange
    },
    {
      key: 'reminder',
      icon: 'time-outline',
      label: t('message.actions.reminder', { defaultValue: 'Nhắc hẹn' }),
      iconColor: '#BE123C'
    },
    {
      key: 'select',
      icon: 'checkbox-outline',
      label: t('message.actions.selectMultiple', { defaultValue: 'Chọn nhiều' }),
      iconColor: blue
    }
  ]

  // Row 3
  const row3: ActionItem[] = [
    {
      key: 'quickMessage',
      icon: 'flash-outline',
      label: t('message.actions.quickMessage', { defaultValue: 'Tạo tin nhắn nhanh' }),
      iconColor: '#06B6D4'
    },
    {
      key: 'translate',
      icon: 'language-outline',
      label: t('message.actions.translate', { defaultValue: 'Dịch' }),
      iconColor: '#16A34A'
    },
    {
      key: 'readText',
      icon: 'volume-high-outline',
      label: t('message.actions.readText', { defaultValue: 'Đọc văn bản' }),
      iconColor: '#7C3AED'
    },
    {
      key: 'info',
      icon: 'information-circle-outline',
      label: t('message.actions.detail', { defaultValue: 'Chi tiết' }),
      iconColor: gray
    }
  ]

  // Row 4
  const row4: ActionItem[] = []

  // If it's an image or video, we add Download button before Delete
  if (message.type === MessageType.IMAGE || message.type === MessageType.VIDEO) {
    row4.push({
      key: 'download',
      icon: 'download-outline',
      label: t('message.actions.download', { defaultValue: 'Tải về' }),
      iconColor: '#10B981'
    })
  }

  row4.push({
    key: 'delete',
    icon: 'trash-outline',
    label: t('message.actions.delete', { defaultValue: 'Xóa ở phía tôi' }),
    iconColor: red,
    bgColor: isDark ? '#3B1C1C' : '#FFE4E6',
    textColor: red
  })

  const safeRow1 = isOwn ? row1 : row1.filter((item) => item.key !== 'revoke')

  return [safeRow1, row2, row3, row4]
}
