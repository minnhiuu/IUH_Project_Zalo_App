import React, { useEffect } from 'react'
import { View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components'
import { BRAND } from '@/constants/theme'
import { useSemanticColors } from '@/context/theme-context'
import { FriendStatus, type FriendRequestResponse } from '../schemas'

interface FriendRequestItemProps {
  request: FriendRequestResponse
  type: 'received' | 'sent'
  onAccept?: (friendshipId: string) => void
  onDecline?: (friendshipId: string) => void
  onCancel?: (friendshipId: string, userId: string) => void
  isLoading?: boolean
  isNew?: boolean
  autoAction?: 'accept' | 'decline'
  autoActionTimestamp?: string
}

export function FriendRequestItem({
  request,
  type,
  onAccept,
  onDecline,
  onCancel,
  isLoading = false,
  isNew = false,
  autoAction,
  autoActionTimestamp
}: FriendRequestItemProps) {
  const { t } = useTranslation()
  const semanticColors = useSemanticColors()

  // Get theme colors
  const textColor = semanticColors.textPrimary
  const textSecondary = semanticColors.textSecondary
  const backgroundColor = semanticColors.background
  const secondaryBg = semanticColors.backgroundSecondary
  const borderColor = semanticColors.border

  const displayName = type === 'received' ? request.requestedUserName : request.receivedUserName
  const displayAvatar = type === 'received' ? request.requestedUserAvatar : request.receivedUserAvatar
  const hasProcessedAutoAction = React.useRef(false)

  const getTimeDisplay = (dateStr: string): string => {
    const timestamp = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffSeconds < 60) return t('friend.time.minutesAgo', { count: 1 })
    if (diffMinutes < 60) return t('friend.time.minutesAgo', { count: diffMinutes })
    if (diffHours < 24) return t('friend.time.hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('friend.time.daysAgo', { count: diffDays })
    if (diffDays < 30) return t('friend.time.weeksAgo', { count: Math.floor(diffDays / 7) })

    const day = String(timestamp.getDate()).padStart(2, '0')
    const month = String(timestamp.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }

  const handleAccept = () => {
    onAccept?.(request.id)
  }

  const handleDecline = () => {
    onDecline?.(request.id)
  }

  const handleCancel = () => {
    onCancel?.(request.id, request.receivedUserId)
  }

  // Auto-action effect: only trigger once when request is PENDING and autoAction is set
  useEffect(() => {
    if (request.status === FriendStatus.PENDING && !isLoading && autoAction && !hasProcessedAutoAction.current) {
      hasProcessedAutoAction.current = true
      if (autoAction === 'accept') {
        handleAccept()
      } else if (autoAction === 'decline') {
        handleDecline()
      }
    }
  }, [autoAction, autoActionTimestamp, isLoading, request.status])

  const renderActionButtons = () => {
    if (isLoading) {
      return (
        <View style={{ marginTop: 12, alignItems: 'center', paddingVertical: 10 }}>
          <ActivityIndicator size='small' color={BRAND.blue} />
        </View>
      )
    }

    // Received request - PENDING status
    if (request.status === FriendStatus.PENDING && type === 'received') {
      return (
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
          <TouchableOpacity
            onPress={handleDecline}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 20,
              backgroundColor: semanticColors.secondary,
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: semanticColors.secondaryForeground }}>
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
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: BRAND.blue }}>{t('friend.actions.accept')}</Text>
          </TouchableOpacity>
        </View>
      )
    }

    // ACCEPTED status
    if (request.status === FriendStatus.ACCEPTED) {
      return (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 14, color: semanticColors.success, fontWeight: '600', marginBottom: 8 }}>
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
              backgroundColor: semanticColors.secondary,
              alignSelf: 'flex-start',
              gap: 6
            }}
          >
            <Ionicons name='eye-off-outline' size={16} color={textSecondary} />
            <Text style={{ fontSize: 13, fontWeight: '500', color: textSecondary }}>
              {t('friend.actions.blockActivity')}
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    // DECLINED status
    if (request.status === FriendStatus.DECLINED) {
      return (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 14, color: textSecondary, fontWeight: '500', marginBottom: 8 }}>
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
              backgroundColor: semanticColors.secondary,
              alignSelf: 'flex-start',
              gap: 6
            }}
          >
            <Ionicons name='time-outline' size={16} color={semanticColors.error} />
            <Text style={{ fontSize: 13, fontWeight: '500', color: semanticColors.error }}>
              {t('friend.actions.block24h')}
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    // CANCELLED status
    if (request.status === FriendStatus.CANCELLED) {
      return (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 14, color: textSecondary, fontWeight: '500' }}>{t('friend.actions.cancelled')}</Text>
        </View>
      )
    }

    return null
  }

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: backgroundColor,
        flexDirection: type === 'sent' ? 'row' : 'column'
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 1 }}>
        {/* Avatar */}
        <UserAvatar source={displayAvatar} name={displayName} size='lg' className='mr-3' />

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: '600', color: textColor }}>{displayName}</Text>
          </View>

          <Text style={{ fontSize: 14, color: textSecondary, marginTop: 2 }}>
            {getTimeDisplay(request.createdAt)} • {t('friend.wantsToBeFriends')}
          </Text>

          {/* Message bubble — only for received */}
          {type === 'received' && request.message && (
            <View
              style={{
                backgroundColor: secondaryBg,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: borderColor,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginTop: 10
              }}
            >
              <Text style={{ fontSize: 15, color: textColor, lineHeight: 22 }}>{request.message}</Text>
            </View>
          )}

          {/* Action Buttons */}
          {renderActionButtons()}
        </View>
      </View>

      {/* Sent: withdraw button on same row, right-aligned */}
      {!isLoading && type === 'sent' && request.status === FriendStatus.PENDING && (
        <TouchableOpacity
          onPress={handleCancel}
          activeOpacity={0.7}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: semanticColors.secondary,
            alignSelf: 'center',
            marginLeft: 8
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: semanticColors.secondaryForeground }}>
            {t('friend.actions.withdraw')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
