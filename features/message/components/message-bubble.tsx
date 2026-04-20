import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, TouchableOpacity, Alert, Clipboard, Modal, Pressable, Animated, ScrollView, ActivityIndicator, TextInput } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
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
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { messageKeys } from '../queries/keys'
import { parseBusinessCardContent, parseGroupLinkContent, parseGroupLinkToken } from '../utils'
import { BusinessCardMessage } from './business-card-message'

interface MessageBubbleProps {
  message: MessageResponse
  isOwn: boolean
  isPinned?: boolean
  isLatestOwnMessage?: boolean
  showTime?: boolean
  showAvatar?: boolean
  showSenderName?: boolean
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
}

export function MessageBubble({
  message,
  isOwn,
  isPinned = false,
  isLatestOwnMessage = false,
  showTime = true,
  showAvatar = true,
  showSenderName = false,
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
  isHighlighted = false
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
  const [activeGroupLinkPayload, setActiveGroupLinkPayload] = useState<{ groupName?: string; groupAvatar?: string | null } | null>(null)
  const [joinQuestionOpen, setJoinQuestionOpen] = useState(false)
  const [joinAnswer, setJoinAnswer] = useState('')
  const queryClient = useQueryClient()
  const { mutate: joinByLink, isPending: isJoiningByLink } = useJoinGroupByLink()
  const { data: joinPreview, isLoading: isJoinPreviewLoading } = useJoinPreview(
    activeGroupLinkToken || '',
    groupLinkPreviewOpen && !!activeGroupLinkToken
  )

  // Highlight animation
  const highlightAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (isHighlighted) {
      Animated.sequence([
        Animated.timing(highlightAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.delay(700),
        Animated.timing(highlightAnim, { toValue: 0, duration: 400, useNativeDriver: false })
      ]).start()
    }
  }, [isHighlighted])

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

    const targetAvatars: Array<{ id: string; avatar: string | null; name: string }> =
      (Array.isArray(meta.targetIds) ? meta.targetIds : []).map((id: string, index: number) => ({
        id,
        avatar:
          (Array.isArray(payload.targetAvatars) ? payload.targetAvatars[index] : undefined) ||
          members?.find((m) => m.userId === id)?.avatar ||
          null,
        name:
          members?.find((m) => m.userId === id)?.fullName ||
          (Array.isArray(payload.targetNames) ? payload.targetNames[index] : undefined) ||
          'User'
      }))

    const action = String(meta.action || '').toUpperCase()
    const isActorMe = String(message.senderId || '') === String(currentUserId || '')
    const firstTargetId = String(targetIds[0] || '')
    const firstTargetName =
      (firstTargetId && resolveDisplayName(firstTargetId, members?.find((m) => m.userId === firstTargetId)?.fullName)) ||
      (typeof payload.targetName === 'string' ? String(payload.targetName) : '') ||
      targetNamesRaw[0] ||
      t('message.user', { defaultValue: 'Người dùng' })
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
        systemText = oldName && newName ? `${actorName} đã đổi tên nhóm từ ${oldName} thành ${newName}` : `${actorName} đã đổi tên nhóm`
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
        if (isFirstTargetMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã bị xóa khỏi nhóm`
        } else if (isActorMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã xóa ${firstTargetName} khỏi nhóm`
        } else {
          systemText = `${firstTargetName} đã bị ${actorName} xóa khỏi nhóm`
        }
      } else if (action === 'BLOCK_MEMBER') {
        if (isFirstTargetMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã bị chặn khỏi nhóm`
        } else if (isActorMe) {
          systemText = `${t('message.you', { defaultValue: 'Bạn' })} đã chặn ${firstTargetName} khỏi nhóm`
        } else {
          systemText = `${firstTargetName} đã bị ${actorName} chặn khỏi nhóm`
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
        systemText = settingValue === false
          ? (isActorMe
              ? `${t('message.you', { defaultValue: 'Bạn' })} chỉ cho phép trưởng/phó nhóm gửi tin nhắn trong nhóm`
              : `${actorName} chỉ cho phép trưởng/phó nhóm gửi tin nhắn trong nhóm`)
          : (isActorMe
              ? `${t('message.you', { defaultValue: 'Bạn' })} cho phép tất cả thành viên gửi tin nhắn trong nhóm`
              : `${actorName} cho phép tất cả thành viên gửi tin nhắn trong nhóm`)
      } else if (action === 'UPDATE_SETTINGS' && setting === 'membershipApprovalEnabled') {
        systemText = settingValue === true
          ? 'Hình thức tham gia nhóm được thay đổi thành "Cần phê duyệt".'
          : 'Hình thức tham gia nhóm được thay đổi thành "Không cần phê duyệt".'
      } else if (action === 'UPDATE_SETTINGS' && setting === 'joinByLinkEnabled') {
        systemText = settingValue === true ? 'Đã cho phép tham gia nhóm bằng link mời' : 'Đã tắt tham gia nhóm bằng link mời'
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
        systemText = isActorMe
          ? `${t('message.you', { defaultValue: 'Bạn' })} đã rời nhóm`
          : `${actorName} đã rời nhóm`
      } else if (message.type === MessageType.JOIN) {
        systemText = `${actorName} đã tham gia nhóm`
      } else {
        systemText = 'Tin nhắn hệ thống'
      }
    }

    // Keep transfer-owner wording consistent even when backend sends generic content.
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
      : [{ id: message.senderId || 'actor', avatar: message.senderAvatar || null, name: actorName }]

    const showPencil =
      action === 'UPDATE_AVATAR' ||
      action === 'UPDATE_NAME' ||
      action === 'UPDATE_SETTINGS' ||
      action === 'GENERATE_JOIN_LINK' ||
      action === 'REFRESH_JOIN_LINK'

    return (
      <View style={{ alignItems: 'center', marginVertical: 4, paddingHorizontal: 16 }}>
        <View
          style={{
            backgroundColor: isDark ? '#2B3340' : '#F7FAFC',
            borderRadius: 999,
            paddingHorizontal: 8,
            paddingVertical: 5,
            maxWidth: '100%',
            borderWidth: isDark ? 0 : 1,
            borderColor: '#E5EBF1',
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <View style={{ flexDirection: 'row', marginRight: 5 }}>
            {leadingAvatarItems.map((item, idx) => (
              <View
                key={`${item.id}-${idx}`}
                style={{
                  marginLeft: idx === 0 ? 0 : -6,
                  borderWidth: 1,
                  borderColor: isDark ? '#2B3340' : '#FFFFFF',
                  borderRadius: 99,
                  transform: [{ scale: 0.84 }]
                }}
              >
                <UserAvatar source={item.avatar || undefined} name={item.name} size='xs' />
              </View>
            ))}
          </View>
          {showPencil && <Text style={{ marginRight: 3, color: '#22A06B', fontSize: 10 }}>✎</Text>}
          <Text
            style={{
              fontSize: 10,
              color: isDark ? '#C8D1DE' : '#6B7280',
              textAlign: 'left',
              fontWeight: '500',
              flexShrink: 1
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
              const normalized = systemText.startsWith(`${prefix} `)
                ? systemText.slice(prefix.length + 1)
                : systemText

              return (
                <>
                  <Text style={{ fontWeight: '700', fontSize: 10, color: isDark ? '#E0E8F4' : '#475569' }}>
                    {`${prefix} `}
                  </Text>
                  {normalized}
                </>
              )
            })()}
          </Text>
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

  const getDeliveryStatusLabel = () => {
    if (!shouldShowDeliveryStatus) return null

    if (message.id?.startsWith('temp-')) {
      return t('message.status.sending', { defaultValue: 'Dang gui' })
    }

    const rawStatus = String((message as any).deliveryStatus || message.status || '').toUpperCase()
    if (!rawStatus) {
      return t('message.status.sent', { defaultValue: 'Da gui' })
    }

    if (
      rawStatus.includes('RECEIVED') ||
      rawStatus.includes('DELIVERED') ||
      rawStatus.includes('READ') ||
      rawStatus.includes('SEEN')
    ) {
      return t('message.status.received', { defaultValue: 'Da nhan' })
    }

    if (rawStatus.includes('SENDING')) {
      return t('message.status.sending', { defaultValue: 'Dang gui' })
    }

    return t('message.status.sent', { defaultValue: 'Da gui' })
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
              t('message.actions.revoke', { defaultValue: 'Thu hoi' }),
              t('message.actions.revokeConfirm', { defaultValue: 'Thu hoi tin nhan nay?' }),
              [
                { text: t('message.actions.cancel', { defaultValue: 'Huy' }), style: 'cancel' },
                { text: 'OK', onPress: () => onRevoke?.(message.id), style: 'destructive' }
              ]
            )
          })
          break
        case 'delete':
          closeSheet(() => {
            Alert.alert(
              t('message.actions.delete', { defaultValue: 'Xoa o phia toi' }),
              t('message.actions.deleteConfirm', { defaultValue: 'Xoa tin nhan phia ban?' }),
              [
                { text: t('message.actions.cancel', { defaultValue: 'Huy' }), style: 'cancel' },
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
              t('message.actions.comingSoonTitle', { defaultValue: 'Thong bao' }),
              t('message.actions.comingSoon', { defaultValue: 'Chuc nang dang duoc phat trien.' })
            )
          })
          break
        case 'pin':
          closeSheet(() => onPin?.(message))
          break
        case 'reminder':
        case 'select':
        case 'quickMessage':
        case 'translate':
        case 'readText':
        case 'save':
          closeSheet(() => {
            Alert.alert(
              t('message.actions.comingSoonTitle', { defaultValue: 'Thong bao' }),
              t('message.actions.comingSoon', { defaultValue: 'Chuc nang dang duoc phat trien.' })
            )
          })
          break
      }
    },
    [closeSheet, message, onReply, onForward, onRevoke, onDeleteForMe, onPin, onOpenMessageOptions, t]
  )

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
    return (
      response?.id ||
      response?.data?.id ||
      response?.data?.data?.id ||
      null
    )
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
      return (
        <Text style={{ fontSize: 14, color: textColor, fontStyle: 'italic' }}>
          {t('message.messageRevoked')}
        </Text>
      )
    }

    if ((message.type === MessageType.IMAGE || message.type === MessageType.VIDEO) && message.attachments?.length) {
      const MEDIA_PLACEHOLDERS = ['[Hình ảnh]', '[Image]', '[Video]', '[IMAGE]', '[VIDEO]']
      const caption = message.content && !MEDIA_PLACEHOLDERS.includes(message.content) ? message.content : null
      if (caption) {
        return (
          <View>
            <MessageMediaContent attachments={message.attachments} onLongPress={openSheet} />
            <Text style={{ fontSize: 15, color: textColor, lineHeight: 21, paddingHorizontal: 12, paddingVertical: 10 }}>
              {caption}
            </Text>
          </View>
        )
      }
      return <MessageMediaContent attachments={message.attachments} onLongPress={openSheet} />
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
      const name = groupLink.groupName || t('message.groupLink.defaultGroupName', { defaultValue: 'Nhóm' })
      return (
        <TouchableOpacity activeOpacity={0.9} onPress={() => openGroupLinkPreview(message.content)} onLongPress={openSheet}>
        <View style={{ minWidth: 236, maxWidth: 276 }}>
          <Text style={{ fontSize: 14, color: textColor, marginBottom: 8, lineHeight: 18 }}>
            {t('message.groupLink.openToJoin', { defaultValue: 'Truy cập link để tham gia nhóm' })}
          </Text>

          <View
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: isDark ? '#1D4FA7' : '#1E63D0',
              borderWidth: 1,
              borderColor: isDark ? '#2D69C8' : '#2D76E5'
            }}
          >
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                minHeight: 92
              }}
            >
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: '#E8ECF2',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {groupLink.groupAvatar ? (
                  <ExpoImage source={{ uri: groupLink.groupAvatar }} style={{ width: '100%', height: '100%' }} contentFit='cover' />
                ) : (
                  <Ionicons name='people' size={22} color='#9AA2AE' />
                )}
              </View>

              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ fontSize: 13, color: '#CFE0FF', marginBottom: 2 }}>
                  {t('message.groupLink.groupLabel', { defaultValue: 'Nhóm' })}
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }} numberOfLines={1}>
                  {name}
                </Text>
              </View>
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.22)', backgroundColor: 'rgba(0,0,0,0.08)' }}>
              <Text style={{ textAlign: 'center', paddingVertical: 9, color: '#D6E6FF', fontSize: 13, fontWeight: '700' }}>
                {t('message.groupLink.viewInfo', { defaultValue: 'Xem thông tin' })}
              </Text>
            </View>
          </View>
        </View>
        </TouchableOpacity>
      )
    }

    if (message.type === MessageType.FILE && message.attachments?.length) {
      const attachmentNames = message.attachments.map((att) => att.originalFileName || att.fileName).filter(Boolean)
      const shouldRenderContent =
        !!message.content &&
        message.content !== '[Tệp tin]' &&
        message.content !== '[File]' &&
        !attachmentNames.includes(message.content)

      return (
        <View style={{ gap: 4 }}>
          {message.attachments.map((att, i) => (
            <FileBadge key={i} attachment={att} isDark={isDark} />
          ))}
          {shouldRenderContent && (
              <Text style={{ fontSize: 15, color: textColor, lineHeight: 21 }}>
                {message.content}
              </Text>
            )}
        </View>
      )
    }

    return (
      <Text style={{ fontSize: 15, color: textColor, lineHeight: 21 }}>
        {message.content}
      </Text>
    )
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

  const hasRealCaption =
    hasMediaContent &&
    !!message.content &&
    !MEDIA_PLACEHOLDERS.includes(message.content)

  const mediaBubbleBg = hasRealCaption ? bubbleBg : 'transparent'

  const actionRows = buildActionRows(isOwn, isDark, isPinned, t)
  const deliveryStatusLabel = getDeliveryStatusLabel()
  const incomingLeftSlotWidth = 44

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        paddingHorizontal: 12,
        marginBottom: 4,
        alignItems: 'flex-start'
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
              style={{ marginRight: 8 }}
            >
              <UserAvatar source={message.senderAvatar} name={message.senderName || ''} size='sm' />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ maxWidth: '70%' }}>
        {showSenderName && message.senderName && !isOwn && (
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2, marginLeft: 4 }}>
            {message.senderName}
          </Text>
        )}

          <View style={{ alignSelf: isOwn ? 'flex-end' : 'flex-start', minWidth: '55%', paddingBottom: 14 }}>
            <Animated.View style={{
              borderRadius: 16,
              backgroundColor: highlightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['transparent', 'rgba(0,104,255,0.18)']
              })
            }}>
            <TouchableOpacity activeOpacity={0.8} onLongPress={openSheet} delayLongPress={300}>
              <View
                style={{
                  backgroundColor: isBusinessCardMessage
                    ? 'transparent'
                    : hasMediaContent
                      ? mediaBubbleBg
                      : bubbleBg,
                  borderRadius: isBusinessCardMessage ? 0 : 16,
                  borderTopRightRadius: isBusinessCardMessage ? 0 : isOwn ? 4 : 16,
                  borderTopLeftRadius: isBusinessCardMessage ? 0 : isOwn ? 16 : 4,
                  paddingHorizontal: isBusinessCardMessage
                    ? 0
                    : (hasMediaContent && !hasRealCaption)
                      ? 0
                      : hasMediaContent
                        ? 0
                        : 12,
                  paddingVertical: isBusinessCardMessage ? 0 : hasMediaContent ? 0 : 10,
                  borderWidth: isBusinessCardMessage
                    ? 0
                    : (!isOwn && !isDark && !isRevoked && !(hasMediaContent && !hasRealCaption))
                      ? 0.5
                      : 0,
                  borderColor: '#E5E7EB',
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
                    {(message.replyTo.type === 'IMAGE' || message.replyTo.type === 'VIDEO') ? (() => {
                      const replyImgUrl = getReplyAttachmentUrl(message.replyTo.messageId)
                      return replyImgUrl ? (
                        <View style={{ width: 40, height: 40, borderRadius: 5, overflow: 'hidden', backgroundColor: '#111', flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
                          <ExpoImage
                            source={{ uri: replyImgUrl }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit='cover'
                            cachePolicy='memory-disk'
                          />
                          {message.replyTo.type === 'VIDEO' && (
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                              <Ionicons name='play-circle' size={20} color='rgba(255,255,255,0.9)' />
                            </View>
                          )}
                        </View>
                      ) : null
                    })() : null}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#0068FF' }} numberOfLines={1}>
                        {message.replyTo.senderName || 'User'}
                      </Text>
                      <Text style={{ fontSize: 13, color: isDark ? '#aaa' : '#666' }} numberOfLines={2}>
                        {message.replyTo.type === 'IMAGE' ? '📷 Hình ảnh' : message.replyTo.type === 'VIDEO' ? '🎬 Video' : message.replyTo.content}
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
            />
          </View>

        {(showTime || !!deliveryStatusLabel) && (
          <View
            style={{
              flexDirection: 'row',
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              marginTop: 2,
              marginHorizontal: 4,
              gap: 6
            }}
          >
            {showTime && <Text style={{ fontSize: 11, color: timeColor }}>{formatTime(message.createdAt)}</Text>}
            {!!deliveryStatusLabel && (
              <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '500' }}>{deliveryStatusLabel}</Text>
            )}
          </View>
        )}

      </View>

      {/* Zalo-style action modal */}
      <Modal visible={showActions} transparent statusBarTranslucent animationType='none' onRequestClose={() => closeSheet()}>
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
                alignSelf: 'flex-end',
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
              <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginTop: 2, marginHorizontal: 4, gap: 6 }}>
                <Text style={{ fontSize: 11, color: timeColor }}>{formatTime(message.createdAt)}</Text>
                {!!getDeliveryStatusLabel() && (
                  <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '500' }}>{getDeliveryStatusLabel()}</Text>
                )}
              </View>
            </View>
            )}

            {/* Emoji reaction bar */}
            <Animated.View
              style={{
                alignSelf: 'flex-end',
                flexDirection: 'row',
                backgroundColor: isDark ? '#1E2732' : '#FFFFFF',
                borderRadius: 28,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginBottom: 12,
                marginRight: 16,
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
              <View key={rowIdx} style={{ flexDirection: 'row', paddingHorizontal: 4 }}>
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
                  {activeGroupLinkPayload?.groupName || joinPreview?.groupName || t('message.groupLink.defaultGroupName', { defaultValue: 'Nhóm' })}
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
                      const effectivePendingRequest = !!joinPreview?.membershipApprovalEnabled && !!joinPreview?.hasPendingRequest
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
              {joinPreview?.joinQuestion || t('message.groupLink.approvalHint', { defaultValue: 'Nhóm này đang bật duyệt thành viên.' })}
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
                      t('message.groupLink.answerRequired', { defaultValue: 'Vui lòng nhập câu trả lời để gửi yêu cầu.' })
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

function buildActionRows(isOwn: boolean, isDark: boolean, isPinned: boolean, t: (k: string, o?: any) => string): ActionItem[][] {
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
  const row4: ActionItem[] = [
    {
      key: 'delete',
      icon: 'trash-outline',
      label: t('message.actions.delete', { defaultValue: 'Xóa ở phía tôi' }),
      iconColor: red,
      bgColor: isDark ? '#3B1C1C' : '#FFE4E6',
      textColor: red
    }
  ]

  const safeRow1 = isOwn ? row1 : row1.filter((item) => item.key !== 'revoke')

  return [safeRow1, row2, row3, row4]
}
