import React, { useMemo, useRef } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'

import { HEADER } from '@/constants/theme'
import { useTheme } from '@/context'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useConversations, useTransferOwner } from '@/features/message/queries'
import { useAuthStore } from '@/store'

export default function TransferOwnerScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isDark } = useTheme()
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>()
  const currentUserId = useAuthStore((s) => s.user?.id)

  const { data: conversations = [] } = useConversations(0, 100, true)
  const conversation = conversations.find((c) => c.id === conversationId)
  const { mutate: transferOwner } = useTransferOwner()

  const waitingSecondTapRef = useRef<string | null>(null)
  const waitingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const candidates = useMemo(
    () => (conversation?.members || []).filter((m) => m.userId !== currentUserId),
    [conversation?.members, currentUserId]
  )

  const confirmTransfer = (targetUserId: string) => {
    if (!conversationId) return
    transferOwner(
      { conversationId, targetUserId },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: t('message.groupMembers.transferOwnerDone', { defaultValue: 'Đã chuyển quyền trưởng nhóm' }) })
          router.back()
        }
      }
    )
  }

  const onPressMember = (userId: string) => {
    if (candidates.length !== 1) {
      confirmTransfer(userId)
      return
    }

    if (waitingSecondTapRef.current === userId) {
      waitingSecondTapRef.current = null
      if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current)
      confirmTransfer(userId)
      return
    }

    waitingSecondTapRef.current = userId
    if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current)
    waitingTimeoutRef.current = setTimeout(() => {
      waitingSecondTapRef.current = null
      waitingTimeoutRef.current = null
    }, 3200)

    Toast.show({
      type: 'info',
      text1: t('message.groupMembers.transferOwnerToastTitle', { defaultValue: 'Xác nhận chuyển quyền' }),
      text2: t('message.groupMembers.transferOwnerToastBody', {
        defaultValue: 'Nhấn lại lần nữa để OK chuyển quyền trưởng nhóm'
      })
    })
  }

  const palette = isDark
    ? {
        bg: '#181B20',
        card: '#1F252E',
        rowDivider: 'rgba(255,255,255,0.08)',
        text: '#ECF1F9'
      }
    : {
        bg: '#ECEDEE',
        card: '#FFFFFF',
        rowDivider: '#EEF0F2',
        text: '#1A1F2A'
      }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <LinearGradient colors={isDark ? HEADER.gradientColorsDark : HEADER.gradientColors}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 10 }}>
              <Ionicons name='chevron-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('message.groupMembers.selectNewOwner', { defaultValue: 'Chọn trưởng nhóm mới' })}</Text>
            <Ionicons name='search-outline' size={24} color='#fff' />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={candidates}
        keyExtractor={(item) => item.userId}
        style={{ backgroundColor: palette.card }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPressMember(item.userId)}
            style={[styles.memberRow, { borderBottomColor: palette.rowDivider }]}
          >
            <UserAvatar source={item.avatar || undefined} name={item.fullName} size='xl' />
            <Text style={{ marginLeft: 12, fontSize: 20 / 1.2, color: palette.text }}>{item.fullName}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ paddingVertical: 30, alignItems: 'center' }}>
            <Text style={{ color: '#7B8794' }}>{t('message.groupSettings.noTransferCandidate')}</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  headerRow: {
    height: HEADER.height,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  memberRow: {
    minHeight: 92,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth
  }
})
