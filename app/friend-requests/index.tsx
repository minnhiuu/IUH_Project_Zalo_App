import { View, ScrollView, Pressable, FlatList } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { Header, Text, Avatar } from '@/components/ui'
import { useTheme } from '@/context'

// Mock data - Replace with real API data
interface FriendRequest {
  id: string
  userId: string
  userName: string
  avatar?: string
  source: 'phoneContact' | 'friendSuggestion' | 'qrCode' | 'nearby' | 'group'
  groupName?: string
  timestamp: Date
}

const MOCK_RECEIVED_REQUESTS: FriendRequest[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?img=1',
    source: 'phoneContact',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/150?img=2',
    source: 'friendSuggestion',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Lê Văn C',
    avatar: 'https://i.pravatar.cc/150?img=3',
    source: 'qrCode',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
]

const MOCK_SENT_REQUESTS: FriendRequest[] = [
  {
    id: '4',
    userId: 'user4',
    userName: 'Phạm Thị D',
    avatar: 'https://i.pravatar.cc/150?img=4',
    source: 'nearby',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Hoàng Văn E',
    avatar: 'https://i.pravatar.cc/150?img=5',
    source: 'group',
    groupName: 'Nhóm học tập',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
]

export default function FriendRequestsScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')

  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))

    if (diffMins < 1) return t('friendRequests.time.justNow')
    if (diffMins < 60) return t('friendRequests.time.minutesAgo', { count: diffMins })
    if (diffHours < 24) return t('friendRequests.time.hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('friendRequests.time.daysAgo', { count: diffDays })
    return t('friendRequests.time.weeksAgo', { count: diffWeeks })
  }

  const getSourceText = (source: FriendRequest['source'], groupName?: string): string => {
    if (source === 'group' && groupName) {
      return t('friendRequests.source.group', { groupName })
    }
    return t(`friendRequests.source.${source}`)
  }

  const handleAccept = (requestId: string) => {
    console.log('Accept friend request:', requestId)
    // TODO: Call API to accept friend request
  }

  const handleDecline = (requestId: string) => {
    console.log('Decline friend request:', requestId)
    // TODO: Call API to decline friend request
  }

  const handleWithdraw = (requestId: string) => {
    console.log('Withdraw friend request:', requestId)
    // TODO: Call API to withdraw friend request
  }

  const renderReceivedItem = ({ item }: { item: FriendRequest }) => (
    <Pressable className="flex-row items-center bg-white px-4 py-3 border-b border-gray-100">
      {/* Avatar */}
      <View className="mr-3">
        <Avatar size="lg" source={item.avatar ? { uri: item.avatar } : undefined} />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text weight="medium" className="text-base mb-0.5">
          {item.userName}
        </Text>
        <Text size="sm" className="text-gray-500 mb-1">
          {getSourceText(item.source, item.groupName)}
        </Text>
        <Text size="sm" className="text-gray-400">
          {getTimeAgo(item.timestamp)}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2 ml-2">
        {/* Decline Button */}
        <Pressable
          onPress={() => handleDecline(item.id)}
          className="px-4 py-2 bg-gray-100 rounded-lg active:opacity-70"
        >
          <Text size="sm" weight="medium" className="text-gray-700">
            {t('friendRequests.actions.decline')}
          </Text>
        </Pressable>

        {/* Accept Button */}
        <Pressable
          onPress={() => handleAccept(item.id)}
          className="px-4 py-2 rounded-lg active:opacity-70"
          style={{ backgroundColor: '#005ae0' }}
        >
          <Text size="sm" weight="medium" className="text-white">
            {t('friendRequests.actions.accept')}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  )

  const renderSentItem = ({ item }: { item: FriendRequest }) => (
    <Pressable className="flex-row items-center bg-white px-4 py-3 border-b border-gray-100">
      {/* Avatar */}
      <View className="mr-3">
        <Avatar size="lg" source={item.avatar ? { uri: item.avatar } : undefined} />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text weight="medium" className="text-base mb-0.5">
          {item.userName}
        </Text>
        <Text size="sm" className="text-gray-500 mb-1">
          {getSourceText(item.source, item.groupName)}
        </Text>
        <Text size="sm" className="text-gray-400">
          {getTimeAgo(item.timestamp)}
        </Text>
      </View>

      {/* Withdraw Button */}
      <Pressable
        onPress={() => handleWithdraw(item.id)}
        className="px-4 py-2 bg-gray-100 rounded-lg active:opacity-70"
      >
        <Text size="sm" weight="medium" className="text-gray-700">
          {t('friendRequests.actions.withdraw')}
        </Text>
      </Pressable>
    </Pressable>
  )

  const receivedCount = MOCK_RECEIVED_REQUESTS.length
  const sentCount = MOCK_SENT_REQUESTS.length

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <Header
        title={t('friendRequests.title')}
        showBackButton
        onBackPress={() => router.back()}
      />

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200 bg-white">
        <Pressable
          onPress={() => setActiveTab('received')}
          className="flex-1 py-3 items-center"
          style={{
            borderBottomWidth: activeTab === 'received' ? 2 : 0,
            borderBottomColor: '#005ae0',
          }}
        >
          <Text
            weight={activeTab === 'received' ? 'semibold' : 'normal'}
            style={{
              color: activeTab === 'received' ? '#005ae0' : '#666',
            }}
          >
            {t('friendRequests.tabs.received')} {receivedCount > 0 && receivedCount}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('sent')}
          className="flex-1 py-3 items-center"
          style={{
            borderBottomWidth: activeTab === 'sent' ? 2 : 0,
            borderBottomColor: '#005ae0',
          }}
        >
          <Text
            weight={activeTab === 'sent' ? 'semibold' : 'normal'}
            style={{
              color: activeTab === 'sent' ? '#005ae0' : '#666',
            }}
          >
            {t('friendRequests.tabs.sent')}
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <View className="flex-1">
        {activeTab === 'received' ? (
          receivedCount > 0 ? (
            <FlatList
              data={MOCK_RECEIVED_REQUESTS}
              renderItem={renderReceivedItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-400">
                {t('friendRequests.empty.received')}
              </Text>
            </View>
          )
        ) : sentCount > 0 ? (
          <FlatList
            data={MOCK_SENT_REQUESTS}
            renderItem={renderSentItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400">
              {t('friendRequests.empty.sent')}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}
