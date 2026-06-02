import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { UserAvatar } from '@/components/common/user-avatar'
import { useTranslation } from 'react-i18next'
import type { MessageResponse } from '../schemas'
import { useAuthStore } from '@/store'

export interface GroupCallPayload {
  roomId: string
  callKind: 'voice' | 'video'
  status: 'active' | 'ended'
  callerName: string
  durationSeconds?: number
}

interface CallMetadata {
  callAction: 'ended' | 'missed' | 'rejected'
  durationSeconds: number
  callerId: string
  callerName: string
  receiverId: string
  receiverName: string
  callKind?: 'voice' | 'video'
}

interface CallMessageProps {
  message: MessageResponse
  isOwn: boolean
  activeGroupCallId?: string | null
  onAvatarPress?: (userId: string) => void
  onJoinGroupCall?: (roomId: string, callKind: 'voice' | 'video') => void
  onRecall?: (receiverId: string) => void
}

function formatDuration(seconds: number, t: any): string {
  if (seconds < 60) return t('messages.call.secondsFormat', { seconds, defaultValue: `${seconds} giây` })
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  if (remaining === 0) return t('messages.call.minutesFormat', { minutes, defaultValue: `${minutes} phút` })
  return t('messages.call.minutesSecondsFormat', { minutes, seconds: remaining, defaultValue: `${minutes} phút ${remaining} giây` })
}

