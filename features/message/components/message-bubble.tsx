import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, TouchableOpacity, Alert, Clipboard, Modal, Pressable, Animated, ScrollView, Image, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { MessageStatus, MessageType, type MessageResponse, type ReplyMetadataResponse } from '../schemas'
import { parseMessageDate } from '../utils/date-utils'
import { parseBusinessCardContent } from '../utils'
import { BusinessCardMessage } from './business-card-message'

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
  onReplyMessagePress?: (messageId: string) => void
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
  onReplyMessagePress
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
    ? isDark
      ? '#2a2a2a'
      : '#F3F4F6'
    : isOwn
      ? isDark
        ? '#004BA0'
        : '#D5E9FF'
      : isDark
        ? '#2A2F36'
        : '#FFFFFF'

  const textColor = isRevoked ? (isDark ? '#888' : '#9ca3af') : isDark ? '#E8EAED' : '#111827'

  const timeColor = isDark ? '#777' : '#9ca3af'

  const getReplyPreviewText = (reply: ReplyMetadataResponse) => {
    if (reply.type === MessageType.IMAGE) {
      return t('message.messageType.image', { defaultValue: '[Hình ảnh]' })
    }
    if (reply.type === MessageType.FILE) {
      const raw = (reply.content || '').trim()
      if (!raw || raw === '[FILE]') {
        return t('message.messageType.file', { defaultValue: '[File]' })
      }
      return `${t('message.messageType.file', { defaultValue: '[File]' })} ${raw}`
    }
    return reply.content || ''
  }

  const getReplyImageUri = (reply: ReplyMetadataResponse) => {
    if (reply.type !== MessageType.IMAGE) return null
    const raw = (reply.content || '').trim()
    if (/^https?:\/\//i.test(raw)) return raw
    return null
  }

  const getReplyFileBadge = (reply: ReplyMetadataResponse) => {
    if (reply.type !== MessageType.FILE) return null
    const raw = (reply.content || '').trim().toLowerCase()
    const ext = raw.includes('.') ? raw.split('.').pop() || '' : ''
    if (ext === 'pdf') return { text: 'PDF', bg: '#E53935' }
    if (ext === 'doc' || ext === 'docx') return { text: 'W', bg: '#1565C0' }
    if (ext === 'xls' || ext === 'xlsx') return { text: 'X', bg: '#2E7D32' }
    if (ext === 'ppt' || ext === 'pptx') return { text: 'P', bg: '#D84315' }
    return { text: 'FILE', bg: '#546E7A' }
  }

  const getFileNameFromUrl = (url: string | null | undefined) => {
    if (!url) return ''
    try {
      const raw = decodeURIComponent(url.split('?')[0].split('#')[0].split('/').pop() || '')
      return raw.trim()
    } catch {
      return ''
    }
  }

  const getReplyPrefixIcon = (reply: ReplyMetadataResponse) => {
    if (reply.type === MessageType.IMAGE) return 'image-outline'
    if (reply.type === MessageType.FILE) return 'document-attach-outline'
    return null
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      const d = parseMessageDate(dateStr)
      if (!d) return ''
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

  const closeSheet = useCallback(
    (afterClose?: () => void) => {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(sheetTranslateY, { toValue: 400, duration: 200, useNativeDriver: true })
      ]).start(() => {
        setShowActions(false)
        if (typeof afterClose === 'function') {
          afterClose()
        }
      })
    },
    [overlayOpacity, sheetTranslateY]
  )

  useEffect(() => {
    if (showActions) {
      overlayOpacity.setValue(0)
      sheetTranslateY.setValue(400)
      emojiScale.setValue(0.8)
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          damping: 22,
          stiffness: 280,
          mass: 0.7,
          useNativeDriver: true
        }),
        Animated.spring(emojiScale, {
          toValue: 1,
          damping: 14,
          stiffness: 300,
          mass: 0.5,
          useNativeDriver: true
        })
      ]).start()
    }
  }, [showActions])

  const handleAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'reply':
          closeSheet(() => onReply?.(message))
          break
        case 'forward':
          closeSheet(() => onForward?.(message))
          break
        case 'revoke':
          closeSheet(() => {
            Alert.alert(
              t('message.actions.revoke', { defaultValue: 'Thu hoi' }),
              t('message.actions.revokeConfirm', { defaultValue: 'Thu hoi tin nhan nay?' }),
              [
                { text: t('message.actions.cancel', { defaultValue: 'Huy' }), style: 'cancel' },
                { text: 'OK', onPress: () => onRevoke?.(message.id), style: 'destructive' }
              ]
            )
          })
          break
        case 'delete':
          closeSheet(() => {
            Alert.alert(
              t('message.actions.delete', { defaultValue: 'Xoa o phia toi' }),
              t('message.actions.deleteConfirm', { defaultValue: 'Xoa tin nhan phia ban?' }),
              [
                { text: t('message.actions.cancel', { defaultValue: 'Huy' }), style: 'cancel' },
                { text: 'OK', onPress: () => onDeleteForMe?.(message.id), style: 'destructive' }
              ]
            )
          })
          break
        case 'copy':
          closeSheet(() => {
            if (message.content) Clipboard.setString(message.content)
          })
          break
        case 'info':
          if (onOpenMessageOptions) {
            closeSheet(() => onOpenMessageOptions())
            break
          }
          closeSheet(() => {
            Alert.alert(
              t('message.actions.comingSoonTitle', { defaultValue: 'Thong bao' }),
              t('message.actions.comingSoon', { defaultValue: 'Chuc nang dang duoc phat trien.' })
            )
          })
          break
        case 'pin':
        case 'reminder':
        case 'select':
        case 'quickMessage':
        case 'translate':
        case 'readText':
        case 'save':
          closeSheet(() => {
            Alert.alert(
              t('message.actions.comingSoonTitle', { defaultValue: 'Thong bao' }),
              t('message.actions.comingSoon', { defaultValue: 'Chuc nang dang duoc phat trien.' })
            )
          })
          break
      }
    },
    [closeSheet, message, onReply, onForward, onRevoke, onDeleteForMe, onOpenMessageOptions, t]
  )

  const actionRows = buildActionRows(isOwn, isDark, t)
  const deliveryStatusLabel = getDeliveryStatusLabel()
  const effectiveShowTime = showTime || showActions
  const incomingLeftSlotWidth = 44
  const businessCardPayload = parseBusinessCardContent(typeof message.content === 'string' ? message.content : null)
  const contentMaxWidth = !isRevoked && message.type === MessageType.FILE ? '88%' : '75%'

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        paddingHorizontal: 12,
        marginBottom: 4,
        alignItems: 'flex-end'
      }}
    >
      {!isOwn && (
        <View
          style={{
            width: incomingLeftSlotWidth,
            alignItems: 'flex-start',
            justifyContent: 'flex-end'
          }}
        >
          {showAvatar && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => message.senderId && onAvatarPress?.(message.senderId)}
              style={{ marginRight: 8 }}
            >
              <UserAvatar source={message.senderAvatar} name={message.senderName || ''} size='sm' />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ maxWidth: contentMaxWidth }}>
        {showSenderName && message.senderName && !isOwn && (
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2, marginLeft: 4 }}>
            {message.senderName}
          </Text>
        )}

        {/* Business card message */}
        {!isRevoked && !!businessCardPayload ? (
          <TouchableOpacity activeOpacity={0.8} onLongPress={openSheet} delayLongPress={300}>
            <BusinessCardMessage payload={businessCardPayload} onMessagePress={onAvatarPress} />
          </TouchableOpacity>
        ) :
        /* IMAGE messages - no bubble, direct images */
        !isRevoked && message.type === MessageType.IMAGE && message.attachments?.length ? (
          <TouchableOpacity activeOpacity={0.8} onLongPress={openSheet} delayLongPress={300}>
            <View>
              {message.attachments.length === 1 ? (
                <Image
                  source={{ uri: message.attachments[0].url }}
                  style={{ width: 220, height: 220, borderRadius: 12 }}
                  resizeMode='cover'
                />
              ) : message.attachments.length === 2 ? (
                <View style={{ flexDirection: 'row', gap: 2 }}>
                  {message.attachments.map((att, idx) => (
                    <Image
                      key={att.key || idx}
                      source={{ uri: att.url }}
                      style={{
                        width: 118,
                        height: 118,
                        borderTopLeftRadius: idx === 0 ? 12 : 0,
                        borderBottomLeftRadius: idx === 0 ? 12 : 0,
                        borderTopRightRadius: idx === 1 ? 12 : 0,
                        borderBottomRightRadius: idx === 1 ? 12 : 0
                      }}
                      resizeMode='cover'
                    />
                  ))}
                </View>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, maxWidth: 238 }}>
                  {message.attachments.slice(0, 4).map((att, idx) => (
                    <View key={att.key || idx} style={{ position: 'relative' }}>
                      <Image
                        source={{ uri: att.url }}
                        style={{ width: 118, height: 118, borderRadius: 4 }}
                        resizeMode='cover'
                      />
                      {idx === 3 && message.attachments!.length > 4 && (
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 4, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>+{message.attachments!.length - 4}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
              {message.content ? (
                <Text style={{ fontSize: 15, color: textColor, lineHeight: 21, marginTop: 4 }}>{message.content}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ) : !isRevoked && message.type === MessageType.FILE && message.attachments?.length ? (
          /* FILE messages - Zalo-style card */
          <TouchableOpacity activeOpacity={0.8} onLongPress={openSheet} delayLongPress={300}>
            <View
              style={{
                backgroundColor: isDark ? '#1E2732' : '#F3F8FF',
                borderRadius: 14,
                borderWidth: isDark ? 0 : 0.5,
                borderColor: '#D8E4F5',
                overflow: 'hidden',
                minWidth: 280,
                maxWidth: 320
              }}
            >
              {message.attachments.map((att, idx) => {
                const ext = (att.originalFileName || att.fileName || '').split('.').pop()?.toLowerCase() || ''
                const iconBg = ext === 'pdf' ? '#E53935' : ext === 'doc' || ext === 'docx' ? '#1565C0' : ext === 'xls' || ext === 'xlsx' ? '#2E7D32' : ext === 'ppt' || ext === 'pptx' ? '#D84315' : '#546E7A'
                const iconLetter = ext === 'pdf' ? 'PDF' : ext.startsWith('doc') ? 'W' : ext.startsWith('xls') ? 'X' : ext.startsWith('ppt') ? 'P' : ext.slice(0, 3).toUpperCase()
                const sizeStr = att.size ? (att.size < 1024 * 1024 ? `${(att.size / 1024).toFixed(2)} KB` : `${(att.size / (1024 * 1024)).toFixed(2)} MB`) : ''
                const fallbackKeyName = att.key?.split('/').pop() || ''
                const fallbackUrlName = getFileNameFromUrl(att.url)
                const defaultFileName = ext ? `Tệp ${ext.toUpperCase()}` : 'Tệp tin'
                const fileName =
                  att.originalFileName?.trim() ||
                  att.fileName?.trim() ||
                  (typeof message.content === 'string' ? message.content.trim() : '') ||
                  fallbackUrlName ||
                  fallbackKeyName ||
                  defaultFileName

                return (
                  <View key={att.key || idx}>
                    {idx > 0 && <View style={{ height: 0.5, backgroundColor: isDark ? '#333' : '#E5E7EB' }} />}
                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                      {/* File type icon */}
                      <View style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        backgroundColor: iconBg,
                        alignItems: 'center', justifyContent: 'center', marginRight: 10
                      }}>
                        <Text style={{ color: '#fff', fontSize: ext === 'pdf' ? 11 : 18, fontWeight: '700' }}>{iconLetter}</Text>
                      </View>
                      {/* File info */}
                      <View style={{ flex: 1, minWidth: 120, marginRight: 6 }}>
                        <Text
                          style={{ fontSize: 14, color: textColor, fontWeight: '500' }}
                          numberOfLines={1}
                          ellipsizeMode='middle'
                        >
                          {fileName}
                        </Text>
                        <Text style={{ fontSize: 12, color: isDark ? '#888' : '#9ca3af', marginTop: 2 }} numberOfLines={1}>
                          {sizeStr || '--'}
                        </Text>
                      </View>
                      {/* Action buttons */}
                      <View style={{ flexDirection: 'row', gap: 6, marginLeft: 6 }}>
                        <TouchableOpacity
                          onPress={() => att.url && Linking.openURL(att.url)}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            borderWidth: 0.8,
                            borderColor: isDark ? '#4B5563' : '#D1D5DB',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Ionicons name='open-outline' size={16} color={isDark ? '#888' : '#6B7280'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => att.url && Linking.openURL(att.url)}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            borderWidth: 0.8,
                            borderColor: isDark ? '#4B5563' : '#D1D5DB',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Ionicons name='download-outline' size={16} color={isDark ? '#888' : '#6B7280'} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          </TouchableOpacity>
        ) : (
          /* Text / revoked messages - standard bubble */
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
                borderColor: '#E5E7EB'
              }}
            >
              {message.replyTo && !isRevoked && (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => message.replyTo?.messageId && onReplyMessagePress?.(message.replyTo.messageId)}
                >
                <View
                  style={{
                    borderLeftWidth: 3,
                    borderLeftColor: '#0068FF',
                    backgroundColor: isOwn
                      ? isDark
                        ? 'rgba(0,0,0,0.15)'
                        : 'rgba(0,80,200,0.1)'
                      : isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.04)',
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    marginBottom: 6
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#0068FF' }} numberOfLines={1}>
                    {message.replyTo.senderName || 'User'}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    {!!getReplyImageUri(message.replyTo) ? (
                      <Image
                        source={{ uri: getReplyImageUri(message.replyTo)! }}
                        style={{ width: 22, height: 22, borderRadius: 4, marginRight: 6 }}
                        resizeMode='cover'
                      />
                    ) : message.replyTo.type === MessageType.FILE ? (
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          backgroundColor: getReplyFileBadge(message.replyTo)?.bg || '#546E7A',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 6
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
                          {getReplyFileBadge(message.replyTo)?.text || 'F'}
                        </Text>
                      </View>
                    ) : !!getReplyPrefixIcon(message.replyTo) ? (
                      <Ionicons
                        name={getReplyPrefixIcon(message.replyTo) as any}
                        size={13}
                        color={isDark ? '#aaa' : '#666'}
                        style={{ marginRight: 4 }}
                      />
                    ) : null}
                    <Text style={{ fontSize: 13, color: isDark ? '#aaa' : '#666', flex: 1 }} numberOfLines={2}>
                      {getReplyPreviewText(message.replyTo)}
                    </Text>
                  </View>
                </View>
                </TouchableOpacity>
              )}
              {isRevoked ? (
                <Text style={{ fontSize: 14, color: textColor, fontStyle: 'italic' }}>{t('message.messageRevoked')}</Text>
              ) : (
                <Text style={{ fontSize: 15, color: textColor, lineHeight: 21 }}>{typeof message.content === 'string' ? message.content : ''}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {(effectiveShowTime || !!deliveryStatusLabel) && (
          <View
            style={{
              flexDirection: 'row',
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              marginTop: 2,
              marginHorizontal: 4,
              gap: 6
            }}
          >
            {effectiveShowTime && <Text style={{ fontSize: 11, color: timeColor }}>{formatTime(message.createdAt)}</Text>}
            {!!deliveryStatusLabel && (
              <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '500' }}>{deliveryStatusLabel}</Text>
            )}
          </View>
        )}
      </View>

      {/* Zalo-style action modal */}
      <Modal visible={showActions} transparent statusBarTranslucent animationType='none' onRequestClose={closeSheet}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            opacity: overlayOpacity
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
                marginBottom: 8
              }}
            >
              <View
                style={{
                  backgroundColor: isOwn ? (isDark ? '#004BA0' : '#D5E9FF') : isDark ? '#2A2F36' : '#FFFFFF',
                  borderRadius: 16,
                  borderTopRightRadius: isOwn ? 4 : 16,
                  borderTopLeftRadius: isOwn ? 16 : 4,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4
                }}
              >
                <Text style={{ fontSize: 15, color: isDark ? '#E8EAED' : '#111827', lineHeight: 21 }}>
                  {message.content}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginTop: 2, marginHorizontal: 4, gap: 6 }}>
                <Text style={{ fontSize: 11, color: timeColor }}>{formatTime(message.createdAt)}</Text>
                {!!getDeliveryStatusLabel() && (
                  <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '500' }}>{getDeliveryStatusLabel()}</Text>
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
                transform: [{ scale: emojiScale }]
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
            transform: [{ translateY: sheetTranslateY }]
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
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: item.bgColor || (isDark ? '#2A3340' : '#F0F2F5'),
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 6
                      }}
                    >
                      <Ionicons name={item.icon as any} size={23} color={item.iconColor} />
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: item.textColor || (isDark ? '#B0B8C1' : '#4A4A4A'),
                        textAlign: 'center',
                        lineHeight: 16
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
  key: string
  icon: string
  label: string
  iconColor: string
  bgColor?: string
  textColor?: string
}

function buildActionRows(isOwn: boolean, isDark: boolean, t: (k: string, o?: any) => string): ActionItem[][] {
  const blue = '#0068FF'
  const orange = '#FF8C00'
  const red = '#EF4444'
  const gray = isDark ? '#8899A6' : '#65676B'

  // Row 1
  const row1: ActionItem[] = [
    {
      key: 'reply',
      icon: 'arrow-undo-outline',
      label: t('message.actions.reply', { defaultValue: 'Tr\u1EA3 l\u1EDDi' }),
      iconColor: blue
    },
    {
      key: 'forward',
      icon: 'arrow-redo-outline',
      label: t('message.actions.forward', { defaultValue: 'Chuy\u1EC3n ti\u1EBFp' }),
      iconColor: blue
    },
    {
      key: 'save',
      icon: 'folder-open-outline',
      label: t('message.actions.save', { defaultValue: 'L\u01b0u My Documents' }),
      iconColor: '#1EA7D8'
    },
    {
      key: 'revoke',
      icon: 'refresh-outline',
      label: t('message.actions.revoke', { defaultValue: 'Thu h\u1ED3i' }),
      iconColor: orange
    }
  ]

  // Row 2
  const row2: ActionItem[] = [
    {
      key: 'copy',
      icon: 'copy-outline',
      label: t('message.actions.copy', { defaultValue: 'Sao ch\u00E9p' }),
      iconColor: blue
    },
    { key: 'pin', icon: 'pin-outline', label: t('message.actions.pin', { defaultValue: 'Ghim' }), iconColor: orange },
    {
      key: 'reminder',
      icon: 'time-outline',
      label: t('message.actions.reminder', { defaultValue: 'Nh\u1EAFc h\u1EB9n' }),
      iconColor: '#BE123C'
    },
    {
      key: 'select',
      icon: 'checkbox-outline',
      label: t('message.actions.selectMultiple', { defaultValue: 'Ch\u1ECDn nhi\u1EC1u' }),
      iconColor: blue
    }
  ]

  // Row 3
  const row3: ActionItem[] = [
    {
      key: 'quickMessage',
      icon: 'flash-outline',
      label: t('message.actions.quickMessage', { defaultValue: 'T\u1EA1o tin nh\u1EAFn nhanh' }),
      iconColor: '#06B6D4'
    },
    {
      key: 'translate',
      icon: 'language-outline',
      label: t('message.actions.translate', { defaultValue: 'D\u1ECBch' }),
      iconColor: '#16A34A'
    },
    {
      key: 'readText',
      icon: 'volume-high-outline',
      label: t('message.actions.readText', { defaultValue: '\u0110\u1ECDc v\u0103n b\u1EA3n' }),
      iconColor: '#7C3AED'
    },
    {
      key: 'info',
      icon: 'information-circle-outline',
      label: t('message.actions.detail', { defaultValue: 'Chi ti\u1EBFt' }),
      iconColor: gray
    }
  ]

  // Row 4
  const row4: ActionItem[] = [
    {
      key: 'delete',
      icon: 'trash-outline',
      label: t('message.actions.delete', { defaultValue: 'X\u00F3a \u1EDF ph\u00EDa t\u00F4i' }),
      iconColor: red,
      bgColor: isDark ? '#3B1C1C' : '#FFE4E6',
      textColor: red
    }
  ]

  const safeRow1 = isOwn ? row1 : row1.filter((item) => item.key !== 'revoke')

  return [safeRow1, row2, row3, row4]
}
