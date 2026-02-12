import { View, TouchableOpacity, Image, SectionList } from 'react-native'
import { useState, useMemo } from 'react'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/components/ui'
import { Text } from '@/components/ui/text'

// Mock data
interface FriendRequest {
  id: string
  userId: string
  userName: string
  avatar?: string
  source: 'phoneContact' | 'friendSuggestion' | 'qrCode' | 'nearby' | 'group'
  groupName?: string
  message?: string
  timestamp: Date
}

const MOCK_RECEIVED_REQUESTS: FriendRequest[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Nguyen Trong An',
    avatar: 'https://i.pravatar.cc/150?img=1',
    source: 'phoneContact',
    timestamp: new Date('2026-02-07'),
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Nhã Tâm',
    avatar: 'https://i.pravatar.cc/150?img=2',
    source: 'group',
    groupName: 'Bạn cùng nhóm',
    message: 'Xin chào, mình là Nhã Tâm. Thấy bạn trong nhóm dog nên mình muốn kết bạn!',
    timestamp: new Date('2026-01-26'),
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Xô Viết Nghệ Tĩnh',
    avatar: 'https://i.pravatar.cc/150?img=3',
    source: 'friendSuggestion',
    message: 'Xin chào Nguyễn Huỳnh Minh Hiếu, kết bạn với mình nhé!',
    timestamp: new Date('2025-12-09'),
  },
]

const MOCK_SENT_REQUESTS: FriendRequest[] = [
  {
    id: '4',
    userId: 'user4',
    userName: 'Phạm Thị D',
    avatar: 'https://i.pravatar.cc/150?img=4',
    source: 'nearby',
    timestamp: new Date('2026-02-10'),
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Hoàng Văn E',
    avatar: 'https://i.pravatar.cc/150?img=5',
    source: 'group',
    groupName: 'Nhóm học tập',
    timestamp: new Date('2026-01-15'),
  },
]

// Group requests by month
function groupByMonth(requests: FriendRequest[]): { title: string; data: FriendRequest[] }[] {
  const groups: Record<string, FriendRequest[]> = {}
  requests.forEach((req) => {
    const month = req.timestamp.getMonth() + 1
    const year = req.timestamp.getFullYear()
    const key = `Tháng ${month}, ${year}`
    if (!groups[key]) groups[key] = []
    groups[key].push(req)
  })
  return Object.entries(groups).map(([title, data]) => ({ title, data }))
}

export default function FriendRequestsScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [showMore, setShowMore] = useState(false)

  const receivedSections = useMemo(() => groupByMonth(MOCK_RECEIVED_REQUESTS), [])
  const sentSections = useMemo(() => groupByMonth(MOCK_SENT_REQUESTS), [])

  const getSourceText = (source: FriendRequest['source'], groupName?: string): string => {
    if (source === 'group' && groupName) {
      return t('friendRequests.source.group', { groupName })
    }
    return t(`friendRequests.source.${source}`)
  }

  const getTimeDisplay = (timestamp: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 1) return t('friendRequests.time.justNow')
    if (diffDays < 7) return t('friendRequests.time.daysAgo', { count: diffDays })
    // Show date dd/MM
    const day = String(timestamp.getDate()).padStart(2, '0')
    const month = String(timestamp.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }

  const handleAccept = (requestId: string) => {
    console.log('Accept friend request:', requestId)
  }

  const handleDecline = (requestId: string) => {
    console.log('Decline friend request:', requestId)
  }

  const handleWithdraw = (requestId: string) => {
    console.log('Withdraw friend request:', requestId)
  }

  const receivedCount = MOCK_RECEIVED_REQUESTS.length

  const renderRequestItem = ({ item }: { item: FriendRequest }) => (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Avatar */}
        <Image
          source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }}
          style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#E5E7EB', marginRight: 12 }}
        />

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
            {item.userName}
          </Text>

          <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
            {getTimeDisplay(item.timestamp)} • {getSourceText(item.source, item.groupName)}
          </Text>

          {/* Message bubble */}
          {item.message && (
            <View
              style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginTop: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: '#374151', lineHeight: 20 }}>
                {item.message}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {activeTab === 'received' ? (
            <View style={{ flexDirection: 'row', marginTop: 12, gap: 10 }}>
              <TouchableOpacity
                onPress={() => handleDecline(item.id)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: '#E5E7EB',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {t('friendRequests.actions.decline')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleAccept(item.id)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: '#E8F3FF',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#0068FF' }}>
                  {t('friendRequests.actions.accept')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => handleWithdraw(item.id)}
                activeOpacity={0.7}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: '#E5E7EB',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                  {t('friendRequests.actions.withdraw')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  )

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
        {section.title}
      </Text>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <Header
        title={t('friendRequests.title')}
        showBackButton
        onBackPress={() => router.back()}
        showSettingsButton
      />

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB', backgroundColor: '#fff' }}>
        <TouchableOpacity
          onPress={() => setActiveTab('received')}
          activeOpacity={0.7}
          style={{
            flex: 1,
            paddingVertical: 14,
            alignItems: 'center',
            borderBottomWidth: activeTab === 'received' ? 2 : 0,
            borderBottomColor: '#111827',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: activeTab === 'received' ? '700' : '400',
                color: activeTab === 'received' ? '#111827' : '#6b7280',
              }}
            >
              {t('friendRequests.tabs.received')}
            </Text>
            {receivedCount > 0 && (
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: activeTab === 'received' ? '#111827' : '#6b7280',
                }}
              >
                {' '}{receivedCount}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('sent')}
          activeOpacity={0.7}
          style={{
            flex: 1,
            paddingVertical: 14,
            alignItems: 'center',
            borderBottomWidth: activeTab === 'sent' ? 2 : 0,
            borderBottomColor: '#111827',
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: activeTab === 'sent' ? '700' : '400',
              color: activeTab === 'sent' ? '#111827' : '#6b7280',
            }}
          >
            {t('friendRequests.tabs.sent')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'received' ? (
        receivedCount > 0 ? (
          <>
            <SectionList
              sections={receivedSections}
              renderItem={renderRequestItem}
              renderSectionHeader={renderSectionHeader}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
              ListFooterComponent={
                <TouchableOpacity
                  onPress={() => setShowMore(!showMore)}
                  activeOpacity={0.7}
                  style={{
                    paddingVertical: 16,
                    alignItems: 'center',
                    borderTopWidth: 0.5,
                    borderTopColor: '#E5E7EB',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', letterSpacing: 1 }}>
                      {t('friendRequests.viewMore')}
                    </Text>
                    <Ionicons name={showMore ? 'chevron-up' : 'chevron-down'} size={16} color="#374151" />
                  </View>
                </TouchableOpacity>
              }
            />
          </>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#9ca3af' }}>
              {t('friendRequests.empty.received')}
            </Text>
          </View>
        )
      ) : MOCK_SENT_REQUESTS.length > 0 ? (
        <SectionList
          sections={sentSections}
          renderItem={renderRequestItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#9ca3af' }}>
            {t('friendRequests.empty.sent')}
          </Text>
        </View>
      )}
    </View>
  )
}
