import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { useTranslation } from 'react-i18next'
import type { ConversationResponse } from '../schemas'
import { MessageStatus } from '../schemas'
import { formatPreview } from '../utils/chat-preview'

interface ConversationListItemProps {
  conversation: ConversationResponse
  onPress: () => void
  onLongPress?: () => void
}

export function ConversationListItem({ conversation, onPress, onLongPress }: ConversationListItemProps) {
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const hasUnread = (conversation.unreadCount ?? 0) > 0
  const lastMessageObject =
    conversation.lastMessage && typeof conversation.lastMessage === 'object' ? conversation.lastMessage : null
  const lastMessageContent =
    typeof conversation.lastMessage === 'string' ? conversation.lastMessage : lastMessageObject?.content ?? null
  const lastMessageTime = conversation.lastMessageTime ?? lastMessageObject?.timestamp ?? null
  const lastMessageType = conversation.lastMessageType ?? lastMessageObject?.type ?? null
  const lastMessageStatus = conversation.lastMessageStatus ?? lastMessageObject?.status ?? null
  const isLastMessageFromMe = conversation.isLastMessageFromMe ?? lastMessageObject?.isFromMe ?? null

  const preview = formatPreview(
    {
      content: lastMessageContent,
      isFromMe: isLastMessageFromMe,
      isGroup: conversation.isGroup,
      senderName: lastMessageObject?.senderName ?? null,
      type: lastMessageType,
      status: lastMessageStatus
    },
    {
      you: t('message.you'),
      user: t('message.user', { defaultValue: 'User' }),
      type: {
        image: t('message.messageType.image', { defaultValue: '[Image]' }),
        video: t('message.messageType.video', { defaultValue: '[Video]' }),
        file: t('message.messageType.file', { defaultValue: '[File]' })
      }
    }
  )

  const isRevoked = lastMessageStatus === MessageStatus.REVOKED

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return ''
    try {
      const date = new Date(timeStr.endsWith('Z') ? timeStr : timeStr + 'Z')
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMin = Math.floor(diffMs / 60000)
      const diffHour = Math.floor(diffMs / 3600000)

      if (diffMin < 1) return `1 ${t('message.status.minutesUnit', { defaultValue: 'phut' })}`
      if (diffMin < 60) return `${diffMin} ${t('message.status.minutesUnit', { defaultValue: 'min' })}`
      if (diffHour < 24) return `${diffHour} ${t('message.status.hoursUnit', { defaultValue: 'hr' })}`
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
        <UserAvatar source={conversation.avatar} name={conversation.name || ''} size='xl' />
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
