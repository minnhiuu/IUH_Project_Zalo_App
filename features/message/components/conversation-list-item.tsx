import React from 'react'
import { View, TouchableOpacity } from 'react-native'
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

interface ConversationListItemProps {
  conversation: ConversationResponse
  onPress: () => void
  onLongPress?: () => void
}

function AvatarCell({ uri, label, size, left, top }: { uri?: string | null; label: string; size: number; left: number; top: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {uri ? (
        <ExpoImage source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit='cover' />
      ) : (
        <Text style={{ fontSize: 10, fontWeight: '700', color: '#475569' }} numberOfLines={1}>
          {(label || 'U').slice(0, 2).toUpperCase()}
        </Text>
      )}
    </View>
  )
}

function GroupConversationAvatar({ conversation }: { conversation: ConversationResponse }) {
  const members = (conversation.members || []).slice(0, 8)
  const count = members.length
  const visible = members.slice(0, 4)
  const extra = Math.max(count - 4, 0)

  if (count === 0) {
    return <UserAvatar source={conversation.avatar} name={conversation.name || 'Group'} size='xl' />
  }

  if (count < 3) {
    return <UserAvatar source={visible[0]?.avatar || conversation.avatar} name={conversation.name || 'Group'} size='xl' />
  }

  const threePos = [
    { left: 6, top: 4, size: 23 },
    { left: 24, top: 4, size: 23 },
    { left: 15, top: 24, size: 23 }
  ]
  const fourPos = [
    { left: 4, top: 4, size: 21 },
    { left: 27, top: 4, size: 21 },
    { left: 4, top: 27, size: 21 },
    { left: 27, top: 27, size: 21 }
  ]

  const layout = count === 3 ? threePos : fourPos
  const renderMembers = count === 3 ? visible.slice(0, 3) : visible.slice(0, 4)

  return (
    <View
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#F1F5F9',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {renderMembers.map((m, idx) => (
        <AvatarCell
          key={`${m.userId}-${idx}`}
          uri={m.avatar}
          label={m.fullName || 'U'}
          size={layout[idx].size}
          left={layout[idx].left}
          top={layout[idx].top}
        />
      ))}
      {extra > 0 && (
        <View
          style={{
            position: 'absolute',
            right: 2,
            bottom: 2,
            minWidth: 20,
            height: 20,
            borderRadius: 10,
            paddingHorizontal: 5,
            backgroundColor: '#0F172A',
            borderWidth: 1,
            borderColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>+{extra}</Text>
        </View>
      )}
    </View>
  )
}

export function ConversationListItem({ conversation, onPress, onLongPress }: ConversationListItemProps) {
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const hasUnread = (conversation.unreadCount ?? 0) > 0
  const rawConversation = conversation as any

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
          : typeof rawConversation.latestMessage?.message === 'string'
            ? rawConversation.latestMessage.message
          : ''

  const lastMessageType =
    conversation.lastMessageType ?? rawConversation.latestMessage?.type ?? rawLastMessage?.type ?? null

  const lastMessageTime =
    conversation.lastMessageTime ||
    rawConversation.lastMessageAt ||
    rawConversation.lastMessageCreatedAt ||
    rawConversation.latestMessage?.createdAt ||
    rawConversation.updatedAt ||
    null

  const incomingSenderName =
    rawConversation.lastMessageSenderName ||
    rawConversation.latestMessage?.senderName ||
    (!conversation.isGroup ? conversation.name || '' : '')

  const preview = formatPreview(
    {
      content: lastMessageContent,
      isFromMe: conversation.isLastMessageFromMe,
      senderName:
        conversation.isLastMessageFromMe
          ? ''
          : incomingSenderName,
      type: lastMessageType,
      status: conversation.lastMessageStatus
    },
    {
      you: t('message.you'),
      user: '',
      type: {
        image: t('message.messageType.image', { defaultValue: '[Hình ảnh]' }),
        file: t('message.messageType.file', { defaultValue: '[File]' })
      }
    }
  )

  const isRevoked = conversation.lastMessageStatus === MessageStatus.REVOKED

  const formatTime = (timeValue: string | number | Date | null | undefined) => {
    if (!timeValue) return ''
    try {
      const date = parseMessageDate(timeValue)
      if (!date) return ''
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffSec = Math.floor(diffMs / 1000)
      const diffMin = Math.floor(diffMs / 60000)
      const diffHour = Math.floor(diffMs / 3600000)

      if (diffSec < 60) return `${Math.max(diffSec, 1)} giây`
      if (diffMin < 60) return `${diffMin} phút`
      if (diffHour < 24) return `${diffHour} giờ`
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 13,
        backgroundColor: colors.background
      }}
    >
      {/* Avatar */}
      <View style={{ marginRight: 12, paddingTop: 2 }}>
        {conversation.isGroup && !conversation.avatar ? (
          <GroupConversationAvatar conversation={conversation} />
        ) : (
          <UserAvatar source={conversation.avatar} name={conversation.name || ''} size='xl' />
        )}
      </View>

      {/* Content */}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          paddingBottom: 14,
          marginTop: 2,
          borderBottomWidth: 0.5,
          borderBottomColor: '#E5E7EB'
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: hasUnread ? '700' : '500',
              color: colors.text,
              flex: 1
            }}
            numberOfLines={1}
          >
            {conversation.name || t('message.user', { defaultValue: 'User' })}
          </Text>
          <Text style={{ fontSize: 15, color: '#6B7280', marginLeft: 8, marginTop: 1 }}>
            {formatTime(lastMessageTime)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: 16,
              color: '#6B7280',
              fontStyle: isRevoked ? 'italic' : 'normal',
              fontWeight: hasUnread ? '500' : '400'
            }}
          >
            {isRevoked ? t('message.messageRevoked') : preview}
          </Text>
          {hasUnread && (
            <View
              style={{
                marginLeft: 8,
                backgroundColor: '#ef4444',
                borderRadius: 11,
                minWidth: 22,
                height: 22,
                paddingHorizontal: 7,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>
                {(conversation.unreadCount ?? 0) > 99 ? '99+' : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}
