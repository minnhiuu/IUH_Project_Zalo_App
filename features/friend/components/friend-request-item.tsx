import React from 'react'
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/text'
import { BRAND } from '@/constants/theme'
import { useThemeColor } from '@/hooks/use-theme-color'
import type { FriendRequestResponse } from '../schemas'

interface FriendRequestItemProps {
  request: FriendRequestResponse
  type: 'received' | 'sent'
  onAccept?: (friendshipId: string) => void
  onDecline?: (friendshipId: string) => void
  onCancel?: (friendshipId: string) => void
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
  const [status, setStatus] = React.useState<'pending' | 'accepted' | 'declined' | 'withdrawn'>('pending')
  
  const backgroundColor = useThemeColor({}, 'background')
  const secondaryBg = useThemeColor({}, 'backgroundSecondary')
  const textColor = useThemeColor({}, 'text')
  const textSecondary = useThemeColor({}, 'textSecondary')
  const borderColor = useThemeColor({}, 'border')

  const highlightBg = isNew ? (backgroundColor === '#FFFFFF' ? '#EFF6FF' : '#1E293B') : backgroundColor

  const displayName = type === 'received' ? request.requestedUserName : request.receivedUserName
  const displayAvatar = type === 'received' ? request.requestedUserAvatar : request.receivedUserAvatar

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase()
  }

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
    setStatus('accepted')
    onAccept?.(request.id)
  }

  const handleDecline = () => {
    setStatus('declined')
    onDecline?.(request.id)
  }

  const handleCancel = () => {
    setStatus('withdrawn')
    onCancel?.(request.id)
  }

  React.useEffect(() => {
    if (status === 'pending' && !isLoading) {
      if (autoAction === 'accept') {
        handleAccept()
      } else if (autoAction === 'decline') {
        handleDecline()
      }
    }
  }, [autoAction, autoActionTimestamp])

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 14, backgroundColor: highlightBg }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Avatar */}
        {displayAvatar ? (
          <Image
            source={{ uri: displayAvatar }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: secondaryBg,
              marginRight: 12
            }}
          />
        ) : (
          <LinearGradient
            colors={['#818CF8', '#6366F1']}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{getInitials(displayName || 'U')}</Text>
          </LinearGradient>
        )}

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 17, fontWeight: '600', color: textColor }}>{displayName}</Text>
          </View>

          <Text style={{ fontSize: 14, color: textSecondary, marginTop: 2 }}>
            {getTimeDisplay(request.createdAt)} • {t('friend.wantsToBeFriends')}
          </Text>

          {/* Message bubble */}
          {request.message && (
            <View
              style={{
                backgroundColor: backgroundColor,
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
          {isLoading ? (
            <View style={{ marginTop: 12, alignItems: 'center', paddingVertical: 10 }}>
              <ActivityIndicator size='small' color={BRAND.blue} />
            </View>
          ) : status === 'pending' ? (
            type === 'received' ? (
              <View style={{ flexDirection: 'row', marginTop: 14, gap: 12 }}>
                <TouchableOpacity
                  onPress={handleDecline}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 25,
                    backgroundColor: secondaryBg,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: textSecondary }}>
                    {t('friend.actions.decline').toUpperCase()}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAccept}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 25,
                    backgroundColor: BRAND.blueLight,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: BRAND.blue }}>
                    {t('friend.actions.accept').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', marginTop: 14 }}>
                <TouchableOpacity
                  onPress={handleCancel}
                  activeOpacity={0.7}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 10,
                    borderRadius: 25,
                    backgroundColor: secondaryBg,
                    alignItems: 'center'
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: textSecondary }}>
                    {t('friend.actions.withdraw').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          ) : (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 14, color: textSecondary }}>
                {status === 'accepted' 
                  ? t('friend.actions.accepted') 
                  : status === 'declined' 
                    ? t('friend.actions.declined')
                    : t('friend.actions.withdrawn')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
