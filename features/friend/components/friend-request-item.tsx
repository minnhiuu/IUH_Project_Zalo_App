import React from 'react'
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { SEMANTIC, BRAND } from '@/constants/theme'
import type { FriendRequestResponse } from '../schemas'

interface FriendRequestItemProps {
  request: FriendRequestResponse
  type: 'received' | 'sent'
  onAccept?: (friendshipId: string) => void
  onDecline?: (friendshipId: string) => void
  onCancel?: (friendshipId: string) => void
  isLoading?: boolean
}

export function FriendRequestItem({
  request,
  type,
  onAccept,
  onDecline,
  onCancel,
  isLoading = false,
}: FriendRequestItemProps) {
  const { t } = useTranslation()

  const displayName = type === 'received' ? request.requestedUserName : request.receivedUserName
  const displayAvatar = type === 'received' ? request.requestedUserAvatar : request.receivedUserAvatar

  const getTimeDisplay = (dateStr: string): string => {
    const timestamp = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return t('friend.time.justNow')
    if (diffMinutes < 60) return t('friend.time.minutesAgo', { count: diffMinutes })
    if (diffHours < 24) return t('friend.time.hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('friend.time.daysAgo', { count: diffDays })
    if (diffDays < 30) return t('friend.time.weeksAgo', { count: Math.floor(diffDays / 7) })

    const day = String(timestamp.getDate()).padStart(2, '0')
    const month = String(timestamp.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <Image
          source={{ uri: displayAvatar || 'https://i.pravatar.cc/150' }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: '#E5E7EB',
            marginRight: 12,
          }}
        />

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
            {displayName}
          </Text>

          <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
            {getTimeDisplay(request.createdAt)}
          </Text>

          {/* Message bubble */}
          {request.message && (
            <View
              style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginTop: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
                {request.message}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {isLoading ? (
            <View style={{ marginTop: 12, alignItems: 'center', paddingVertical: 10 }}>
              <ActivityIndicator size="small" color="#0068FF" />
            </View>
          ) : type === 'received' ? (
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
              <TouchableOpacity
                onPress={() => onDecline?.(request.id)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: '#E5E7EB',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {t('friend.actions.decline')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onAccept?.(request.id)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: BRAND.blueLight,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: SEMANTIC.primary }}>
                  {t('friend.actions.accept')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => onCancel?.(request.id)}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: '#E5E7EB',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {t('friend.actions.withdraw')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
