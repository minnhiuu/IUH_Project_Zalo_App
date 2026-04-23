import React, { useState, useRef, useCallback } from 'react'
import { View, TouchableOpacity, Modal, Pressable, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { ReactionModal } from './reaction-modal'
import type { ConversationMemberResponse } from '../schemas'
import { useToggleReaction, useRemoveAllMyReactions } from '../queries/use-mutations'

export const EMOJIS = ['\u2764\uFE0F', '\uD83D\uDC4D', '\uD83D\uDE06', '\uD83D\uDE2E', '\uD83D\uDE22', '\uD83D\uDE21']

interface MessageReactionBarProps {
  messageId: string
  conversationId: string
  isOwn: boolean
  isDark: boolean
  isRevoked: boolean
  reactions: Record<string, string[]>
  members?: ConversationMemberResponse[] | null
  currentUserId: string
  currentUserName?: string
  currentUserAvatar?: string
}

export function MessageReactionBar({
  messageId,
  conversationId,
  isOwn,
  isDark,
  isRevoked,
  reactions,
  members,
  currentUserId,
  currentUserName,
  currentUserAvatar
}: MessageReactionBarProps) {
  const { mutate: toggleReactionMutate } = useToggleReaction()
  const { mutate: removeReactionsMutate } = useRemoveAllMyReactions()
  // selectedEmoji: emoji user chọn (giữ lại kể cả khi toggle off)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  // localActive: trạng thái on/off local (null = theo server)
  const [localActive, setLocalActive] = useState<boolean | null>(null)
  const [showEmojiBar, setShowEmojiBar] = useState(false)
  const [showReactionModal, setShowReactionModal] = useState(false)
  const emojiBarScale = useRef(new Animated.Value(0)).current

  const reactionEntries = Object.entries(reactions).filter(([, users]) => (users as string[]).length > 0)
  const myReaction = reactionEntries.find(([, users]) => (users as string[]).includes(currentUserId))?.[0]
  const hasReactionBadge = !isRevoked && reactionEntries.length > 0
  const reactionDisplayEmojis = [...new Set(reactionEntries.map(([emoji]) => emoji))].slice(0, 3)
  const totalReactionCount = reactionEntries.reduce((sum, [, users]) => sum + (users as string[]).length, 0)

  const showEmojiPickerBar = useCallback(() => {
    setShowEmojiBar(true)
    emojiBarScale.setValue(0.6)
    Animated.spring(emojiBarScale, {
      toValue: 1,
      damping: 14,
      stiffness: 300,
      mass: 0.5,
      useNativeDriver: true
    }).start()
  }, [emojiBarScale])

  const hideEmojiBar = useCallback(() => {
    Animated.timing(emojiBarScale, { toValue: 0, duration: 120, useNativeDriver: true }).start(() =>
      setShowEmojiBar(false)
    )
  }, [emojiBarScale])

  const handleRemoveReaction = useCallback(() => {
    if (!messageId || messageId.startsWith('temp-')) return
    setSelectedEmoji(null)
    setLocalActive(false)
    removeReactionsMutate({ messageId, conversationId, userId: currentUserId })
  }, [messageId, conversationId, currentUserId, removeReactionsMutate])

  const handleLikePress = useCallback(() => {
    if (!messageId || messageId.startsWith('temp-') || isRevoked) return
    const emoji = selectedEmoji ?? myReaction ?? '\u2764\uFE0F'
    setSelectedEmoji(emoji)
    setLocalActive(true)
    toggleReactionMutate({ messageId, emoji, conversationId, userId: currentUserId })
  }, [messageId, myReaction, selectedEmoji, conversationId, currentUserId, isRevoked, toggleReactionMutate])

  const handleEmojiSelectFromBar = useCallback(
    (emoji: string) => {
      if (!messageId || messageId.startsWith('temp-')) return
      setSelectedEmoji(emoji)
      setLocalActive(true)
      hideEmojiBar()
      toggleReactionMutate({ messageId, emoji, conversationId, userId: currentUserId })
    },
    [messageId, conversationId, currentUserId, hideEmojiBar, toggleReactionMutate]
  )

  if (isRevoked) return null

  return (
    <>
      {/* Like button + Reaction badge — absolute bottom-right of bubble */}
      <View
        style={{
          position: 'absolute',
          bottom: -3,
          right: 6,
          flexDirection: 'row-reverse',
          alignItems: 'center',
          zIndex: 10,
          gap: 4,
          
        }}
      >
        {/* Like button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleLikePress}
          onLongPress={showEmojiPickerBar}
          delayLongPress={250}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? '#2A3340' : '#FFFFFF',
            borderWidth: 1.5,
            borderColor: isDark ? '#3A4450' : '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2
          }}
        >
          {(localActive ?? !!myReaction) && (selectedEmoji ?? myReaction) ? (
            <Text style={{ fontSize: 15, lineHeight: 18 }}>{selectedEmoji ?? myReaction}</Text>
          ) : (
            <Ionicons name='heart-outline' size={14} color={isDark ? '#8899A6' : '#6B7280'} />
          )}
        </TouchableOpacity>

        {/* Reaction badge */}
        {hasReactionBadge && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowReactionModal(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: 'rgba(148,163,184,0.25)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.12,
              shadowRadius: 2,
              elevation: 2
            }}
          >
            {reactionDisplayEmojis.map((emoji) => (
              <Text key={emoji} style={{ fontSize: 14, lineHeight: 16 }}>
                {emoji}
              </Text>
            ))}
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginLeft: 2 }}>
              {totalReactionCount}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Reaction detail modal */}
      <ReactionModal
        visible={showReactionModal}
        onClose={() => setShowReactionModal(false)}
        reactions={reactions}
        members={members}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
      />

      {/* Quick emoji bar modal */}
      <Modal visible={showEmojiBar} transparent statusBarTranslucent animationType='none' onRequestClose={hideEmojiBar}>
        <Pressable style={{ flex: 1 }} onPress={hideEmojiBar}>
          <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 110, paddingHorizontal: 20 }}>
            <Animated.View
              style={{
                alignSelf: isOwn ? 'flex-end' : 'flex-start',
                flexDirection: 'row',
                backgroundColor: isDark ? '#1E2732' : '#FFFFFF',
                borderRadius: 28,
                paddingHorizontal: 10,
                paddingVertical: 8,
                gap: 4,
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 10,
                transform: [{ scale: emojiBarScale }]
              }}
            >
              {EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => handleEmojiSelectFromBar(emoji)}
                  activeOpacity={0.7}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      (selectedEmoji ?? myReaction) === emoji && (localActive ?? !!myReaction)
                        ? isDark
                          ? 'rgba(0,104,255,0.25)'
                          : 'rgba(0,104,255,0.12)'
                        : 'transparent'
                  }}
                >
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
              {(localActive ?? !!myReaction) && (selectedEmoji ?? myReaction) && (
                <TouchableOpacity
                  onPress={() => {
                    hideEmojiBar()
                    handleRemoveReaction()
                  }}
                  activeOpacity={0.7}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? '#3B1C1C' : '#FEE2E2',
                    alignSelf: 'center',
                    marginLeft: 2
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#DC2626', fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        </Pressable>
      </Modal>
    </>
  )
}
