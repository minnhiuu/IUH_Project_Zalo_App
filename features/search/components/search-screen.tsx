import { Container, SearchTopBar } from '@/components'
import { useInfiniteSearchUsers } from '../queries/use-search-queries'
import { useDebounce } from '@/hooks/useDebounce'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, TextInput, View, ActivityIndicator, Keyboard, Animated } from 'react-native'
import { AllTab } from './all/all-tab'
import { ContactsTab } from './contacts/contacts-tab'
import { MessagesTab } from './messages/messages-tab'
import { DiscoverTab } from './discover/discover-tab'
import { RecentSearchScreen } from './recent-search-screen'
import { RecentSearch } from '../schema/search-schema'
import { storage, STORAGE_KEYS } from '@/utils/storageUtils'

export type SearchTab = 'all' | 'contacts' | 'messages' | 'discover'

const MOCK_MESSAGES = [
  {
    id: 'm1',
    senderName: 'péo',
    time: '20:35',
    lastMessage: '.... When you use an asynchronous message queue (MQ) like Kafka to dec...',
    matchCount: '99+'
  },
  { id: 'm2', senderName: 'Đào Linh', time: 'Sun', lastMessage: 'ăn cơm đi', matchCount: '5' }
]

const MOCK_CONTACTS = [
  { id: 'c1', fullName: 'Anh Tí', email: 'anhti@gmail.com', avatar: null },
  { id: 'c2', fullName: 'Ân', email: 'an@gmail.com', avatar: null }
]

export function SearchScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<SearchTab>('all')
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const debouncedQuery = useDebounce(searchQuery, 300)
  const inputRef = useRef<TextInput>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const {
    data: infiniteSearchResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteSearchUsers(debouncedQuery)

  useFocusEffect(
    useCallback(() => {
      loadRecentSearches()
    }, [])
  )

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true
    }).start()

    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 400)
    return () => clearTimeout(timer)
  }, [fadeAnim])

  const loadRecentSearches = async () => {
    const saved = await storage.get<RecentSearch[]>(STORAGE_KEYS.RECENT_SEARCHES)
    if (saved) {
      setRecentSearches(saved)
    }
  }

  const saveRecentSearches = async (updated: RecentSearch[]) => {
    setRecentSearches(updated)
    await storage.set(STORAGE_KEYS.RECENT_SEARCHES, updated)
  }

  const addToRecent = async (item: RecentSearch) => {
    let users = recentSearches.filter((s) => s.type === 'user')
    let keywords = recentSearches.filter((s) => s.type === 'keyword')

    if (item.type === 'user') {
      users = users.filter((s) => s.id !== item.id)
      users.unshift(item)
      users = users.slice(0, 10)
    } else {
      keywords = keywords.filter((s) => s.id !== item.id && s.displayName !== item.displayName)
      keywords.unshift(item)
      keywords = keywords.slice(0, 5)
    }

    const updated = [...users, ...keywords]
    await saveRecentSearches(updated)
  }

  const removeFromRecent = async (id: string) => {
    const updated = recentSearches.filter((s) => s.id !== id)
    await saveRecentSearches(updated)
  }

  const clearAllRecent = async () => {
    await saveRecentSearches([])
  }

  const handleClear = () => {
    setSearchQuery('')
    inputRef.current?.focus()
  }

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return

    addToRecent({
      id: `k-${Date.now()}`,
      type: 'keyword',
      displayName: searchQuery.trim(),
      timestamp: Date.now()
    })
  }

  const handleRecentSelect = (item: RecentSearch) => {
    addToRecent({ ...item, timestamp: Date.now() })

    if (item.type === 'user') {
      router.push(`/user/${item.id}` as any)
    } else {
      setSearchQuery(item.displayName)
    }
  }

  const tabs: { key: SearchTab; label: string }[] = [
    { key: 'all', label: t('search.tabs.all') },
    { key: 'contacts', label: t('search.tabs.contacts') },
    { key: 'messages', label: t('search.tabs.messages') },
    { key: 'discover', label: t('search.tabs.discover') }
  ]

  const renderEmptyState = () => {
    if (!debouncedQuery) return null
    return (
      <View className='flex-1 items-center justify-center p-10 mt-10'>
        <Ionicons name='search-outline' size={64} color='#E5E7EB' />
        <Text className='text-gray-500 mt-4 text-center'>{t('search.noResults', { query: debouncedQuery })}</Text>
      </View>
    )
  }

  const renderLoading = () => (
    <View className='py-10 items-center justify-center'>
      <ActivityIndicator size='large' color='#0068FF' />
    </View>
  )

  const onItemPress = (item: any) => {
    const isMock = item.id.startsWith('m') || item.id.startsWith('c')
    const isUser = activeTab === 'discover' || !isMock

    if (isUser) {
      addToRecent({
        id: item.id,
        type: 'user',
        displayName: item.fullName,
        avatar: item.avatar,
        timestamp: Date.now()
      })
      router.push(`/user/${item.id}` as any)
    } else {
      console.log('Selected item:', item.id)
    }
  }

  const renderContent = () => {
    if (!searchQuery) {
      return (
        <RecentSearchScreen
          searches={recentSearches}
          onSelect={handleRecentSelect}
          onRemove={removeFromRecent}
          onClear={clearAllRecent}
        />
      )
    }

    if (activeTab === 'discover') {
      return (
        <View className='flex-1 bg-gray-100'>
          {isLoading && !infiniteSearchResults ? (
            renderLoading()
          ) : (
            <DiscoverTab
              searchResults={infiniteSearchResults}
              searchQuery={searchQuery}
              onItemPress={onItemPress}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          )}
        </View>
      )
    }

    if (activeTab === 'contacts') {
      return (
        <View className='flex-1 bg-gray-100'>
          <ContactsTab mockContacts={MOCK_CONTACTS} searchQuery={searchQuery} onItemPress={onItemPress} />
        </View>
      )
    }

    if (activeTab === 'messages') {
      return (
        <View className='flex-1 bg-gray-100'>
          <MessagesTab mockMessages={MOCK_MESSAGES} searchQuery={searchQuery} onItemPress={onItemPress} />
        </View>
      )
    }

    return (
      <ScrollView
        className='flex-1 bg-gray-100'
        keyboardShouldPersistTaps='handled'
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        {isLoading && debouncedQuery && renderLoading()}
        {!isLoading && debouncedQuery && (
          <>
            <AllTab
              searchResults={infiniteSearchResults}
              searchQuery={searchQuery}
              mockMessages={MOCK_MESSAGES}
              mockContacts={MOCK_CONTACTS}
              setActiveTab={setActiveTab}
              onItemPress={onItemPress}
            />

            {(!infiniteSearchResults?.pages?.[0]?.data || infiniteSearchResults.pages[0].data.length === 0) &&
              renderEmptyState()}
          </>
        )}
      </ScrollView>
    )
  }

  return (
    <Container safeAreaEdges={[]}>
      <SearchTopBar
        style={{ opacity: fadeAnim }}
        inputRef={inputRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder={t('search.placeholder')}
        onBack={() => router.back()}
        onClear={handleClear}
        tabs={searchQuery ? tabs : []}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSubmitEditing={handleSearchSubmit}
      />

      {renderContent()}
    </Container>
  )
}
