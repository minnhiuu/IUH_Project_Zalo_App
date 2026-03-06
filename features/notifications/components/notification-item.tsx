import React from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import type { NotificationGroupResponse } from '../schemas/notification.schema'

interface NotificationItemProps {
  notification: NotificationGroupResponse
  onMarkAsRead: (id: string) => void
}

const getBadgeConfig = (type: string) => {
  switch (type) {
    case 'MESSAGE_DIRECT':
      return { icon: 'chatbubble' as const, color: '#22c55e' }
    case 'POST_LIKE':
    case 'COMMENT_LIKE':
      return { icon: 'heart' as const, color: '#ef4444' }
    case 'FRIEND_REQUEST':
      return { icon: 'person-add' as const, color: '#0068FF' }
    case 'FRIEND_ACCEPT':
      return { icon: 'people' as const, color: '#0068FF' }
    case 'PHOTO_POST':
    case 'ALBUM_POST':
      return { icon: 'image' as const, color: '#22c55e' }
    case 'VIDEO_POST':
      return { icon: 'videocam' as const, color: '#ec4899' }
    case 'DOB':
      return { icon: 'gift' as const, color: '#ec4899' }
    case 'CALL':
      return { icon: 'call' as const, color: '#22c55e' }
    case 'POST_COMMENT':
    case 'COMMENT_REPLY':
      return { icon: 'chatbubble-ellipses' as const, color: '#0068FF' }
    case 'SYSTEM':
      return { icon: 'shield-checkmark' as const, color: '#0068FF' }
    default:
      return { icon: 'notifications' as const, color: '#6b7280' }
  }
}

const getTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} ph trước`
  if (diffHr < 24) return `${diffHr} giờ trước`
  if (diffDay < 7) return `${diffDay} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

const renderHtmlText = (html: string, baseStyle?: object) => {
  if (!html) return null
  const parts = html.split(/(<b>.*?<\/b>)/g)
  return parts.map((part, index) => {
    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      return (
        <Text key={index} style={[baseStyle, { fontWeight: 'bold', color: '#111827' }]}>
          {part.replace(/<\/?b>/g, '')}
        </Text>
      )
    }
    return <Text key={index}>{part}</Text>
  })
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const badge = getBadgeConfig(notification.type)

  const avatarUri =
    (notification.payload?.actorAvatar as string) ||
    `https://i.pravatar.cc/150?u=${notification.actorIds[0] ?? 'unknown'}`
  const mediaUrl = notification.payload?.mediaUrl as string | undefined

  const handlePress = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: notification.read ? '#ffffff' : '#f0f7ff'
      }}
    >
      {/* Avatar with badge */}
      <View style={{ marginRight: 12, position: 'relative' }}>
        <Image
          source={{ uri: avatarUri }}
          style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#f3f4f6' }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            backgroundColor: badge.color,
            borderRadius: 12,
            width: 22,
            height: 22,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: '#fff'
          }}
        >
          <Ionicons name={badge.icon} size={11} color='#fff' />
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text
          numberOfLines={3}
          style={{
            fontSize: 15,
            lineHeight: 20,
            color: '#374151'
          }}
        >
          {renderHtmlText(notification.body, { fontSize: 15 })}
        </Text>
        <Text
          style={{
            fontSize: 13,
            marginTop: 4,
            color: '#9ca3af'
          }}
        >
          {getTimeAgo(notification.lastModifiedAt)}
        </Text>

        {/* Action buttons (only for friend requests) */}
        {notification.type === 'FRIEND_REQUEST' && !notification.read && (
          <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: '#f3f4f6',
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#4b5563' }}>Từ chối</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: '#e0f2fe',
                alignItems: 'center'
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#0284c7' }}>Đồng ý</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Media Preview or Unread dot or Options */}
      <View style={{ alignItems: 'flex-end', gap: 8 }}>
        <TouchableOpacity style={{ padding: 4 }}>
          <Ionicons name='ellipsis-horizontal' size={18} color='#9ca3af' />
        </TouchableOpacity>

        {mediaUrl && (
          <Image
            source={{ uri: mediaUrl }}
            style={{ width: 44, height: 44, borderRadius: 4, backgroundColor: '#f3f4f6' }}
          />
        )}

        {!notification.read && !mediaUrl && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#0068FF',
              marginTop: 4
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  )
}
