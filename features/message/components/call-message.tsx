import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { UserAvatar } from '@/components/common/user-avatar'
import type { MessageResponse } from '../schemas'
import { useAuthStore } from '@/store'

export interface GroupCallPayload {
  roomId: string
  callKind: 'voice' | 'video'
  status: 'active' | 'ended'
  callerName: string
}

interface CallMetadata {
  callAction: 'ended' | 'missed' | 'rejected'
  durationSeconds: number
  callerId: string
  callerName: string
  receiverId: string
  receiverName: string
}

interface CallMessageProps {
  message: MessageResponse
  isOwn: boolean
  activeGroupCallId?: string | null
  onAvatarPress?: (userId: string) => void
  onJoinGroupCall?: (roomId: string, callKind: 'voice' | 'video') => void
  onRecall?: (receiverId: string) => void
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} giây`
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  if (remaining === 0) return `${minutes} phút`
  return `${minutes} phút ${remaining} giây`
}

export function CallMessage({
  message,
  isOwn,
  activeGroupCallId,
  onAvatarPress,
  onJoinGroupCall,
  onRecall
}: CallMessageProps) {
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
          { justifyContent: isOwn ? 'flex-end' : 'flex-start' }
        ]}
      >
        {!isOwn && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => message.senderId && onAvatarPress?.(message.senderId)}
            style={styles.avatarContainer}
          >
            <UserAvatar
              source={message.senderAvatar}
              name={message.senderName || 'Thành viên'}
              size='sm'
            />
          </TouchableOpacity>
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
                : (isDark ? '#2a2a2a' : '#FFFFFF')
            }
          ]}
        >
          {/* Header */}
          <View style={styles.groupHeader}>
            <View style={styles.groupTitleRow}>
              <Ionicons name='people-outline' size={16} color='#2563EB' />
              <Text style={[styles.headerTitle, { color: isDark ? '#E8EAED' : '#111827' }]}>
                Cuộc gọi nhóm
              </Text>
            </View>
            {isActive && <View style={styles.pulseDot} />}
          </View>

          {/* Description */}
          <View style={styles.groupBody}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name={isVideo ? 'videocam-outline' : 'call-outline'}
                size={16}
                color={isActive ? '#10B981' : '#8A8A8A'}
              />
            </View>
            <View style={styles.groupTexts}>
              <Text style={[styles.statusText, { color: isDark ? '#E8EAED' : '#111827' }]}>
                {isActive ? 'Đang diễn ra...' : 'Đã kết thúc'}
              </Text>
              <Text style={[styles.callerName, { color: isDark ? '#A9B7CC' : '#6B7280' }]}>
                Bắt đầu bởi {payload.callerName}
              </Text>
            </View>
          </View>

          {/* Join Call Action Button */}
          {isActive && onJoinGroupCall && (
            <View>
              <View style={[styles.divider, { backgroundColor: isDark ? '#3a3a3a' : '#E5E7EB' }]} />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onJoinGroupCall?.(payload!.roomId, payload!.callKind)}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>Tham gia cuộc gọi</Text>
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

  let statusText = ''
  let callLabel = ''
  let iconColor = '#10B981'
  let isOutgoing = false

  switch (action) {
    case 'ended':
      statusText = isCaller ? 'Bạn đã gọi' : `${meta.callerName} đã gọi`
      callLabel = `Cuộc gọi video - ${formatDuration(meta.durationSeconds)}`
      iconColor = '#10B981'
      isOutgoing = isCaller
      break
    case 'missed':
      if (isCaller) {
        statusText = 'Bạn đã hủy'
        callLabel = 'Cuộc gọi thoại'
        iconColor = '#EF4444'
        isOutgoing = true
      } else {
        statusText = 'Cuộc gọi nhỡ'
        callLabel = 'Cuộc gọi thoại'
        iconColor = '#EF4444'
        isOutgoing = false
      }
      break
    case 'rejected':
      if (isCaller) {
        statusText = `${meta.receiverName} từ chối`
        callLabel = 'Cuộc gọi video'
        iconColor = '#8A8A8A'
        isOutgoing = true
      } else {
        statusText = 'Bạn đã từ chối'
        callLabel = 'Cuộc gọi video'
        iconColor = '#8A8A8A'
        isOutgoing = false
      }
      break
    default:
      statusText = 'Cuộc gọi video'
      callLabel = 'Cuộc gọi video'
      iconColor = '#2563EB'
      isOutgoing = isCaller
  }

  const targetUserId = isCaller ? meta.receiverId : meta.callerId

  return (
    <View
      style={[
        styles.container,
        { justifyContent: isOwn ? 'flex-end' : 'flex-start' }
      ]}
    >
      {!isOwn && <View style={styles.avatarPlaceholder} />}
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
          <View style={[styles.arrowWrapper, { backgroundColor: isDark ? '#2A2F36' : '#F3F4F6' }]}>
            <Ionicons
              name={(isOutgoing ? 'arrow-up-forward' : 'arrow-down-backward') as any}
              size={13}
              color={iconColor}
            />
          </View>
          <Text style={[styles.privateLabel, { color: isDark ? '#A9B7CC' : '#6B7280' }]} numberOfLines={1}>
            {callLabel}
          </Text>
        </View>

        {/* Recall Button */}
        {onRecall && (
          <View>
            <View style={[styles.divider, { backgroundColor: isDark ? '#3a3a3a' : '#E5E7EB' }]} />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onRecall(targetUserId)}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Gọi lại</Text>
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
    width: '100%',
    paddingHorizontal: 12,
    marginVertical: 4,
    alignItems: 'flex-end'
  },
  avatarContainer: {
    marginRight: 8,
    width: 36,
    height: 36
  },
  avatarPlaceholder: {
    width: 44 // 36px size + 8px margin
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
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4
  },
  iconWrapper: {
    marginTop: 2
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
