import { View, TouchableOpacity, SectionList, ActivityIndicator } from 'react-native'
import { useState, useMemo } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { useSemanticColors } from '@/context/theme-context'
import {
  useReceivedFriendRequests,
  useSentFriendRequests,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useCancelFriendRequest,
} from '@/features/friend/queries'
import { FriendRequestItem } from '@/features/friend/components'
import type { FriendRequestResponse } from '@/features/friend/schemas'

// Group requests by month
function groupByMonth(
  requests: FriendRequestResponse[]
): { title: string; data: FriendRequestResponse[] }[] {
  const groups: Record<string, FriendRequestResponse[]> = {}
  requests.forEach((req) => {
    const date = new Date(req.createdAt)
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const key = `Tháng ${month}, ${year}`
    if (!groups[key]) groups[key] = []
    groups[key].push(req)
  })
  return Object.entries(groups).map(([title, data]) => ({ title, data }))
}

export default function FriendRequestsScreen() {
  const router = useRouter()
  const { autoAction, requestId } = useLocalSearchParams<{ autoAction: string; requestId: string }>()
  const { t } = useTranslation()
  const semanticColors = useSemanticColors()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  // Fetch real data from API
  const {
    data: receivedRequests = [],
    isLoading: receivedLoading,
  } = useReceivedFriendRequests()
  const {
    data: sentRequests = [],
    isLoading: sentLoading,
  } = useSentFriendRequests()

  // Mutations
  const acceptMutation = useAcceptFriendRequest()
  const declineMutation = useDeclineFriendRequest()
  const cancelMutation = useCancelFriendRequest()

  const receivedSections = useMemo(() => groupByMonth(receivedRequests), [receivedRequests])
  const sentSections = useMemo(() => groupByMonth(sentRequests), [sentRequests])

  const receivedCount = receivedRequests.length

  const addLoadingId = (id: string) => setLoadingIds((prev) => new Set(prev).add(id))
  const removeLoadingId = (id: string) => {
    setLoadingIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleAccept = (friendshipId: string) => {
    addLoadingId(friendshipId)
    acceptMutation.mutate(friendshipId, {
      onSettled: () => removeLoadingId(friendshipId),
    })
  }

  const handleDecline = (friendshipId: string) => {
    addLoadingId(friendshipId)
    declineMutation.mutate(friendshipId, {
      onSettled: () => removeLoadingId(friendshipId),
    })
  }

  const handleCancel = (friendshipId: string, userId: string) => {
    addLoadingId(friendshipId)
    cancelMutation.mutate({ friendshipId, userId }, {
      onSettled: () => removeLoadingId(friendshipId),
    })
  }

  const isLoading = activeTab === 'received' ? receivedLoading : sentLoading

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, backgroundColor: semanticColors.background }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: semanticColors.textSecondary }}>
        {section.title}
      </Text>
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: semanticColors.background }}>
      {/* Header */}
      <Header
        title={t('friend.title')}
        showBackButton
        onBackPress={() => router.back()}
        showSettingsButton
      />

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: semanticColors.border, backgroundColor: semanticColors.background }}>
        <TouchableOpacity
          onPress={() => setActiveTab('received')}
          activeOpacity={0.7}
          style={{
            flex: 1,
            paddingVertical: 14,
            alignItems: 'center',
            borderBottomWidth: activeTab === 'received' ? 2 : 0,
            borderBottomColor: semanticColors.primary,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: activeTab === 'received' ? '700' : '400',
                color: activeTab === 'received' ? semanticColors.textPrimary : semanticColors.textSecondary,
              }}
            >
              {t('friend.tabs.received')}
            </Text>
            {receivedCount > 0 && (
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: activeTab === 'received' ? semanticColors.textPrimary : semanticColors.textSecondary,
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
            borderBottomColor: semanticColors.primary,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: activeTab === 'sent' ? '700' : '400',
              color: activeTab === 'sent' ? semanticColors.textPrimary : semanticColors.textSecondary,
            }}
          >
            {t('friend.tabs.sent')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={semanticColors.primary} />
          <Text style={{ color: semanticColors.textSecondary, marginTop: 12 }}>{t('friend.loading')}</Text>
        </View>
      ) : activeTab === 'received' ? (
        receivedCount > 0 ? (
          <SectionList
            sections={receivedSections}
            renderItem={({ item, index, section }) => (
              <FriendRequestItem
                request={item}
                type="received"
                onAccept={handleAccept}
                onDecline={handleDecline}
                isLoading={loadingIds.has(item.id)}
                isNew={index === 0 && receivedSections[0].title === section.title}
                autoAction={item.id === requestId ? (autoAction as 'accept' | 'decline') : undefined}
              />
            )}
            renderSectionHeader={renderSectionHeader}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            ListFooterComponent={
              <TouchableOpacity
                activeOpacity={0.7}
                style={{
                  paddingVertical: 16,
                  alignItems: 'center',
                  borderTopWidth: 0.5,
                  borderTopColor: semanticColors.border,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: semanticColors.textSecondary, letterSpacing: 1 }}>
                  {t('friend.viewMore')}
                </Text>
              </TouchableOpacity>
            }
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="person-outline" size={48} color="#D1D5DB" />
            <Text style={{ color: '#9ca3af', marginTop: 12 }}>
              {t('friend.empty.received')}
            </Text>
          </View>
        )
      ) : sentRequests.length > 0 ? (
        <SectionList
          sections={sentSections}
          renderItem={({ item }) => (
            <FriendRequestItem
              request={item}
              type="sent"
              onCancel={handleCancel}
              isLoading={loadingIds.has(item.id)}
            />
          )}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="paper-plane-outline" size={48} color="#D1D5DB" />
          <Text style={{ color: '#9ca3af', marginTop: 12 }}>
            {t('friend.empty.sent')}
          </Text>
        </View>
      )}
    </View>
  )
}
