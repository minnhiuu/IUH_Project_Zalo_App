import { Ionicons } from '@expo/vector-icons'
import { View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Header } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { useState } from 'react'
import { NotificationPanel, useNotificationStateQuery } from '@/features/notifications'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { useAuthStore } from '@/store'
import { ConversationListItem } from '@/features/message/components'
import { ConversationListSkeleton } from '@/features/message/components'
import { useConversations } from '@/features/message/queries'
import type { ConversationResponse } from '@/features/message/schemas'

export default function MessagesScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const [notificationVisible, setNotificationVisible] = useState(false)
  const { data: notificationState } = useNotificationStateQuery()
  const currentUserId = useAuthStore((s) => s.user?.id)

  const { data: conversations = [], isLoading } = useConversations()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <Header
        showSearch
        searchPlaceholder={t('messages.search')}
        showQRButton
        onQRPress={() => router.push('/qr' as any)}
        showAddButton
        showBellButton
        bellUnreadCount={notificationState?.unreadCount ?? 0}
        onBellPress={() => setNotificationVisible(true)}
      />

      <NotificationPanel visible={notificationVisible} onClose={() => setNotificationVisible(false)} />

      {/* Conversations List */}
      {isLoading ? (
        <ConversationListSkeleton />
      ) : conversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.iconMuted} />
          <Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 16, textAlign: 'center' }}>
            {t('message.empty.conversations')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationListItem
              conversation={item}
              onPress={() => {
                const partnerMember = item.members?.find((m) => m.userId !== currentUserId)
                router.push({
                  pathname: '/chat/[id]' as any,
                  params: {
                    id: item.id,
                    conversationId: item.id,
                    userId: partnerMember?.userId || '',
                    name: item.name || '',
                    avatar: item.avatar || '',
                  },
                })
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}
