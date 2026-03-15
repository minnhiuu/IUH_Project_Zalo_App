import { Ionicons } from '@expo/vector-icons'
import { View, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Header } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { useState } from 'react'
import { NotificationPanel, useNotificationStateQuery } from '@/features/notifications'

interface Conversation {
  id: string
  name: string
  avatar: string
  lastMessage: string
  time: string
  unread?: number
  isGroup?: boolean
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Đào Linh',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Bạn: ma m lam gi v',
    time: '46 giây'
  },
  {
    id: '2',
    name: 'Nguyễn Duyên',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Bạn hong làm',
    time: '49 phút'
  },
  {
    id: '3',
    name: 'CMM - 6',
    avatar: 'https://i.pravatar.cc/150?img=10',
    lastMessage: 'Dương Hoàng Huy: @Nguyễn Huỳnh...',
    time: '58 phút',
    isGroup: true
  },
  {
    id: '4',
    name: 'Nguyễn Đức Hùng',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Bạn: qua loa lắm..',
    time: '1 giờ'
  },
  {
    id: '5',
    name: 'Trần Ngọc Huyền',
    avatar: 'https://i.pravatar.cc/150?img=4',
    lastMessage: 'Bạn: mượn gmail',
    time: '1 giờ'
  },
  {
    id: '6',
    name: 'Phạm Minh Châu',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: 'Trong video record cô có nói sơ, mà...',
    time: '1 giờ'
  },
  {
    id: '7',
    name: 'Media Box',
    avatar: 'https://i.pravatar.cc/150?img=8',
    lastMessage: 'Zalo Video: TPHCM: Đường hoa...',
    time: '3 giờ',
    unread: 1
  },
  {
    id: '8',
    name: '12CB1 2021-2022',
    avatar: 'https://i.pravatar.cc/150?img=11',
    lastMessage: 'Ngọc Nhi: @Hoàng Vinh ok nha',
    time: '3 giờ',
    isGroup: true
  },
  {
    id: '9',
    name: 'Nhóm QLDA',
    avatar: 'https://i.pravatar.cc/150?img=12',
    lastMessage: 'Lê Hồn: t tạo gg doc có j mn làm vô đây',
    time: '4 giờ',
    isGroup: true,
    unread: 5
  }
]

export default function MessagesScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [notificationVisible, setNotificationVisible] = useState(false)
  const { data: notificationState } = useNotificationStateQuery()

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
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
      <ScrollView style={{ flex: 1 }}>
        {MOCK_CONVERSATIONS.map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: '/chat/[id]' as any,
                params: {
                  id: conversation.id,
                  name: conversation.name,
                  avatar: conversation.avatar
                }
              })
            }
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 14
            }}
          >
            {/* Avatar */}
            <View style={{ marginRight: 12, position: 'relative' }}>
              <Image
                source={{ uri: conversation.avatar }}
                style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB' }}
              />
              {conversation.isGroup && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                    backgroundColor: '#3b82f6',
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: '#ffffff'
                  }}
                >
                  <Ionicons name='people' size={10} color='#ffffff' />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 }} numberOfLines={1}>
                  {conversation.name}
                </Text>
                <Text style={{ fontSize: 13, color: '#9ca3af', marginLeft: 8 }}>{conversation.time}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text numberOfLines={1} style={{ flex: 1, fontSize: 14, color: '#6b7280' }}>
                  {conversation.lastMessage}
                </Text>
                {/* Unread Badge */}
                {conversation.unread ? (
                  <View
                    style={{
                      marginLeft: 8,
                      backgroundColor: '#ef4444',
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      paddingHorizontal: 6,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>{conversation.unread}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}
