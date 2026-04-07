import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  TouchableOpacity,
  Alert,
  Clipboard,
  Modal,
  Pressable,
  Animated,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { MessageStatus, type MessageResponse, type ReplyMetadataResponse } from '../schemas'

const EMOJIS = ['\u2764\uFE0F', '\uD83D\uDC4D', '\uD83D\uDE06', '\uD83D\uDE2E', '\uD83D\uDE22', '\uD83D\uDE21']

interface MessageBubbleProps {
  message: MessageResponse
  isOwn: boolean
  isLatestOwnMessage?: boolean
  showTime?: boolean
  showAvatar?: boolean
  showSenderName?: boolean
  onAvatarPress?: (userId: string) => void
  onReply?: (message: MessageResponse) => void
  onRevoke?: (messageId: string) => void
  onDeleteForMe?: (messageId: string) => void
  onForward?: (message: MessageResponse) => void
  onOpenMessageOptions?: () => void
}

export function MessageBubble({
  message,
  isOwn,
  isLatestOwnMessage = false,
  showTime = true,
  showAvatar = true,
  showSenderName = false,
  onAvatarPress,
  onReply,
  onRevoke,
  onDeleteForMe,
  onForward,
  onOpenMessageOptions,
}: MessageBubbleProps) {
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'
  const [showActions, setShowActions] = useState(false)

  const overlayOpacity = useRef(new Animated.Value(0)).current
  const sheetTranslateY = useRef(new Animated.Value(400)).current
  const emojiScale = useRef(new Animated.Value(0)).current

  const isRevoked = message.status === MessageStatus.REVOKED

  const bubbleBg = isRevoked
    ? isDark ? '#2a2a2a' : '#F3F4F6'
    : isOwn
      ? isDark ? '#004BA0' : '#D5E9FF'
      : isDark ? '#2A2F36' : '#FFFFFF'

  const textColor = isRevoked
    ? isDark ? '#888' : '#9ca3af'
    : isDark ? '#E8EAED' : '#111827'

  const timeColor = isDark ? '#777' : '#9ca3af'

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr.endsWith('Z') ? dateStr : dateStr + 'Z')
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const shouldShowDeliveryStatus = isOwn && !isRevoked && (showActions || isLatestOwnMessage)

  const getDeliveryStatusLabel = () => {
    if (!shouldShowDeliveryStatus) return null

    if (message.id?.startsWith('temp-')) {
      return t('message.status.sending', { defaultValue: 'Dang gui' })
    }

    const rawStatus = String((message as any).deliveryStatus || message.status || '').toUpperCase()
    if (!rawStatus) {
      return t('message.status.sent', { defaultValue: 'Da gui' })
    }

    if (
      rawStatus.includes('RECEIVED') ||
      rawStatus.includes('DELIVERED') ||
      rawStatus.includes('READ') ||
      rawStatus.includes('SEEN')
    ) {
      return t('message.status.received', { defaultValue: 'Da nhan' })
    }

    if (rawStatus.includes('SENDING')) {
      return t('message.status.sending', { defaultValue: 'Dang gui' })
    }

    return t('message.status.sent', { defaultValue: 'Da gui' })
  }

  const openSheet = useCallback(() => {
    if (isRevoked) return
    setShowActions(true)
  }, [isRevoked])

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(sheetTranslateY, { toValue: 400, duration: 200, useNativeDriver: true }),
    ]).start(() => setShowActions(false))
  }, [overlayOpacity, sheetTranslateY])

  useEffect(() => {
    if (showActions) {
      overlayOpacity.setValue(0)
      sheetTranslateY.setValue(400)
      emojiScale.setValue(0.8)
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(sheetTranslateY, {
          toValue: 0, damping: 22, stiffness: 280, mass: 0.7, useNativeDriver: true,
        }),
        Animated.spring(emojiScale, {
          toValue: 1, damping: 14, stiffness: 300, mass: 0.5, useNativeDriver: true,
        }),
      ]).start()
    }
  }, [showActions])

  const handleAction = useCallback((action: string) => {
    closeSheet()
    switch (action) {
      case 'reply':
        onReply?.(message)
        break
      case 'forward':
        onForward?.(message)
        break
      case 'revoke':
        Alert.alert(
          t('message.actions.revoke', { defaultValue: 'Thu hoi' }),
          t('message.actions.revokeConfirm', { defaultValue: 'Thu hoi tin nhan nay?' }),
          [
            { text: t('message.actions.cancel', { defaultValue: 'Huy' }), style: 'cancel' },
            { text: 'OK', onPress: () => onRevoke?.(message.id), style: 'destructive' },
          ]
        )
        break
      case 'delete':
        Alert.alert(
          t('message.actions.delete', { defaultValue: 'Xoa o phia toi' }),
          t('message.actions.deleteConfirm', { defaultValue: 'Xoa tin nhan phia ban?' }),
          [
            { text: t('message.actions.cancel', { defaultValue: 'Huy' }), style: 'cancel' },
            { text: 'OK', onPress: () => onDeleteForMe?.(message.id), style: 'destructive' },
          ]
        )
        break
      case 'copy':
        if (message.content) Clipboard.setString(message.content)
        break
      case 'info':
        if (onOpenMessageOptions) {
          onOpenMessageOptions()
          break
        }
        Alert.alert(
          t('message.actions.comingSoonTitle', { defaultValue: 'Thong bao' }),
          t('message.actions.comingSoon', { defaultValue: 'Chuc nang dang duoc phat trien.' })
        )
        break
      case 'pin':
      case 'reminder':
      case 'select':
      case 'quickMessage':
      case 'translate':
      case 'readText':
      case 'save':
        Alert.alert(
          t('message.actions.comingSoonTitle', { defaultValue: 'Thong bao' }),
          t('message.actions.comingSoon', { defaultValue: 'Chuc nang dang duoc phat trien.' })
        )
        break
    }
  }, [closeSheet, message, onReply, onForward, onRevoke, onDeleteForMe, onOpenMessageOptions, t])

  const actionRows = buildActionRows(isOwn, isDark, t)
  const deliveryStatusLabel = getDeliveryStatusLabel()

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        paddingHorizontal: 12,
        marginBottom: 4,
        alignItems: 'flex-end',
      }}
    >
      {!isOwn && showAvatar && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => message.senderId && onAvatarPress?.(message.senderId)}
          style={{ marginRight: 8 }}
        >
          <UserAvatar source={message.senderAvatar} name={message.senderName || ''} size="sm" />
        </TouchableOpacity>
      )}
      {!isOwn && !showAvatar && <View style={{ width: 40 }} />}

      <View style={{ maxWidth: '70%' }}>
        {showSenderName && message.senderName && !isOwn && (
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2, marginLeft: 4 }}>
            {message.senderName}
          </Text>
        )}

        <TouchableOpacity activeOpacity={0.8} onLongPress={openSheet} delayLongPress={300}>
          <View
            style={{
              backgroundColor: bubbleBg,
              borderRadius: 16,
              borderTopRightRadius: isOwn ? 4 : 16,
              borderTopLeftRadius: isOwn ? 16 : 4,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: !isOwn && !isDark && !isRevoked ? 0.5 : 0,
              borderColor: '#E5E7EB',
            }}
          >
            {message.replyTo && !isRevoked && (
              <View
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: '#0068FF',
                  backgroundColor: isOwn
                    ? isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,80,200,0.1)'
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  marginBottom: 6,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#0068FF' }} numberOfLines={1}>
                  {message.replyTo.senderName || 'User'}
                </Text>
                <Text style={{ fontSize: 13, color: isDark ? '#aaa' : '#666' }} numberOfLines={2}>
                  {message.replyTo.content}
                </Text>
              </View>
            )}
            {isRevoked ? (
              <Text style={{ fontSize: 14, color: textColor, fontStyle: 'italic' }}>
                {t('message.messageRevoked')}
              </Text>
            ) : (
              <Text style={{ fontSize: 15, color: textColor, lineHeight: 21 }}>
                {message.content}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {(showTime || !!deliveryStatusLabel) && (
          <View
            style={{
              flexDirection: 'row',
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              marginTop: 2,
              marginHorizontal: 4,
              gap: 6,
            }}
          >
            {showTime && (
              <Text style={{ fontSize: 11, color: timeColor }}>
                {formatTime(message.createdAt)}
              </Text>
            )}
            {!!deliveryStatusLabel && (
              <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '500' }}>
                {deliveryStatusLabel}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Zalo-style action modal */}
      <Modal visible={showActions} transparent statusBarTranslucent animationType="none" onRequestClose={closeSheet}>
        <Animated.View
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)', opacity: overlayOpacity,
          }}
        />

        <Pressable style={{ flex: 1 }} onPress={closeSheet}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            {/* Selected message preview */}
            <View
              style={{
                alignSelf: 'flex-end',
                maxWidth: '75%',
                marginHorizontal: 16,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: isOwn
                    ? isDark ? '#004BA0' : '#D5E9FF'
                    : isDark ? '#2A2F36' : '#FFFFFF',
                  borderRadius: 16,
                  borderTopRightRadius: isOwn ? 4 : 16,
                  borderTopLeftRadius: isOwn ? 16 : 4,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                }}
              >
                <Text style={{ fontSize: 15, color: isDark ? '#E8EAED' : '#111827', lineHeight: 21 }}>
                  {message.content}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginTop: 2, marginHorizontal: 4, gap: 6 }}>
                <Text style={{ fontSize: 11, color: timeColor }}>
                  {formatTime(message.createdAt)}
                </Text>
                {!!getDeliveryStatusLabel() && (
                  <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '500' }}>
                    {getDeliveryStatusLabel()}
                  </Text>
                )}
              </View>
            </View>

            {/* Emoji reaction bar */}
            <Animated.View
              style={{
                alignSelf: 'flex-end',
                flexDirection: 'row',
                backgroundColor: isDark ? '#1E2732' : '#FFFFFF',
                borderRadius: 28,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginBottom: 12,
                marginRight: 16,
                gap: 4,
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                transform: [{ scale: emojiScale }],
              }}
            >
              {EMOJIS.map((emoji, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={closeSheet}
                  activeOpacity={0.7}
                  style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        </Pressable>

        {/* Bottom sheet with full action grid */}
        <Animated.View
          style={{
            backgroundColor: isDark ? '#1E2732' : '#FFFFFF',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: 36,
            transform: [{ translateY: sheetTranslateY }],
          }}
        >
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: isDark ? '#444' : '#D1D5DB' }} />
          </View>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {actionRows.map((row, rowIdx) => (
              <View key={rowIdx} style={{ flexDirection: 'row', paddingHorizontal: 4 }}>
                {row.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.6}
                    onPress={() => handleAction(item.key)}
                    style={{ width: '25%', alignItems: 'center', paddingTop: 14, paddingBottom: 10 }}
                  >
                    <View
                      style={{
                        width: 50, height: 50, borderRadius: 25,
                        backgroundColor: item.bgColor || (isDark ? '#2A3340' : '#F0F2F5'),
                        alignItems: 'center', justifyContent: 'center', marginBottom: 6,
                      }}
                    >
                      <Ionicons name={item.icon as any} size={23} color={item.iconColor} />
                    </View>
                    <Text
                      style={{
                        fontSize: 12, color: item.textColor || (isDark ? '#B0B8C1' : '#4A4A4A'),
                        textAlign: 'center', lineHeight: 16,
                      }}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </Modal>
    </View>
  )
}

type ActionItem = {
  key: string; icon: string; label: string; iconColor: string
  bgColor?: string; textColor?: string
}

function buildActionRows(isOwn: boolean, isDark: boolean, t: (k: string, o?: any) => string): ActionItem[][] {
  const blue = '#0068FF'
  const orange = '#FF8C00'
  const red = '#EF4444'
  const gray = isDark ? '#8899A6' : '#65676B'

  // Row 1
  const row1: ActionItem[] = [
    { key: 'reply', icon: 'arrow-undo-outline', label: t('message.actions.reply', { defaultValue: 'Tr\u1EA3 l\u1EDDi' }), iconColor: blue },
    { key: 'forward', icon: 'arrow-redo-outline', label: t('message.actions.forward', { defaultValue: 'Chuy\u1EC3n ti\u1EBFp' }), iconColor: blue },
    { key: 'save', icon: 'folder-open-outline', label: t('message.actions.save', { defaultValue: 'L\u01b0u My Documents' }), iconColor: '#1EA7D8' },
    { key: 'revoke', icon: 'refresh-outline', label: t('message.actions.revoke', { defaultValue: 'Thu h\u1ED3i' }), iconColor: orange },
  ]

  // Row 2
  const row2: ActionItem[] = [
    { key: 'copy', icon: 'copy-outline', label: t('message.actions.copy', { defaultValue: 'Sao ch\u00E9p' }), iconColor: blue },
    { key: 'pin', icon: 'pin-outline', label: t('message.actions.pin', { defaultValue: 'Ghim' }), iconColor: orange },
    { key: 'reminder', icon: 'time-outline', label: t('message.actions.reminder', { defaultValue: 'Nh\u1EAFc h\u1EB9n' }), iconColor: '#BE123C' },
    { key: 'select', icon: 'checkbox-outline', label: t('message.actions.selectMultiple', { defaultValue: 'Ch\u1ECDn nhi\u1EC1u' }), iconColor: blue },
  ]

  // Row 3
  const row3: ActionItem[] = [
    { key: 'quickMessage', icon: 'flash-outline', label: t('message.actions.quickMessage', { defaultValue: 'T\u1EA1o tin nh\u1EAFn nhanh' }), iconColor: '#06B6D4' },
    { key: 'translate', icon: 'language-outline', label: t('message.actions.translate', { defaultValue: 'D\u1ECBch' }), iconColor: '#16A34A' },
    { key: 'readText', icon: 'volume-high-outline', label: t('message.actions.readText', { defaultValue: '\u0110\u1ECDc v\u0103n b\u1EA3n' }), iconColor: '#7C3AED' },
    { key: 'info', icon: 'information-circle-outline', label: t('message.actions.detail', { defaultValue: 'Chi ti\u1EBFt' }), iconColor: gray },
  ]

  // Row 4
  const row4: ActionItem[] = [
    {
      key: 'delete', icon: 'trash-outline',
      label: t('message.actions.delete', { defaultValue: 'X\u00F3a \u1EDF ph\u00EDa t\u00F4i' }),
      iconColor: red, bgColor: isDark ? '#3B1C1C' : '#FFE4E6', textColor: red,
    },
  ]

  const safeRow1 = isOwn ? row1 : row1.filter((item) => item.key !== 'revoke')

  return [safeRow1, row2, row3, row4]
}
