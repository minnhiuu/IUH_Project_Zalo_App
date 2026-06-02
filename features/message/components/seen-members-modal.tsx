import React from 'react'
import { Modal, View, Pressable, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'

import { UserAvatar } from '@/components/common/user-avatar'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useTranslation } from 'react-i18next'
import type { ConversationMemberResponse } from '../schemas'

interface SeenMembersModalProps {
  visible: boolean
  onClose: () => void
  members: ConversationMemberResponse[]
  currentUserId?: string
}

export function SeenMembersModal({
  visible,
  onClose,
  members,
  currentUserId
}: SeenMembersModalProps) {
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'

  const bgCard = isDark ? '#1E2732' : '#FFFFFF'
  const bgHeader = isDark ? '#252D38' : '#F9FAFB'
  const borderColor = isDark ? '#2A3340' : '#E5E7EB'
  const textPrimary = isDark ? '#E8EAED' : '#111827'
  const textSecondary = isDark ? '#8899A6' : '#6B7280'

  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
        {/* Backdrop */}
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

        {/* Card */}
        <View
          style={{
            backgroundColor: bgCard,
            borderRadius: 12,
            width: '85%',
            maxWidth: 340,
            overflow: 'hidden',
            maxHeight: 400,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderBottomWidth: 0.5,
              borderBottomColor: borderColor
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: textPrimary }}>
              {t('message.info.seenBy', { count: members.length, defaultValue: `Đã xem (${members.length})` })}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name='close' size={22} color={textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={{ paddingVertical: 8 }} showsVerticalScrollIndicator={false}>
            {members.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: textSecondary, fontSize: 14 }}>
                  {t('message.info.noOneSeen', { defaultValue: 'Chưa có ai xem' })}
                </Text>
              </View>
            ) : (
              members.map((member) => {
                const isMe = member.userId === currentUserId
                return (
                  <View
                    key={member.userId}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      gap: 12
                    }}
                  >
                    <UserAvatar source={member.avatar} name={member.fullName || 'User'} size='sm' />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ fontSize: 15, fontWeight: '500', color: textPrimary }}
                        numberOfLines={1}
                      >
                        {member.fullName || member.userId}
                        {isMe && (
                          <Text style={{ color: textSecondary, fontWeight: '400', fontSize: 14 }}>
                            {' '}{t('reaction.me', '(Bạn)')}
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>
                )
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
