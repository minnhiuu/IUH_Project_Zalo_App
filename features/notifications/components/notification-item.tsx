import React, { useState } from 'react'
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Text, UserAvatar } from '@/components'
import { useTheme } from '@/context'
import type { NotificationGroupResponse } from '../schemas/notification.schema'
import { friendApi } from '@/features/friend/api/friend.api'
import { getBadgeConfig } from '../utils/badge-utils'
import { getTimeAgo, renderHtmlText } from '../utils/render-utils'

interface NotificationItemProps {
  notification: NotificationGroupResponse
  highlighted?: boolean
  onMarkAsRead: (id: string) => void
}

const isChatNotification = (type?: string) => type === 'MESSAGE_DIRECT' || type === 'MESSAGE_GROUP'

export function NotificationItem({ notification, highlighted = false, onMarkAsRead }: NotificationItemProps) {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending')
  const [loading, setLoading] = useState(false)

  const badge = getBadgeConfig(notification.type)

  const handlePress = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }

    if (isChatNotification(notification.type)) {
      const conversationId = (notification.payload?.conversationId || notification.referenceId) as string | undefined
      if (conversationId) {
        router.push({
          pathname: '/chat/[id]' as any,
          params: {
            id: conversationId,
            conversationId,
            name: (notification.payload?.conversationName as string) || (notification.title as string) || '',
            avatar: (notification.payload?.conversationAvatar as string) || (notification.payload?.actorAvatar as string) || ''
          }
        })
      }
    }
  }

  const handleDecline = async () => {
    const requestId = (notification.payload?.requestId || notification.referenceId) as string
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
    const requestId = (notification.payload?.requestId || notification.referenceId) as string
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

  // Get localized body
  const currentLocale = i18n.language.split('-')[0]
  const displayBody = notification.translations?.[currentLocale]?.body || notification.body
  const itemBackground = highlighted
    ? (isDark ? 'rgba(0,104,255,0.18)' : 'rgba(0,104,255,0.12)')
    : notification.read
      ? colors.background
      : (isDark ? 'rgba(0,104,255,0.05)' : 'rgba(0,104,255,0.03)')

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        backgroundColor: itemBackground,
        borderLeftWidth: highlighted ? 3 : 0,
        borderLeftColor: highlighted ? colors.tint : 'transparent'
      }}
      className='flex-row items-start px-4 py-3'
    >
      <View className='mr-3 relative'>
        <UserAvatar
          source={(notification.payload?.actorAvatar as string) || undefined}
          name={(notification.payload?.actorName as string) || (notification.title as string) || 'U'}
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
        <View className='flex-row justify-between items-start'>
          <View className='flex-1'>
            <Text numberOfLines={3} className='text-[15px] leading-[20px]' style={{ color: colors.text, fontWeight: !notification.read ? '500' : '400' }}>
              {renderHtmlText(displayBody, { fontSize: 15, color: colors.text })}
            </Text>
            <Text className='text-[12px] mt-1' style={{ color: !notification.read ? colors.tint : colors.textSecondary }}>
              {getTimeAgo(notification.lastModifiedAt, t)}
            </Text>
          </View>
          {!notification.read && (
            <View className='ml-2 mt-2'>
              <View style={{ backgroundColor: colors.tint }} className='w-2.5 h-2.5 rounded-full' />
            </View>
          )}
        </View>

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
                    {t('notification.action.decline')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAccept}
                  className='flex-1 py-1.5 rounded-full items-center'
                  style={{ backgroundColor: colors.tint }}
                >
                  <Text className='text-[13px] font-semibold' style={{ color: '#fff' }}>
                    {t('notification.action.accept')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                className='py-2 px-3 rounded-lg items-center'
                style={{ backgroundColor: colors.backgroundSecondary }}
              >
                <Text className='text-[13px] font-medium' style={{ color: colors.textSecondary }}>
                  {status === 'accepted' ? t('notification.action.accepted') : t('notification.action.declined')}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}
