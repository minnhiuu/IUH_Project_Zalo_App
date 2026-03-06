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
      className={`flex-row items-start px-4 py-3 ${notification.read ? 'bg-white' : 'bg-[#F0F7FF]'}`}
    >
      {/* Avatar with badge */}
      <View className='mr-3 relative'>
        <Image source={{ uri: avatarUri }} className='w-14 h-14 rounded-full bg-gray-100' />
        <View
          style={{ backgroundColor: badge.color }}
          className='absolute -bottom-0.5 -right-0.5 rounded-full w-[22px] h-[22px] items-center justify-center border-2 border-white'
        >
          <Ionicons name={badge.icon} size={11} color='#fff' />
        </View>
      </View>

      {/* Content */}
      <View className='flex-1 pr-2'>
        <Text numberOfLines={3} className='text-[15px] leading-[20px] text-gray-700'>
          {renderHtmlText(notification.body, { fontSize: 15 })}
        </Text>
        <Text className='text-[12px] mt-1 text-gray-400'>{getTimeAgo(notification.lastModifiedAt)}</Text>

        {/* Action buttons (only for friend requests) */}
        {notification.type === 'FRIEND_REQUEST' && !notification.read && (
          <View className='flex-row mt-2.5 gap-2'>
            <TouchableOpacity className='flex-1 py-2 rounded-full bg-gray-100 items-center border border-gray-200'>
              <Text className='text-[13px] font-semibold text-gray-600'>Từ chối</Text>
            </TouchableOpacity>
            <TouchableOpacity className='flex-1 py-2 rounded-full bg-blue-50 items-center border border-blue-100'>
              <Text className='text-[13px] font-semibold text-blue-600'>Đồng ý</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Media Preview or Unread dot or Options */}
      <View className='items-end gap-2'>
        <TouchableOpacity className='p-1'>
          <Ionicons name='ellipsis-horizontal' size={18} color='#9ca3af' />
        </TouchableOpacity>

        {mediaUrl && <Image source={{ uri: mediaUrl }} className='w-11 h-11 rounded bg-gray-100' />}

        {!notification.read && !mediaUrl && <View className='w-2 h-2 rounded-full bg-blue-500 mt-1' />}
      </View>
    </TouchableOpacity>
  )
}
