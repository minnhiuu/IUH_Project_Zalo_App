import React, { useRef } from 'react'
import { View, TouchableOpacity, LayoutRectangle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image as ExpoImage } from 'expo-image'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { useTranslation } from 'react-i18next'
import type { ConversationResponse } from '../schemas'
import { MessageStatus } from '../schemas'
import { formatPreview } from '../utils/chat-preview'
import { parseMessageDate } from '../utils/date-utils'
import { getSystemMessageText } from '../utils/system-message'
import { stripAiControlTags } from '../utils/ai-parser'
import { useAuthStore } from '@/store'

import * as Haptics from 'expo-haptics'

interface ConversationListItemProps {
  conversation: ConversationResponse
  onPress: () => void
  onLongPress?: (layout: LayoutRectangle) => void
}

function AvatarCell({
  uri,
  label,
  size,
}: {
  uri?: string | null
  label: string
  size: number
}) {
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'

  // Generate background color from name
  const bgColors = ['#3B82F6', '#EF4444', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6']
  const colorIndex = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const bgColor = bgColors[colorIndex % bgColors.length]

  const initials = (() => {
    const parts = label.trim().split(/\s+/)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  })()

  const isValidUri = typeof uri === 'string' && uri.trim().length > 0

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: isDark ? '#1F2937' : '#FFFFFF',
      }}
    >
      {isValidUri ? (
        <ExpoImage
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            backgroundColor: bgColor,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: size * 0.38, fontWeight: '600' }}>
            {initials}
          </Text>
        </View>
      )}
    </View>
  )
}

