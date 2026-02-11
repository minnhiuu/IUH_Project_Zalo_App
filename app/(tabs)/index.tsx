import { Ionicons } from '@expo/vector-icons'
import { View, ScrollView, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Header, Avatar, Text } from '@/components/ui'

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
    lastMessage: 'Bạn: ma m làm gì v',
    time: '46 giây'
  },
  {
    id: '2',
    name: 'Nguyễn Duyên',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Bạn hông làm',
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
    lastMessage: 'Trong video record có có nói sơ, mà...',
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
    lastMessage: 'Lê Hồn: t tạo gg doc có j mn làm vô đầy\n✈️ t bài 1, Hùng, Hiếu bài 2, Giáp, Danh bài 3',
    time: '4 giờ',
    isGroup: true,
    unread: 5
  }
]

export default function MessagesScreen() {
  const { t } = useTranslation()

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <Header
        showSearch
        searchPlaceholder={t('messages.search')}
        showQRButton
        showAddButton
      />

      {/* Conversations List */}
      <ScrollView className="flex-1">
        {MOCK_CONVERSATIONS.map((conversation) => (
          <Pressable
            key={conversation.id}
            className="flex-row items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50"
          >
            {/* Avatar */}
            <View className="mr-3">
              <Avatar
                size="lg"
                source={{ uri: conversation.avatar }}
                fallback={
                  <View className="bg-gray-300 items-center justify-center w-full h-full">
                    <Text className="text-white font-bold">
                      {conversation.name[0]}
                    </Text>
                  </View>
                }
              />
              {conversation.isGroup && (
                <View className="absolute -bottom-1 -right-1 bg-primary rounded-full w-5 h-5 items-center justify-center border-2 border-white">
                  <Ionicons name="people" size={10} color="#ffffff" />
                </View>
              )}
            </View>

            {/* Content */}
            <View className="flex-1 mr-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text size="base" weight="semibold" className="flex-1 text-gray-900">
                  {conversation.name}
                </Text>
                <Text size="xs" className="text-gray-500">
                  {conversation.time}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text
                  size="sm"
                  numberOfLines={1}
                  className="flex-1 text-gray-600"
                >
                  {conversation.lastMessage}
                </Text>
                {/* Unread Badge */}
                {conversation.unread && (
                  <View className="ml-2 bg-destructive rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {conversation.unread}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}
