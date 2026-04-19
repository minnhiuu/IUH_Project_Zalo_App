import { SearchTopBar } from '@/components'
import {
  useInfiniteSearchUsers,
  useRecentSearchItems,
  useRecentSearchQueries,
  useAddRecentSearch,
  useRemoveRecentSearch,
  useClearAllRecentSearch
} from '../queries'
import { useMyProfile } from '@/features/users'
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
import { RecentSearchList } from './recent-search-list'
import { RecentSearchResponse } from '../schemas/search-schema'
import { SearchType } from '@/constants/enum'

export type SearchTab = 'all' | 'contacts' | 'messages' | 'discover' | 'file'

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
  { id: 'c1', fullName: 'test1', email: 'test1@gmail.com', avatar: null },
  { id: 'c2', fullName: 'test2', email: 'test2@gmail.com', avatar: null }
]

export function Search() {
  const router = useRouter()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<SearchTab>('all')
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

  const { data: recentItems = [], refetch: refetchItems } = useRecentSearchItems()
  const { data: recentQueriesData = [], refetch: refetchQueries } = useRecentSearchQueries()
  const { data: myProfile } = useMyProfile()

  const addRecentSearch = useAddRecentSearch()
  const removeRecentSearch = useRemoveRecentSearch()
  const clearAllRecentSearch = useClearAllRecentSearch()

  const recentSearches: RecentSearchResponse[] = [...recentItems, ...recentQueriesData]

  useFocusEffect(
    useCallback(() => {
      refetchItems()
      refetchQueries()
    }, [refetchItems, refetchQueries])
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

  const handleClear = () => {
    setSearchQuery('')
    inputRef.current?.focus()
  }

  const handleSearchSubmit = () => {
    if (!searchQuery.trim()) return

    const trimmedQuery = searchQuery.trim()
    const isSelfPhone = myProfile?.phoneNumber === trimmedQuery

    addRecentSearch.mutate({
      id: isSelfPhone ? myProfile.id : `k-${Date.now()}`,
      name: trimmedQuery,
      type: SearchType.Keyword
    })
  }

  const handleRecentSelect = (item: RecentSearchResponse) => {
    addRecentSearch.mutate({
      id: item.id,
      name: item.name,
      avatar: item.avatar,
      type: item.type
    })

    if (item.type === SearchType.User || item.type === SearchType.Group) {
      router.push(`/user-profile/${item.id}` as any)
    } else {
      setSearchQuery(item.name)
    }
  }

  const handleRemove = (id: string, type: SearchType) => {
    removeRecentSearch.mutate({ id, type })
  }

  const handleClearAll = () => {
    clearAllRecentSearch.mutate()
  }

  const tabs: { key: SearchTab; label: string }[] = [
    { key: 'all', label: t('search.tabs.all') },
    { key: 'contacts', label: t('search.tabs.contacts') },
    { key: 'messages', label: t('search.tabs.messages') },
    { key: 'discover', label: t('search.tabs.discover') },
    { key: 'file', label: t('search.tabs.file') }
  ]

  const renderEmptyState = () => {
    if (!debouncedQuery) return null
    return (
      <View className='flex-1 items-center justify-center p-10 mt-10'>
        <Ionicons name='search-outline' size={64} color='#E5E7EB' />
        <Text className='text-muted-foreground mt-4 text-center'>
          {t('search.noResults', { query: debouncedQuery })}
        </Text>
      </View>
    )
  }

  const renderLoading = () => (
    <View className='py-10 items-center justify-center'>
      <ActivityIndicator size='large' color='#0068FF' />
    </View>
  )

  const onItemPress = (item: any) => {
    const isMessage = item.id.startsWith('m')

    if (!isMessage) {
      if (item.id === myProfile?.id) {
        router.push(`/user-profile/${item.id}` as any)
        return
      }

      addRecentSearch.mutate({
        id: item.id,
        name: item.fullName || item.senderName,
        avatar: item.avatar ?? null,
        type: SearchType.User
      })
      router.push(`/user-profile/${item.id}` as any)
    } else {
      console.log('Selected item:', item.id)
    }
  }

  const filteredContacts = MOCK_CONTACTS.filter((c) => c.fullName.toLowerCase().includes(debouncedQuery.toLowerCase()))
  const filteredMessages = MOCK_MESSAGES.filter(
    (m) =>
      m.senderName.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      m.lastMessage.toLowerCase().includes(debouncedQuery.toLowerCase())
  )

  const hasApiResults = infiniteSearchResults?.pages?.some((page) => page?.data && page.data.length > 0)
  const hasResults = hasApiResults || filteredContacts.length > 0 || filteredMessages.length > 0

  const renderContent = () => {
    if (!searchQuery) {
      return (
        <RecentSearchList
          searches={recentSearches}
          onSelect={handleRecentSelect}
          onRemove={handleRemove}
          onClear={handleClearAll}
        />
      )
    }

    if (activeTab === 'discover') {
      return (
        <View className='flex-1 bg-background-secondary'>
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
        <View className='flex-1 bg-background-secondary'>
          <ContactsTab mockContacts={filteredContacts} searchQuery={searchQuery} onItemPress={onItemPress} />
        </View>
      )
    }

    if (activeTab === 'messages') {
      return (
        <View className='flex-1 bg-background-secondary'>
          <MessagesTab mockMessages={filteredMessages} searchQuery={searchQuery} onItemPress={onItemPress} />
        </View>
      )
    }

    return (
      <ScrollView
        className='flex-1 bg-background-secondary'
        keyboardShouldPersistTaps='handled'
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        {isLoading && debouncedQuery && renderLoading()}
        {!isLoading && debouncedQuery && (
          <>
            <AllTab
              searchResults={infiniteSearchResults}
              searchQuery={debouncedQuery}
              mockMessages={filteredMessages}
              mockContacts={filteredContacts}
              setActiveTab={setActiveTab}
              onItemPress={onItemPress}
            />

            {!hasResults && renderEmptyState()}
          </>
        )}
      </ScrollView>
    )
  }

  return (
    <View className='flex-1 bg-background'>
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

      <View className='flex-1'>{renderContent()}</View>
    </View>
  )
}