function GroupConversationAvatar({ conversation }: { conversation: ConversationResponse }) {
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'
  const members = (conversation.members || []).slice(0, 8)
  const count = members.length

  // If group has a custom avatar, use it directly
  if (conversation.avatar) {
    return <UserAvatar source={conversation.avatar} name={conversation.name || 'Group'} size='xl' />
  }

  if (count === 0) {
    return <UserAvatar source={null} name={conversation.name || 'Group'} size='xl' />
  }

  if (count < 2) {
    return (
      <UserAvatar source={members[0]?.avatar || null} name={members[0]?.fullName || conversation.name || 'Group'} size='xl' />
    )
  }

  const containerSize = 52

  // 2 members: side by side, slightly overlapping
  if (count === 2) {
    const cellSize = 30
    return (
      <View style={{ width: containerSize, height: containerSize, borderRadius: containerSize / 2, overflow: 'hidden', backgroundColor: isDark ? '#1F2937' : '#E5E7EB' }}>
        <View style={{ position: 'absolute', left: 2, top: (containerSize - cellSize) / 2, zIndex: 2 }}>
          <AvatarCell uri={members[0]?.avatar} label={members[0]?.fullName || 'U'} size={cellSize} />
        </View>
        <View style={{ position: 'absolute', left: 20, top: (containerSize - cellSize) / 2, zIndex: 1 }}>
          <AvatarCell uri={members[1]?.avatar} label={members[1]?.fullName || 'U'} size={cellSize} />
        </View>
      </View>
    )
  }

  // 3 members: 1 on top center, 2 on bottom
  if (count === 3) {
    const cellSize = 26
    return (
      <View style={{ width: containerSize, height: containerSize, borderRadius: containerSize / 2, overflow: 'hidden', backgroundColor: isDark ? '#1F2937' : '#E5E7EB' }}>
        <View style={{ position: 'absolute', left: (containerSize - cellSize) / 2, top: 1, zIndex: 2 }}>
          <AvatarCell uri={members[0]?.avatar} label={members[0]?.fullName || 'U'} size={cellSize} />
        </View>
        <View style={{ position: 'absolute', left: 2, top: 24, zIndex: 1 }}>
          <AvatarCell uri={members[1]?.avatar} label={members[1]?.fullName || 'U'} size={cellSize} />
        </View>
        <View style={{ position: 'absolute', left: 24, top: 24, zIndex: 1 }}>
          <AvatarCell uri={members[2]?.avatar} label={members[2]?.fullName || 'U'} size={cellSize} />
        </View>
      </View>
    )
  }

  // 4+ members: 2x2 grid
  const cellSize = 24
  const gap = 2
  const visible = members.slice(0, 4)
  const extra = Math.max(count - 4, 0)

  return (
    <View style={{ width: containerSize, height: containerSize, borderRadius: containerSize / 2, overflow: 'hidden', backgroundColor: isDark ? '#1F2937' : '#E5E7EB' }}>
      <View style={{ position: 'absolute', left: 2, top: 2 }}>
        <AvatarCell uri={visible[0]?.avatar} label={visible[0]?.fullName || 'U'} size={cellSize} />
      </View>
      <View style={{ position: 'absolute', left: 26, top: 2 }}>
        <AvatarCell uri={visible[1]?.avatar} label={visible[1]?.fullName || 'U'} size={cellSize} />
      </View>
      <View style={{ position: 'absolute', left: 2, top: 26 }}>
        <AvatarCell uri={visible[2]?.avatar} label={visible[2]?.fullName || 'U'} size={cellSize} />
      </View>
      <View style={{ position: 'absolute', left: 26, top: 26 }}>
        {visible[3] ? (
          <AvatarCell uri={visible[3]?.avatar} label={visible[3]?.fullName || 'U'} size={cellSize} />
        ) : (
          <View style={{ width: cellSize, height: cellSize, borderRadius: cellSize / 2, backgroundColor: '#6B7280', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>+{extra}</Text>
          </View>
        )}
      </View>
      {extra > 0 && visible.length >= 4 && (
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            paddingHorizontal: 4,
            backgroundColor: '#374151',
            borderWidth: 1.5,
            borderColor: isDark ? '#1F2937' : '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <Text style={{ fontSize: 9, fontWeight: '700', color: '#FFFFFF' }}>+{extra}</Text>
        </View>
      )}
    </View>
  )
}

export function ConversationListItem({ conversation, onPress, onLongPress }: ConversationListItemProps) {
  const containerRef = useRef<any>(null)
  const { t, i18n } = useTranslation()
  const { user: currentUser } = useAuthStore()
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'
  const colors = Colors[colorScheme]
  const hasUnread = (conversation.unreadCount ?? 0) > 0 || !!conversation.manuallyMarkedUnread
  const isPinned = conversation.isPinned
  const rawConversation = conversation as any

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    if (onLongPress && containerRef.current) {
      containerRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        onLongPress({ x, y, width, height })
      })
    }
  }

  const rawLastMessage =
    rawConversation.lastMessage ??
    rawConversation.lastMessageContent ??
    rawConversation.latestMessage?.content ??
    rawConversation.latestMessage

  const lastMessageContent =
    typeof rawLastMessage === 'string'
      ? rawLastMessage
      : typeof rawLastMessage?.content === 'string'
        ? rawLastMessage.content
        : typeof rawLastMessage?.text === 'string'
          ? rawLastMessage.text
          : typeof rawLastMessage?.message === 'string'
            ? rawLastMessage.message
            : typeof rawConversation.lastMessageMessage === 'string'
              ? rawConversation.lastMessageMessage
              : typeof rawConversation.latestMessage?.message === 'string'
                ? rawConversation.latestMessage.message
                : ''

  const lastMessageType =
    conversation.lastMessageType ?? rawConversation.latestMessage?.type ?? rawLastMessage?.type ?? null

  const lastMessageTime =
    conversation.lastMessageTime ||
    rawConversation.lastMessage?.timestamp ||
    rawConversation.lastMessageAt ||
    rawConversation.lastMessageCreatedAt ||
    rawConversation.latestMessage?.createdAt ||
    rawConversation.updatedAt ||
    null

  const incomingSenderName =
    rawConversation.lastMessageSenderName ||
    rawConversation.latestMessage?.senderName ||
    (!conversation.isGroup ? conversation.name || '' : '')

  const lastMsgStatus = conversation.lastMessageStatus ?? rawLastMessage?.status
  const isFromMe = conversation.isLastMessageFromMe ?? rawLastMessage?.isFromMe

  // Calculate system text if applicable
  let systemText = null
  if (
    lastMessageType === 'SYSTEM' ||
    lastMessageType === 'JOIN' ||
    lastMessageType === 'LEAVE' ||
    lastMessageType === 'CALL'
  ) {
    const msgObj = (rawConversation.latestMessage || {
      content: lastMessageContent,
      type: lastMessageType,
      senderId: rawConversation.lastMessageSenderId || rawConversation.latestMessage?.senderId,
      senderName: rawConversation.lastMessageSenderName || rawConversation.latestMessage?.senderName,
      metadata:
        rawConversation.lastMessageMetadata ||
        rawConversation.latestMessage?.metadata ||
        rawConversation.metadata ||
        rawConversation.lastMessage?.metadata,
      payload:
        rawConversation.lastMessagePayload ||
        rawConversation.latestMessage?.payload ||
        rawConversation.payload ||
        rawConversation.lastMessage?.payload
    }) as any

    systemText = getSystemMessageText(msgObj, currentUser?.id, t, conversation.members || [])
  }

  const preview = formatPreview(
    {
      content: stripAiControlTags(lastMessageContent),
      isFromMe: conversation.isLastMessageFromMe ?? isFromMe,
      isGroup: conversation.isGroup,
      senderName: conversation.isLastMessageFromMe ? '' : incomingSenderName,
      type: lastMessageType,
      status: lastMsgStatus,
      systemText
    },
    {
      you: t('messages.you'),
      user: t('messages.user'),
      type: {
        image: t('message.messageType.image', { defaultValue: '[Hình ảnh]' }),
        video: t('message.messageType.video', { defaultValue: '[Video]' }),
        file: t('message.messageType.file', { defaultValue: '[File]' })
      }
    }
  )

  const lastMsgTime = lastMessageTime
  const isRevoked = lastMsgStatus === MessageStatus.REVOKED

  const formatTime = (timeValue: string | number | Date | null | undefined) => {
    if (!timeValue) return ''
    try {
      const date = parseMessageDate(timeValue)
      if (!date) return ''
      
      const lang = i18n.language?.startsWith('en') ? 'en' : 'vi'
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const diffMs = now.getTime() - date.getTime()
      const diffSec = Math.floor(diffMs / 1000)
      
      if (diffSec < 60) return lang === 'vi' ? 'Vài giây' : 'Few sec'
      
      const diffMin = Math.floor(diffSec / 60)
      if (diffMin < 60) {
        return lang === 'vi' ? `${diffMin} phút` : `${diffMin} min${diffMin > 1 ? 's' : ''}`
      }
      
      const diffHour = Math.floor(diffMin / 60)
      if (diffHour < 24 && checkDate.getTime() === today.getTime()) {
        return lang === 'vi' ? `${diffHour} giờ` : `${diffHour} hour${diffHour > 1 ? 's' : ''}`
      }
      
      if (checkDate.getTime() === yesterday.getTime()) {
        return lang === 'vi' ? 'Hôm qua' : 'Yesterday'
      }
      
      const diffDays = Math.floor(diffHour / 24)
      if (diffDays < 7) {
        return lang === 'vi' ? `${diffDays} ngày` : `${diffDays} day${diffDays > 1 ? 's' : ''}`
      }
      
      if (date.getFullYear() === now.getFullYear()) {
         return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`
      }
      
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
    } catch {
      return ''
    }
  }

  return (
    <TouchableOpacity
      ref={containerRef}
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={200}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: isPinned ? (isDark ? '#2D323C' : '#F8FAFC') : colors.background,
        borderBottomWidth: 0.5,
        borderBottomColor: isDark ? '#374151' : '#F1F5F9'
      }}
    >
      {/* Avatar */}
      <View style={{ marginRight: 12 }}>
        {conversation.isGroup && !conversation.avatar ? (
          <GroupConversationAvatar conversation={conversation} />
        ) : (
          <UserAvatar 
            source={conversation.avatar} 
            name={conversation.name || ''} 
            size='xl'
            showOnline={!conversation.isGroup && conversation.status === 'ONLINE'}
            isOnline={true}
          />
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text
            style={{
              fontSize: 17,
              fontWeight: hasUnread ? '700' : '500',
              color: colors.text,
              flex: 1
            }}
            numberOfLines={1}
          >
            {conversation.name || t('message.user', { defaultValue: 'User' })}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
            {isPinned && <Ionicons name='pin' size={12} color='#94A3B8' style={{ marginRight: 4 }} />}
            <Text style={{ fontSize: 13, color: '#94A3B8' }}>{formatTime(lastMessageTime ?? lastMsgTime)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 15,
              color: hasUnread ? colors.text : '#94A3B8',
              fontStyle: isRevoked ? 'italic' : 'normal',
              fontWeight: hasUnread ? '500' : '400'
            }}
          >
            {isRevoked ? t('messages.messageRevoked') : preview}
          </Text>
          {hasUnread && (
            <View
              style={{
                marginLeft: 8,
                backgroundColor: '#EF4444',
                borderRadius: (conversation.unreadCount ?? 0) > 0 ? 10 : 5,
                minWidth: (conversation.unreadCount ?? 0) > 0 ? 20 : 10,
                height: (conversation.unreadCount ?? 0) > 0 ? 20 : 10,
                paddingHorizontal: (conversation.unreadCount ?? 0) > 0 ? 6 : 0,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>
                {(conversation.unreadCount ?? 0) > 0
                  ? (conversation.unreadCount ?? 0) > 99
                    ? '99+'
                    : conversation.unreadCount
                  : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}
