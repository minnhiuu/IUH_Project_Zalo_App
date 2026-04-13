import React, { useState } from 'react'
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text, UserAvatar } from '@/components'
import { useTheme } from '@/context/theme-context'
import type { NotificationGroupResponse } from '../schemas/notification.schema'
import { friendApi } from '@/features/friend/api/friend.api'

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

const getTimeAgo = (dateStr: string, t: any): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return t('friend.time.minutesAgo', { count: 1 })
  if (diffMin < 60) return t('friend.time.minutesAgo', { count: diffMin })
  if (diffHr < 24) return t('friend.time.hoursAgo', { count: diffHr })
  if (diffDay < 7) return t('friend.time.daysAgo', { count: diffDay })
  return date.toLocaleDateString('vi-VN')
}

const renderHtmlText = (html: string, baseStyle?: object) => {
  if (!html) return null
  const parts = html.split(/(<b>.*?<\/b>)/g)
  return parts.map((part, index) => {
    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      return (
        <Text key={index} style={[baseStyle, { fontWeight: 'bold' }]}>
          {part.replace(/<\/?b>/g, '')}
        </Text>
      )
    }
    return (
      <Text key={index} style={baseStyle}>
        {part}
      </Text>
    )
  })
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const { t } = useTranslation()
  const { colors, isDark } = useTheme()
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending')
  const [loading, setLoading] = useState(false)

  const badge = getBadgeConfig(notification.type)

  const handlePress = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  const handleDecline = async () => {
    const requestId = notification.payload?.requestId as string
    if (!requestId) return

    setLoading(true)
    try {
      await friendApi.declineFriendRequest(requestId)
      setStatus('declined')
      if (!notification.read) onMarkAsRead(notification.id)
    } catch (error) {
      console.error('Error declining friend request:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    const requestId = notification.payload?.requestId as string
    if (!requestId) return

    setLoading(true)
    try {
      await friendApi.acceptFriendRequest(requestId)
      setStatus('accepted')
      if (!notification.read) onMarkAsRead(notification.id)
    } catch (error) {
      console.error('Error accepting friend request:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{ backgroundColor: notification.read ? colors.background : colors.backgroundSecondary }}
      className='flex-row items-start px-4 py-3'
    >
      <View className='mr-3 relative'>
        <UserAvatar
          source={(notification.payload?.actorAvatar as string) || undefined}
          name={(notification.payload?.actorName as string) || 'Unknown'}
          size='lg'
        />
        <View
          style={{ backgroundColor: badge.color }}
          className='absolute -bottom-0.5 -right-0.5 rounded-full w-[22px] h-[22px] items-center justify-center border-2 border-white'
        >
          <Ionicons name={badge.icon} size={11} color='#fff' />
        </View>
      </View>

      <View className='flex-1 pr-2'>
        <Text numberOfLines={3} className='text-[15px] leading-[20px]' style={{ color: colors.text }}>
          {renderHtmlText(notification.body, { fontSize: 15, color: colors.text })}
        </Text>
        <Text className='text-[12px] mt-1' style={{ color: colors.textSecondary }}>
          {getTimeAgo(notification.lastModifiedAt, t)}
        </Text>

        {notification.type === 'FRIEND_REQUEST' && (
          <View className='mt-2.5'>
            {loading ? (
              <View className='py-2 items-center'>
                <ActivityIndicator size='small' color={colors.tint} />
              </View>
            ) : status === 'pending' ? (
              <View className='flex-row gap-2'>
                <TouchableOpacity
                  onPress={handleDecline}
                  className='flex-1 py-1.5 rounded-full items-center border'
                  style={{ backgroundColor: colors.background, borderColor: colors.border }}
                >
                  <Text className='text-[13px] font-semibold' style={{ color: colors.textSecondary }}>
                    {t('friend.actions.decline')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAccept}
                  className='flex-1 py-1.5 rounded-full items-center'
                  style={{ backgroundColor: colors.tint }}
                >
                  <Text className='text-[13px] font-semibold' style={{ color: '#fff' }}>
                    {t('friend.actions.accept')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                className='py-2 px-3 rounded-lg items-center'
                style={{ backgroundColor: colors.backgroundSecondary }}
              >
                <Text className='text-[13px] font-medium' style={{ color: colors.textSecondary }}>
                  {status === 'accepted' ? t('friend.notification.accepted') : t('friend.notification.declined')}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
