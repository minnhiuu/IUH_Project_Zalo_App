import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, TouchableOpacity, Alert, Clipboard, Modal, Pressable, Animated, ScrollView } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { MessageStatus, MessageType, type MessageResponse, type ConversationMemberResponse } from '../schemas'
import { useAuthStore } from '@/store'
import { useToggleReaction, useRemoveAllMyReactions } from '../queries/use-mutations'
import { normalizeDateTime } from '../utils/date-utils'
import { FileBadge } from './file-badge'
import { MessageMediaContent } from './media-content'
import { MessageReactionBar, EMOJIS } from './message-reaction-bar'
import { useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { messageKeys } from '../queries/keys'

interface MessageBubbleProps {
  message: MessageResponse
  isOwn: boolean
  isLatestOwnMessage?: boolean
  showTime?: boolean
  showAvatar?: boolean
  showSenderName?: boolean
  members?: ConversationMemberResponse[] | null
  onAvatarPress?: (userId: string) => void
  onReply?: (message: MessageResponse) => void
  onRevoke?: (messageId: string) => void
  onDeleteForMe?: (messageId: string) => void
  onForward?: (message: MessageResponse) => void
  onOpenMessageOptions?: () => void
  onScrollToMessage?: (messageId: string) => void
  isHighlighted?: boolean
}

export function MessageBubble({
  message,
  isOwn,
  isLatestOwnMessage = false,
  showTime = true,
  showAvatar = true,
  showSenderName = false,
  members,
  onAvatarPress,
  onReply,
  onRevoke,
  onDeleteForMe,
  onForward,
  onOpenMessageOptions,
  onScrollToMessage,
  isHighlighted = false
}: MessageBubbleProps) {
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'
  const [showActions, setShowActions] = useState(false)
  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser?.id || ''
  const { mutate: toggleReactionMutate } = useToggleReaction()
  const { mutate: removeReactionsMutate } = useRemoveAllMyReactions()
  const queryClient = useQueryClient()

  // Highlight animation
  const highlightAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (isHighlighted) {
      Animated.sequence([
        Animated.timing(highlightAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.delay(700),
        Animated.timing(highlightAnim, { toValue: 0, duration: 400, useNativeDriver: false })
      ]).start()
    }
  }, [isHighlighted])

  const getReplyAttachmentUrl = (replyMessageId: string): string | null => {
    const conversationId = message.conversationId
    if (!conversationId) return null
    const cached = queryClient.getQueryData<InfiniteData<any>>(messageKeys.messages(conversationId))
    if (!cached) return null
    for (const page of cached.pages) {
      const found = (page.data ?? page.content ?? []).find((m: MessageResponse) => m.id === replyMessageId)
      if (found) return found.attachments?.[0]?.url ?? null
    }
    return null
  }

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

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      const normalized = normalizeDateTime(dateStr)
      if (!normalized) return ''
      const d = new Date(normalized)
      if (Number.isNaN(d.getTime())) return ''
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

  const handleEmojiReaction = useCallback(
    (emoji: string) => {
      if (!message.id || message.id.startsWith('temp-')) return
      closeSheet(() => {
        toggleReactionMutate({
          messageId: message.id,
          emoji,
          conversationId: message.conversationId || '',
          userId: currentUserId
        })
      })
    },
    [message, currentUserId, closeSheet, toggleReactionMutate]
  )

  const handleRemoveReaction = useCallback(() => {
    if (!message.id || message.id.startsWith('temp-')) return
    removeReactionsMutate({
      messageId: message.id,
      conversationId: message.conversationId || '',
      userId: currentUserId
    })
  }, [message, currentUserId, removeReactionsMutate])

  const renderBubbleContent = () => {
    if (isRevoked) {
      return (
        <Text style={{ fontSize: 14, color: textColor, fontStyle: 'italic' }}>
          {t('message.messageRevoked')}
        </Text>
      )
    }

    if ((message.type === MessageType.IMAGE || message.type === MessageType.VIDEO) && message.attachments?.length) {
      const MEDIA_PLACEHOLDERS = ['[Hình ảnh]', '[Image]', '[Video]', '[IMAGE]', '[VIDEO]']
      const caption = message.content && !MEDIA_PLACEHOLDERS.includes(message.content) ? message.content : null
      if (caption) {
        return (
          <View>
            <MessageMediaContent attachments={message.attachments} onLongPress={openSheet} />
            <Text style={{ fontSize: 15, color: textColor, lineHeight: 21, paddingHorizontal: 12, paddingVertical: 10 }}>
              {caption}
            </Text>
          </View>
        )
      }
      return <MessageMediaContent attachments={message.attachments} onLongPress={openSheet} />
    }

    if (message.type === MessageType.FILE && message.attachments?.length) {
      const attachmentNames = message.attachments.map((att) => att.originalFileName || att.fileName).filter(Boolean)
      const shouldRenderContent =
        !!message.content &&
        message.content !== '[Tệp tin]' &&
        message.content !== '[File]' &&
        !attachmentNames.includes(message.content)

      return (
        <View style={{ gap: 4 }}>
          {message.attachments.map((att, i) => (
            <FileBadge key={i} attachment={att} isDark={isDark} />
          ))}
          {shouldRenderContent && (
              <Text style={{ fontSize: 15, color: textColor, lineHeight: 21 }}>
                {message.content}
              </Text>
            )}
        </View>
      )
    }

    return (
      <Text style={{ fontSize: 15, color: textColor, lineHeight: 21 }}>
        {message.content}
      </Text>
    )
  }

  const reactions = message.reactions || {}
  const reactionEntries = Object.entries(reactions).filter(([, users]) => (users as string[]).length > 0)
  const myReaction = Object.entries(reactions).find(([, users]) => (users as string[]).includes(currentUserId))?.[0]
  const MEDIA_PLACEHOLDERS = ['[Hình ảnh]', '[Image]', '[Video]', '[IMAGE]', '[VIDEO]']

  const hasMediaContent =
    !isRevoked &&
    (message.type === MessageType.IMAGE || message.type === MessageType.VIDEO) &&
    !!message.attachments?.length

  const hasRealCaption =
    hasMediaContent &&
    !!message.content &&
    !MEDIA_PLACEHOLDERS.includes(message.content)

  const mediaBubbleBg = hasRealCaption ? bubbleBg : 'transparent'

  const actionRows = buildActionRows(isOwn, isDark, t)
  const deliveryStatusLabel = getDeliveryStatusLabel()
  const incomingLeftSlotWidth = 44

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        paddingHorizontal: 12,
        marginBottom: 4,
        alignItems: 'flex-start'
      }}
    >
      {!isOwn && (
        <View
          style={{
            width: incomingLeftSlotWidth,
            alignItems: 'flex-start',
            justifyContent: 'flex-start'
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

      <View style={{ maxWidth: '70%' }}>
        {showSenderName && message.senderName && !isOwn && (
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 2, marginLeft: 4 }}>
            {message.senderName}
          </Text>
        )}

          <View style={{ alignSelf: isOwn ? 'flex-end' : 'flex-start', minWidth: '55%', paddingBottom: 14 }}>
            <Animated.View style={{
              borderRadius: 16,
              backgroundColor: highlightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['transparent', 'rgba(0,104,255,0.18)']
              })
            }}>
            <TouchableOpacity activeOpacity={0.8} onLongPress={openSheet} delayLongPress={300}>
              <View
                style={{
                  backgroundColor: hasMediaContent ? mediaBubbleBg : bubbleBg,
                  borderRadius: 16,
                  borderTopRightRadius: isOwn ? 4 : 16,
                  borderTopLeftRadius: isOwn ? 16 : 4,
                  paddingHorizontal: (hasMediaContent && !hasRealCaption) ? 0 : hasMediaContent ? 0 : 12,
                  paddingVertical: hasMediaContent ? 0 : 10,
                  borderWidth: (!isOwn && !isDark && !isRevoked && !(hasMediaContent && !hasRealCaption)) ? 0.5 : 0,
                  borderColor: '#E5E7EB',
                  overflow: hasMediaContent ? 'hidden' : 'visible'
                }}
              >
                {message.replyTo && !isRevoked && (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => onScrollToMessage?.(message.replyTo!.messageId)}
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
                      marginBottom: 6,
                      marginHorizontal: hasMediaContent ? 6 : 0,
                      marginTop: hasMediaContent ? 4 : 0,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    {(message.replyTo.type === 'IMAGE' || message.replyTo.type === 'VIDEO') ? (() => {
                      const replyImgUrl = getReplyAttachmentUrl(message.replyTo.messageId)
                      return replyImgUrl ? (
                        <View style={{ width: 40, height: 40, borderRadius: 5, overflow: 'hidden', backgroundColor: '#111', flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
                          <ExpoImage
                            source={{ uri: replyImgUrl }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit='cover'
                            cachePolicy='memory-disk'
                          />
                          {message.replyTo.type === 'VIDEO' && (
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                              <Ionicons name='play-circle' size={20} color='rgba(255,255,255,0.9)' />
                            </View>
                          )}
                        </View>
                      ) : null
                    })() : null}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#0068FF' }} numberOfLines={1}>
                        {message.replyTo.senderName || 'User'}
                      </Text>
                      <Text style={{ fontSize: 13, color: isDark ? '#aaa' : '#666' }} numberOfLines={2}>
                        {message.replyTo.type === 'IMAGE' ? '📷 Hình ảnh' : message.replyTo.type === 'VIDEO' ? '🎬 Video' : message.replyTo.content}
                      </Text>
                    </View>
                  </View>
                  </TouchableOpacity>
                )}
                {renderBubbleContent()}
              </View>
            </TouchableOpacity>
            </Animated.View>

            <MessageReactionBar
              messageId={message.id}
              conversationId={message.conversationId || ''}
              isOwn={isOwn}
              isDark={isDark}
              isRevoked={isRevoked}
              reactions={reactions}
              members={members}
              currentUserId={currentUserId}
              currentUserName={currentUser?.fullName}
              currentUserAvatar={currentUser?.avatar ?? undefined}
            />
          </View>

        {(showTime || !!deliveryStatusLabel) && (
          <View
            style={{
              flexDirection: 'row',
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              marginTop: 2,
              marginHorizontal: 4,
              gap: 6
            }}
          >
            {showTime && <Text style={{ fontSize: 11, color: timeColor }}>{formatTime(message.createdAt)}</Text>}
            {!!deliveryStatusLabel && (
              <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '500' }}>{deliveryStatusLabel}</Text>
            )}
          </View>
        )}

      </View>

      {/* Zalo-style action modal */}
      <Modal visible={showActions} transparent statusBarTranslucent animationType='none' onRequestClose={() => closeSheet()}>
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

        <Pressable style={{ flex: 1 }} onPress={() => closeSheet()}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            {/* Selected message preview */}
            {!hasMediaContent && (
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
                  overflow: 'hidden',
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4
                }}
              >
                <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={{ fontSize: 15, color: isDark ? '#E8EAED' : '#111827', lineHeight: 21 }}>
                    {message.content}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignSelf: 'flex-end', marginTop: 2, marginHorizontal: 4, gap: 6 }}>
                <Text style={{ fontSize: 11, color: timeColor }}>{formatTime(message.createdAt)}</Text>
                {!!getDeliveryStatusLabel() && (
                  <Text style={{ fontSize: 11, color: '#2563EB', fontWeight: '500' }}>{getDeliveryStatusLabel()}</Text>
                )}
              </View>
            </View>
            )}

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
                  onPress={() => handleEmojiReaction(emoji)}
                  activeOpacity={0.7}
                  style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
              {!!myReaction && (
                <TouchableOpacity
                  onPress={handleRemoveReaction}
                  activeOpacity={0.7}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? '#3B1C1C' : '#FEE2E2',
                    marginLeft: 4,
                    alignSelf: 'center'
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#DC2626', fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              )}
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
