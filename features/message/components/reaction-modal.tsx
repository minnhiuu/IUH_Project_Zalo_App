import React, { useState } from 'react'
import { Modal, View, Pressable, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'

import { UserAvatar } from '@/components/common/user-avatar'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useTranslation } from 'react-i18next'
import type { ConversationMemberResponse } from '../schemas'

interface ReactionModalProps {
  visible: boolean
  onClose: () => void
  reactions: Record<string, string[]>
  members?: ConversationMemberResponse[] | null
  currentUserId?: string
  currentUserName?: string | null
  currentUserAvatar?: string | null
}

export function ReactionModal({
  visible,
  onClose,
  reactions,
  members,
  currentUserId,
  currentUserName,
  currentUserAvatar
}: ReactionModalProps) {
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)

  const memberMap = new Map((members || []).map((m) => [m.userId, m]))

  // Build userId → Map<emoji, count>
  const userReactionMap = new Map<string, Map<string, number>>()
  for (const [emoji, userIds] of Object.entries(reactions)) {
    for (const uid of userIds) {
      if (!userReactionMap.has(uid)) userReactionMap.set(uid, new Map())
      const emojiMap = userReactionMap.get(uid)!
      emojiMap.set(emoji, (emojiMap.get(emoji) || 0) + 1)
    }
  }

  const totalCount = Object.values(reactions).reduce((s, ids) => s + ids.length, 0)

  const filteredUsers: Array<{ userId: string; emojiCounts: [string, number][]; userTotal: number }> = []
  if (selectedEmoji === null) {
    for (const [uid, emojiCountMap] of userReactionMap.entries()) {
      const userTotal = [...emojiCountMap.values()].reduce((s, c) => s + c, 0)
      filteredUsers.push({ userId: uid, emojiCounts: [...emojiCountMap.entries()], userTotal })
    }
  } else {
    const uniqueUids = [...new Set(reactions[selectedEmoji] || [])]
    for (const uid of uniqueUids) {
      const count = userReactionMap.get(uid)?.get(selectedEmoji) || 0
      filteredUsers.push({ userId: uid, emojiCounts: [[selectedEmoji, count]], userTotal: count })
    }
  }

  // Dynamic body height: 64px per user row + 46px per emoji tab (left col), capped at 400
  const leftColHeight = (1 + Object.keys(reactions).length) * 46
  const rightColHeight = userReactionMap.size * 64
  const bodyHeight = Math.min(Math.max(leftColHeight, rightColHeight) + 8, 400)

  const bgCard = isDark ? '#1E2732' : '#FFFFFF'
  const bgHeader = isDark ? '#252D38' : '#F9FAFB'
  const borderColor = isDark ? '#2A3340' : '#E5E7EB'
  const textPrimary = isDark ? '#E8EAED' : '#111827'
  const textSecondary = isDark ? '#8899A6' : '#6B7280'

  return (
    <Modal visible={visible} transparent animationType='slide' onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        {/* Backdrop */}
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

        {/* Card — bottom sheet */}
        <View
          style={{
            backgroundColor: bgCard,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
            maxHeight: 520,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 12
          }}
        >
          {/* Drag handle */}
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }} />
          </View>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: bgHeader,
              borderBottomWidth: 0.5,
              borderBottomColor: borderColor
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: textPrimary }}>{t('reaction.title', 'Biểu cảm')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name='close' size={20} color={textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={{ flexDirection: 'row', height: bodyHeight }}>
            {/* Left: emoji filter tabs */}
            <View style={{ width: 80, borderRightWidth: 0.5, borderRightColor: borderColor }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* "Tất cả" tab */}
                <TouchableOpacity
                  onPress={() => setSelectedEmoji(null)}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 12,
                    backgroundColor: selectedEmoji === null ? (isDark ? '#1A3A5C' : '#EFF6FF') : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: selectedEmoji === null ? '#2563EB' : textSecondary
                    }}
                  >
                    {t('reaction.all', 'Tất cả')}
                  </Text>
                  <Text style={{ fontSize: 11, color: textSecondary }}>{totalCount}</Text>
                </TouchableOpacity>

                {/* Emoji tabs */}
                {Object.entries(reactions).map(([emoji, userIds]) => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setSelectedEmoji(emoji)}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 10,
                      backgroundColor:
                        selectedEmoji === emoji ? (isDark ? '#1A3A5C' : '#EFF6FF') : 'transparent',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{emoji}</Text>
                    <Text style={{ fontSize: 11, color: textSecondary }}>{userIds.length}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Right: user list */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 4 }}>
              {filteredUsers.length === 0 ? (
                <View style={{ padding: 32, alignItems: 'center' }}>
                  <Text style={{ color: textSecondary, fontSize: 13 }}>{t('reaction.empty', 'Không có ai')}</Text>
                </View>
              ) : (
                filteredUsers.map((item) => {
                  const member = memberMap.get(item.userId)
                  const isMe = item.userId === currentUserId
                  const name = isMe
                    ? currentUserName || member?.fullName || item.userId
                    : member?.fullName || item.userId
                  const avatar = isMe
                    ? currentUserAvatar || member?.avatar || null
                    : member?.avatar || null

                  return (
                    <View
                      key={item.userId}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        gap: 10
                      }}
                    >
                      <UserAvatar source={avatar} name={name} size='sm' />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{ fontSize: 14, fontWeight: '500', color: textPrimary }}
                          numberOfLines={1}
                        >
                          {name}
                          {isMe && (
                            <Text style={{ color: textSecondary, fontWeight: '400', fontSize: 13 }}>
                              {' '}{t('reaction.me', '(Bạn)')}
                            </Text>
                          )}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        {item.emojiCounts.map(([e, count]) => (
                          <View key={e} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 18 }}>{e}</Text>
                            {selectedEmoji !== null && count > 1 && (
                              <Text style={{ fontSize: 11, color: textSecondary, marginLeft: 1 }}>
                                {count}
                              </Text>
                            )}
                          </View>
                        ))}
                        {selectedEmoji === null && item.userTotal > 1 && (
                          <Text style={{ fontSize: 11, color: textSecondary, marginLeft: 2 }}>
                            {item.userTotal}
                          </Text>
                        )}
                      </View>
                    </View>
                  )
                })
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  )
}