export function CallMessage({
  message,
  isOwn,
  activeGroupCallId,
  onAvatarPress,
  onJoinGroupCall,
  onRecall
}: CallMessageProps) {
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'
  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser?.id || ''

  // ─── Group Call Message Handling ─────────────────────────────
  const isGroupCall = message.content?.startsWith('[GROUP_CALL]::')
  if (isGroupCall) {
    let payload: GroupCallPayload | null = null
    try {
      payload = JSON.parse(message.content!.slice('[GROUP_CALL]::'.length))
    } catch {
      // ignore
    }

    if (!payload) return null

    const isActive = payload.status === 'active' && activeGroupCallId === payload.roomId
    const isVideo = payload.callKind === 'video'

    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: isOwn ? 'flex-end' : 'flex-start',
            paddingHorizontal: isOwn ? 12 : 4,
            marginHorizontal: 4
          }
        ]}
      >
        {!isOwn && (
          <View style={styles.leftSlot}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => message.senderId && onAvatarPress?.(message.senderId)}
              style={styles.avatarContainer}
            >
              <UserAvatar
                source={message.senderAvatar}
                name={message.senderName || t('messages.call.member', { defaultValue: 'Thành viên' })}
                size='sm'
              />
            </TouchableOpacity>
          </View>
        )}
        <View
          style={[
            styles.card,
            {
              borderColor: isOwn
                ? (isDark ? '#2a4a6c' : '#D0E1FF')
                : (isDark ? '#3a3a3a' : '#E5E7EB'),
              backgroundColor: isOwn
                ? (isDark ? '#1a3a5c' : '#E5EFFF')
                : (isDark ? '#2a2a2a' : '#FFFFFF'),
              minWidth: 200,
              maxWidth: 260
            }
          ]}
        >
          {/* Status Header */}
          <View style={styles.privateHeader}>
            <Text style={[styles.privateStatusText, { color: isDark ? '#E8EAED' : '#111827' }]}>
              {t('messages.call.groupCall', { defaultValue: 'Cuộc gọi nhóm' })}
            </Text>
          </View>

          {/* Call Info Row */}
          <View style={styles.privateBody}>
            <View style={[styles.arrowWrapper, { backgroundColor: isDark ? '#2A2F36' : (isActive ? '#ECFDF5' : '#F3F4F6') }]}>
              <Ionicons
                name={isVideo ? 'videocam' : 'call'}
                size={15}
                color={isActive ? '#10B981' : '#8A8A8A'}
              />
            </View>
            <View style={{ flex: 1, flexDirection: 'column' }}>
              <Text style={[styles.privateLabel, { color: isDark ? '#E8EAED' : '#111827', fontSize: 13, fontWeight: '600' }]} numberOfLines={1}>
                {isActive
                  ? t('messages.call.inProgress', { defaultValue: 'Đang diễn ra...' })
                  : t('messages.call.ended', { defaultValue: 'Đã kết thúc' })}
                {!isActive && payload.durationSeconds ? ` - ${formatDuration(payload.durationSeconds, t)}` : ''}
              </Text>
              <Text style={[{ color: isDark ? '#A9B7CC' : '#6B7280', fontSize: 11, marginTop: 2 }]} numberOfLines={1}>
                {t('messages.call.startedBy', { name: payload.callerName, defaultValue: `Bắt đầu bởi ${payload.callerName}` })}
              </Text>
            </View>
          </View>

          {/* Join Call Action Button */}
          {isActive && onJoinGroupCall && (
            <View>
              <View style={[styles.divider, { backgroundColor: isDark ? '#3a3a3a' : '#F3F4F6', marginHorizontal: 12 }]} />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onJoinGroupCall?.(payload!.roomId, payload!.callKind)}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>
                  {t('messages.call.joinCall', { defaultValue: 'Tham gia cuộc gọi' })}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    )
  }

  // ─── 1:1 Call Message Handling ───────────────────────────────
  const meta = message.metadata as unknown as CallMetadata | undefined
  if (!meta) return null

  const isCaller = meta.callerId === currentUserId
  const action = meta.callAction
  const callKind = meta.callKind || 'video'
  const isVideo = callKind === 'video'

  let statusText = ''
  let callLabel = ''
  let iconColor = '#10B981'
  let iconName: keyof typeof Ionicons.glyphMap = isVideo ? 'videocam' : 'call'
  let isOutgoing = false

  const callTypeLabel = isVideo
    ? t('messages.call.videoCall', { defaultValue: 'Cuộc gọi video' })
    : t('messages.call.voiceCall', { defaultValue: 'Cuộc gọi thoại' })

  switch (action) {
    case 'ended':
      statusText = isCaller
        ? t('messages.call.youCalled', { defaultValue: 'Bạn đã gọi' })
        : t('messages.call.theyCalled', { name: meta.callerName, defaultValue: `${meta.callerName} đã gọi` })
      callLabel = `${callTypeLabel} - ${formatDuration(meta.durationSeconds, t)}`
      iconColor = '#10B981'
      isOutgoing = isCaller
      break
    case 'missed':
      if (isCaller) {
        statusText = t('messages.call.youCancelled', { defaultValue: 'Bạn đã hủy' })
        callLabel = callTypeLabel
        iconColor = '#EF4444'
        isOutgoing = true
      } else {
        statusText = t('messages.call.missedCall', { defaultValue: 'Cuộc gọi nhỡ' })
        callLabel = callTypeLabel
        iconColor = '#EF4444'
        isOutgoing = false
      }
      break
    case 'rejected':
      if (isCaller) {
        statusText = t('messages.call.theyRejected', { name: meta.receiverName, defaultValue: `${meta.receiverName} từ chối` })
        callLabel = callTypeLabel
        iconColor = '#8A8A8A'
        isOutgoing = true
      } else {
        statusText = t('messages.call.youRejected', { defaultValue: 'Bạn đã từ chối' })
        callLabel = callTypeLabel
        iconColor = '#8A8A8A'
        isOutgoing = false
      }
      break
    default:
      statusText = callTypeLabel
      callLabel = callTypeLabel
      iconColor = '#2563EB'
      isOutgoing = isCaller
  }

  const targetUserId = isCaller ? meta.receiverId : meta.callerId

  return (
    <View
      style={[
        styles.container,
        {
          justifyContent: isOwn ? 'flex-end' : 'flex-start',
          paddingHorizontal: isOwn ? 12 : 4,
          marginHorizontal: 4
        }
      ]}
    >
      {!isOwn && (
        <View style={styles.leftSlot}>
          <View style={styles.avatarPlaceholder} />
        </View>
      )}
      <View
        style={[
          styles.card,
          {
            borderColor: isOwn
              ? (isDark ? '#2a4a6c' : '#D0E1FF')
              : (isDark ? '#3a3a3a' : '#E5E7EB'),
            backgroundColor: isOwn
              ? (isDark ? '#1a3a5c' : '#E5EFFF')
              : (isDark ? '#2a2a2a' : '#FFFFFF'),
            minWidth: 200,
            maxWidth: 260
          }
        ]}
      >
        {/* Status Header */}
        <View style={styles.privateHeader}>
          <Text style={[styles.privateStatusText, { color: isDark ? '#E8EAED' : '#111827' }]}>
            {statusText}
          </Text>
        </View>

        {/* Call Info Row */}
        <View style={styles.privateBody}>
          <View style={[styles.arrowWrapper, { backgroundColor: isDark ? '#2A2F36' : (iconColor === '#EF4444' ? '#FEF2F2' : (iconColor === '#8A8A8A' ? '#F3F4F6' : '#ECFDF5')) }]}>
            <Ionicons
              name={iconName}
              size={15}
              color={iconColor}
            />
          </View>
          <Text style={[styles.privateLabel, { color: isDark ? '#A9B7CC' : '#6B7280', fontSize: 13, fontWeight: '500' }]} numberOfLines={1}>
            {callLabel}
          </Text>
        </View>

        {/* Recall Button */}
        {onRecall && (
          <View>
            <View style={[styles.divider, { backgroundColor: isDark ? '#3a3a3a' : '#F3F4F6', marginHorizontal: 12 }]} />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onRecall(targetUserId)}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>
                {t('messages.call.recall', { defaultValue: 'Gọi lại' })}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-start'
  },
  leftSlot: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  avatarContainer: {
    marginRight: 4
  },
  avatarPlaceholder: {
    width: 36
  },
  card: {
    borderRadius: 16,
    borderWidth: 0.8,
    overflow: 'hidden',
    maxWidth: 280,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1.5
  },
  groupHeader: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  headerTitle: {
    fontSize: 13.5,
    fontWeight: '700'
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981'
  },
  groupBody: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  groupTexts: {
    flexDirection: 'column',
    flex: 1
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600'
  },
  callerName: {
    fontSize: 11,
    marginTop: 2
  },
  divider: {
    height: 0.8
  },
  actionButton: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0068FF'
  },
  privateHeader: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4
  },
  privateStatusText: {
    fontSize: 13,
    fontWeight: '600'
  },
  privateBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 10,
    marginTop: 2
  },
  arrowWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  privateLabel: {
    fontSize: 12,
    flex: 1
  }
})
