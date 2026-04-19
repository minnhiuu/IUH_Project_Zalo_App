import { Ionicons } from '@expo/vector-icons'
import { View, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useState, useMemo, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'

import { Text } from '@/components/ui/text'
import { useMyFriends, useReceivedFriendRequests, useContactSuggestions } from '@/features/friend/queries'
import { FriendListItem } from '@/features/friend/components'
import type { FriendResponse } from '@/features/friend/schemas'
import { SEMANTIC, BRAND } from '@/constants/theme'
import { Header } from '@/components'
import { useTheme } from '@/context/theme-context'

function groupByLetter(friends: FriendResponse[]): { title: string; data: FriendResponse[] }[] {
  const groups: Record<string, FriendResponse[]> = {}
  friends.forEach((f) => {
    const name = f.userName?.trim() || ''
    const letter = name.length > 0 ? name.charAt(0).toUpperCase() : '#'
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(f)
  })
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({ title, data }))
}

const ALPHABET = ['A', 'B', 'C', 'Đ', 'G', 'H', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'X', 'Y', 'Z']

export default function ContactsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'oa'>('friends')
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'recent'>('all')

  // Fetch real data from API
  const { data: friends = [], isLoading: friendsLoading } = useMyFriends()
  const { data: receivedRequests = [] } = useReceivedFriendRequests()
  const { data: contactSuggestions = [] } = useContactSuggestions(0, 5, true)

  const sectionListRef = useRef<SectionList>(null)
  const sections = useMemo(() => groupByLetter(friends), [friends])
  const friendCount = friends.length
  const requestCount = receivedRequests.length

  const handleAlphabetPress = useCallback(
    (letter: string) => {
      const sectionIndex = sections.findIndex((s) => s.title === letter)
      if (sectionIndex !== -1 && sectionListRef.current) {
        sectionListRef.current.scrollToLocation({
          sectionIndex,
          itemIndex: 0,
          animated: true,
          viewOffset: 0
        })
      }
    },
    [sections]
  )

  const tabs = [
    { key: 'friends' as const, label: t('contacts.tabs.friends') },
    { key: 'groups' as const, label: t('contacts.tabs.groups') },
    { key: 'oa' as const, label: 'OA' }
  ]

  const filters = [
    { key: 'all' as const, label: t('contacts.filters.all'), count: friendCount },
    { key: 'new' as const, label: t('contacts.filters.new'), count: 0 },
    { key: 'recent' as const, label: t('contacts.filters.recent'), count: 0 }
  ]

  const handleFriendPress = (friend: FriendResponse) => {
    if (!friend.userId) return

    router.push({
      pathname: '/chat/[id]' as any,
      params: {
        id: friend.userId,
        name: friend.userName || '',
        avatar: friend.userAvatar || ''
      }
    })
  }

  const handleCall = (friend: FriendResponse) => {
    console.log('Call:', friend.userId)
  }

  const handleVideoCall = (friend: FriendResponse) => {
    console.log('Video call:', friend.userId)
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      {/* Header */}
      <Header
        showSearch
        searchPlaceholder={t('contacts.search')}
        showAddButton
        onAddPress={() => router.push('/add-friend' as any)}
      />

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: colors.border }}>
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
              borderBottomColor: colors.tint
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: activeTab === tab.key ? '600' : '400',
                color: activeTab === tab.key ? colors.tint : colors.textSecondary
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
            borderBottomColor: colors.border
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.tint,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}
          >
            <Ionicons name='person-add' size={22} color='#fff' />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{t('contacts.friendRequest')}</Text>
          </View>
          {requestCount > 0 && <Text style={{ fontSize: 14, color: colors.textSecondary }}>({requestCount})</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 6,
            borderBottomColor: colors.divider
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#FFF7E6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}
          >
            <Ionicons name='gift' size={22} color='#F59E0B' />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{t('contacts.birthday')}</Text>
          </View>
        </TouchableOpacity>

        {/* Find friends from contacts */}
        <TouchableOpacity
          onPress={() => router.push('/find-friends-contacts' as any)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 6,
            borderBottomColor: colors.divider
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#E8F5E9',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12
            }}
          >
            <Ionicons name='phone-portrait-outline' size={22} color='#4CAF50' />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
              {t('friend.contact.findFromContacts')}
            </Text>

          </View>
          {contactSuggestions.length > 0 && (
            <View
              style={{
                backgroundColor: '#FF3B30',
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 6
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{contactSuggestions.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 8,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border
        }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setActiveFilter(filter.key)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: activeFilter === filter.key ? colors.tint : colors.background,
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '500',
                color: activeFilter === filter.key ? '#fff' : colors.textSecondary
              }}
            >
              {filter.label} {filter.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contacts List + Alphabet */}
      {friendsLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size='large' color={colors.tint} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>{t('friend.loading')}</Text>
        </View>
      ) : friends.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name='people-outline' size={48} color={colors.border} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>{t('friend.empty.friends')}</Text>
        </View>
      ) : (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <SectionList
            ref={sectionListRef}
            sections={sections}
            style={{ flex: 1 }}
            keyExtractor={(item) => item.userId}
            stickySectionHeadersEnabled
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={() => {}}
            renderSectionHeader={({ section }) => (
              <View style={{ paddingHorizontal: 16, paddingVertical: 6, backgroundColor: colors.backgroundSecondary }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>{section.title}</Text>
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
            {ALPHABET.map((letter) => {
              const hasSection = sections.some((s) => s.title === letter)
              return (
                <TouchableOpacity
                  key={letter}
                  onPress={() => handleAlphabetPress(letter)}
                  style={{ paddingVertical: 1.5 }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: hasSection ? '700' : '500',
                      color: hasSection ? colors.tint : colors.textSecondary,
                      textAlign: 'center'
                    }}
                  >
                    {letter}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}
    </View>
  )
}
