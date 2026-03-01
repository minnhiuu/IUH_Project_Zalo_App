import { Ionicons } from '@expo/vector-icons'
import { View, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Header } from '@/components/ui'
import { Text } from '@/components/ui/text'
import { useMyFriends, useReceivedFriendRequests } from '@/features/friend/queries'
import { FriendListItem } from '@/features/friend/components'
import type { FriendResponse } from '@/features/friend/schemas'
import { SEMANTIC, BRAND } from '@/constants/theme'

function groupByLetter(friends: FriendResponse[]): { title: string; data: FriendResponse[] }[] {
  const groups: Record<string, FriendResponse[]> = {}
  friends.forEach((f) => {
    const letter = f.userName.charAt(0).toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(f)
  })
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({ title, data }))
}

const ALPHABET = ['A','B','C','Đ','G','H','K','L','M','N','O','P','Q','R','S','T','V','X','Y','Z']

export default function ContactsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'oa'>('friends')
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'recent'>('all')

  // Fetch real data from API
  const { data: friends = [], isLoading: friendsLoading } = useMyFriends()
  const { data: receivedRequests = [] } = useReceivedFriendRequests()

  const sections = useMemo(() => groupByLetter(friends), [friends])
  const friendCount = friends.length
  const requestCount = receivedRequests.length

  const tabs = [
    { key: 'friends' as const, label: t('contacts.tabs.friends') },
    { key: 'groups' as const, label: t('contacts.tabs.groups') },
    { key: 'oa' as const, label: 'OA' },
  ]

  const filters = [
    { key: 'all' as const, label: t('contacts.filters.all'), count: friendCount },
    { key: 'new' as const, label: t('contacts.filters.new'), count: 0 },
    { key: 'recent' as const, label: t('contacts.filters.recent'), count: 0 },
  ]

  const handleFriendPress = (friend: FriendResponse) => {
    router.push({
      pathname: '/chat/[id]' as any,
      params: {
        id: friend.userId,
        name: friend.userName,
        avatar: friend.userAvatar || '',
      },
    })
  }

  const handleCall = (friend: FriendResponse) => {
    console.log('Call:', friend.userId)
  }

  const handleVideoCall = (friend: FriendResponse) => {
    console.log('Video call:', friend.userId)
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <Header
        showSearch
        searchPlaceholder={t('contacts.search')}
        showAddButton
        onAddPress={() => router.push('/add-friend' as any)}
      />

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: activeTab === tab.key ? 2 : 0,
              borderBottomColor: '#0068FF',
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: activeTab === tab.key ? '600' : '400',
                color: activeTab === tab.key ? '#0068FF' : '#6b7280',
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View>
        <TouchableOpacity
          onPress={() => router.push('/friend-requests')}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 0.5,
            borderBottomColor: '#f0f0f0',
          }}
        >
          <View style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: BRAND.blueLight,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="person-add" size={22} color={SEMANTIC.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>
              {t('contacts.friendRequest')}
            </Text>
          </View>
          {requestCount > 0 && (
            <Text style={{ fontSize: 14, color: '#6b7280' }}>({requestCount})</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 6,
            borderBottomColor: '#F3F4F6',
          }}
        >
          <View style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: '#FFF7E6',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="gift" size={22} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>
              {t('contacts.birthday')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
      }}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setActiveFilter(filter.key)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: activeFilter === filter.key ? BRAND.blueLight : '#F3F4F6',
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: '500',
              color: activeFilter === filter.key ? SEMANTIC.primary : '#6b7280',
            }}>
              {filter.label} {filter.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contacts List + Alphabet */}
      {friendsLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0068FF" />
          <Text style={{ color: '#9ca3af', marginTop: 12 }}>{t('friend.loading')}</Text>
        </View>
      ) : friends.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="people-outline" size={48} color="#D1D5DB" />
          <Text style={{ color: '#9ca3af', marginTop: 12 }}>{t('friend.empty.friends')}</Text>
        </View>
      ) : (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <SectionList
            sections={sections}
            style={{ flex: 1 }}
            keyExtractor={(item) => item.userId}
            stickySectionHeadersEnabled
            showsVerticalScrollIndicator={false}
            renderSectionHeader={({ section }) => (
              <View style={{ paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#F9FAFB' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
                  {section.title}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <FriendListItem
                friend={item}
                onPress={handleFriendPress}
                onCall={handleCall}
                onVideoCall={handleVideoCall}
              />
            )}
          />

          {/* Alphabet Sidebar */}
          <View style={{ justifyContent: 'center', paddingHorizontal: 4, paddingVertical: 4 }}>
            {ALPHABET.map((letter) => (
              <TouchableOpacity key={letter} style={{ paddingVertical: 1.5 }}>
                <Text style={{ fontSize: 10, fontWeight: '500', color: '#6b7280', textAlign: 'center' }}>
                  {letter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}
