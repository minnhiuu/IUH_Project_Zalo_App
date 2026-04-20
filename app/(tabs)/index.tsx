import { Ionicons } from '@expo/vector-icons'
import { View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { ActionSheet, ConfirmDialog, Header, type ActionSheetOption } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { useState } from 'react'
import { NotificationPanel, useNotificationStateQuery } from '@/features/notifications'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { useAuthStore } from '@/store'
import { ConversationListItem } from '@/features/message/components'
import { ConversationListSkeleton } from '@/features/message/components'
import { QuickCreateMenu, type QuickCreateMenuAction } from '@/features/message/components/group'
import { useClearConversationHistory, useConversations, useDeleteConversation } from '@/features/message/queries'
import type { ConversationResponse } from '@/features/message/schemas'
import Toast from 'react-native-toast-message'

export default function MessagesScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const [notificationVisible, setNotificationVisible] = useState(false)
  const { data: notificationState } = useNotificationStateQuery()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [selectedConversation, setSelectedConversation] = useState<ConversationResponse | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { mutate: clearConversationHistory } = useClearConversationHistory()
  const { mutate: deleteConversation } = useDeleteConversation()

  const { data: conversations = [], isLoading } = useConversations()

  const options: ActionSheetOption[] = [
    {
      icon: 'trash-outline',
      label: t('message.conversationOptions.clearHistory'),
      onPress: () => setShowClearConfirm(true),
      iconColor: '#EF4444',
      color: '#EF4444'
    },
    {
      icon: 'close-circle-outline',
      label: t('message.conversationOptions.deleteConversation'),
      onPress: () => setShowDeleteConfirm(true),
      iconColor: '#EF4444',
      color: '#EF4444'
    }
  ]

  const quickActions: QuickCreateMenuAction[] = [
    {
      id: 'add-friend',
      icon: 'person-add-outline',
      label: t('message.quickCreate.addFriend'),
      onPress: () => router.push('/add-friend' as any)
    },
    {
      id: 'create-group',
      icon: 'people-outline',
      label: t('message.quickCreate.createGroup'),
      onPress: () => router.push('/group/create' as any)
    },
    {
      id: 'my-documents',
      icon: 'folder-open-outline',
      label: t('message.quickCreate.myDocuments'),
      onPress: () => Toast.show({ type: 'info', text1: t('message.quickCreate.comingSoon') })
    },
    {
      id: 'calendar',
      icon: 'calendar-outline',
      label: t('message.quickCreate.calendar'),
      onPress: () => Toast.show({ type: 'info', text1: t('message.quickCreate.comingSoon') })
    },
    {
      id: 'group-call',
      icon: 'videocam-outline',
      label: t('message.quickCreate.groupCall'),
      onPress: () => Toast.show({ type: 'info', text1: t('message.quickCreate.comingSoon') })
    },
    {
      id: 'devices',
      icon: 'desktop-outline',
      label: t('message.quickCreate.loginDevices'),
      onPress: () => Toast.show({ type: 'info', text1: t('message.quickCreate.comingSoon') })
    }
  ]

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <Header
        showSearch
        searchPlaceholder={t('messages.search')}
        showQRButton
        onQRPress={() => router.push('/qr' as any)}
        showAddButton
        onAddPress={() => setShowQuickMenu(true)}
        showBellButton
        bellUnreadCount={notificationState?.unreadCount ?? 0}
        onBellPress={() => setNotificationVisible(true)}
      />

      <QuickCreateMenu visible={showQuickMenu} onClose={() => setShowQuickMenu(false)} actions={quickActions} />

      <NotificationPanel visible={notificationVisible} onClose={() => setNotificationVisible(false)} />

      {/* Conversations List */}
      {isLoading ? (
        <ConversationListSkeleton />
      ) : conversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Ionicons name='chatbubbles-outline' size={64} color={colors.iconMuted} />
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
                    avatar: item.avatar || ''
                  }
                })
              }}
              onLongPress={() => {
                setSelectedConversation(item)
                setShowOptions(true)
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ActionSheet
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        options={options}
        title={t('message.conversationOptions.title')}
        isDark={colorScheme === 'dark'}
      />

      <ConfirmDialog
        visible={showClearConfirm}
        title={t('message.conversationOptions.clearHistoryTitle')}
        message={t('message.conversationOptions.clearHistoryMessage')}
        confirmText={t('message.conversationOptions.confirm')}
        cancelText={t('message.conversationOptions.cancel')}
        destructive
        onCancel={() => setShowClearConfirm(false)}
        onConfirm={() => {
          if (!selectedConversation) return
          clearConversationHistory(selectedConversation.id)
          setShowClearConfirm(false)
          setSelectedConversation(null)
        }}
      />

      <ConfirmDialog
        visible={showDeleteConfirm}
        title={t('message.conversationOptions.deleteConversationTitle')}
        message={t('message.conversationOptions.deleteConversationMessage')}
        confirmText={t('message.conversationOptions.confirm')}
        cancelText={t('message.conversationOptions.cancel')}
        destructive
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (!selectedConversation) return
          deleteConversation(selectedConversation.id)
          setShowDeleteConfirm(false)
          setSelectedConversation(null)
        }}
      />
    </View>
  )
}
