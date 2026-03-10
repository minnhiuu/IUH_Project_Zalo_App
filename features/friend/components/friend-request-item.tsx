import React, { useState } from 'react'
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
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
  const [actionState, setActionState] = useState<'none' | 'accepted' | 'declined'>('none')

  const displayName = type === 'received' ? request.requestedUserName : request.receivedUserName
  const displayAvatar = type === 'received' ? request.requestedUserAvatar : request.receivedUserAvatar

  const handleAccept = () => {
    onAccept?.(request.id)
    setActionState('accepted')
  }

  const handleDecline = () => {
    onDecline?.(request.id)
    setActionState('declined')
  }

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
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', flexDirection: type === 'sent' ? 'row' : 'column' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
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

          {/* Message bubble — only for received */}
          {type === 'received' && request.message && (
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
          ) : actionState === 'accepted' ? (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 14, color: '#10B981', fontWeight: '600', marginBottom: 8 }}>
                {t('friend.actions.accepted')}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  backgroundColor: '#F3F4F6',
                  alignSelf: 'flex-start',
                  gap: 6,
                }}
              >
                <Ionicons name="eye-off-outline" size={16} color="#374151" />
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#374151' }}>
                  {t('friend.actions.blockActivity')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : actionState === 'declined' ? (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 14, color: '#6b7280', fontWeight: '500', marginBottom: 8 }}>
                {t('friend.actions.declined')}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  backgroundColor: '#FEF2F2',
                  alignSelf: 'flex-start',
                  gap: 6,
                }}
              >
                <Ionicons name="time-outline" size={16} color="#DC2626" />
                <Text style={{ fontSize: 13, fontWeight: '500', color: '#DC2626' }}>
                  {t('friend.actions.block24h')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : type === 'received' ? (
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
              <TouchableOpacity
                onPress={handleDecline}
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
                onPress={handleAccept}
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
          ) : null}
        </View>
      </View>

      {/* Sent: withdraw button on same row, right-aligned */}
      {!isLoading && type === 'sent' && (
        <TouchableOpacity
          onPress={() => onCancel?.(request.id)}
          activeOpacity={0.7}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: '#E5E7EB',
            alignSelf: 'center',
            marginLeft: 8,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>
            {t('friend.actions.withdraw')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
