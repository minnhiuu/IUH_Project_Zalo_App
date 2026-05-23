import { SearchTopBar } from '@/components'
import {
  useInfiniteSearchContacts,
  useInfiniteSearchMessageGroups,
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
import { ScrollView, Text, TextInput, View, Keyboard, Animated } from 'react-native'
import { AllTab } from './all/all-tab'
import { ContactsTab } from './contacts/contacts-tab'
import { MessagesTab } from './messages/messages-tab'
import { DiscoverTab } from './discover/discover-tab'
import { DiscoverItem } from './discover/discover-item'
import { ContactItem } from './contacts/contact-item'
import { RecentSearchList } from './recent-search-list'
import {
  ConversationSearchResponse,
  MessageSearchGroupResponse,
  MessageSearchFilter,
  MessageSearchResponse,
  RecentSearchResponse,
  UserSearchResponse
} from '../schemas/search-schema'
import { SearchType } from '@/constants/enum'
import { searchApi } from '../api'
import { SearchResultSkeleton } from './core/search-result-skeleton'

export type SearchTab = 'all' | 'contacts' | 'messages' | 'discover'

const toRouteParam = (value: unknown) => {
  if (value === null || value === undefined) return undefined
  return String(value)
}

const routeParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, toRouteParam(value)] as const)
      .filter((entry): entry is [string, string] => entry[1] !== undefined)
  )

export function Search() {
  const router = useRouter()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<SearchTab>('all')
  const [messageFilters, setMessageFilters] = useState<MessageSearchFilter[]>([])
  const debouncedQuery = useDebounce(searchQuery, 300)
  const inputRef = useRef<TextInput>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const normalizedQuery = searchQuery.trim()
  const isPhoneSearch = /^\+?\d{8,15}$/.test(normalizedQuery.replace(/[\s.-]/g, ''))
  const shouldSearchUsers = isPhoneSearch || activeTab === 'all' || activeTab === 'discover'
  const shouldSearchContacts = isPhoneSearch || activeTab === 'all' || activeTab === 'contacts'
  const shouldSearchMessages = !isPhoneSearch && (activeTab === 'all' || activeTab === 'messages')

  const {
    data: userSearchResults,
    fetchNextPage: fetchNextUsersPage,
    hasNextPage: hasNextUsersPage,
    isFetchingNextPage: isFetchingNextUsersPage,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers
  } = useInfiniteSearchUsers(debouncedQuery, shouldSearchUsers)
  const {
    data: contactSearchResults,
    fetchNextPage: fetchNextContactsPage,
    hasNextPage: hasNextContactsPage,
    isFetchingNextPage: isFetchingNextContactsPage,
    isFetching: isFetchingContacts,
    isLoading: isLoadingContacts
  } = useInfiniteSearchContacts(debouncedQuery, undefined, shouldSearchContacts)
  const {
    data: messageSearchResults,
    fetchNextPage: fetchNextMessagesPage,
    hasNextPage: hasNextMessagesPage,
    isFetchingNextPage: isFetchingNextMessagesPage,
    isFetching: isFetchingMessages,
    isLoading: isLoadingMessages
  } = useInfiniteSearchMessageGroups(debouncedQuery, shouldSearchMessages ? messageFilters : [], shouldSearchMessages)

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
      id: isSelfPhone ? myProfile.id : trimmedQuery,
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
    { key: 'discover', label: t('search.tabs.discover') }
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
    <View className='bg-background py-2'>
      <SearchResultSkeleton />
      <SearchResultSkeleton />
      <SearchResultSkeleton />
    </View>
  )

  const onItemPress = (
    item: UserSearchResponse | ConversationSearchResponse | MessageSearchResponse | MessageSearchGroupResponse
  ) => {
    // Always save the keyword when an item is selected
    if (debouncedQuery.trim()) {
      addRecentSearch.mutate({
        id: debouncedQuery.trim(),
        name: debouncedQuery.trim(),
        type: SearchType.Keyword
      })
    }

    if ('fullName' in item) {
      const rank = userSearchResults?.pages.flatMap((page) => page.data).findIndex((user) => user.id === item.id) ?? -1
      searchApi
        .recordUserClick({
          keyword: debouncedQuery,
          targetUserId: item.id,
          rank: Math.max(rank, 0),
          eventType: 'USER_RESULT_CLICK'
        })
        .catch(() => undefined)

      addRecentSearch.mutate({
        id: item.id,
        name: item.fullName,
        avatar: item.avatar ?? null,
        type: SearchType.User
      })
      router.push(`/user-profile/${item.id}` as any)
      return
    }

    if ('conversationId' in item && 'matchCount' in item) {
      const conversationId = toRouteParam(item.conversationId)
      if (!conversationId) return

      addRecentSearch.mutate({
        id: conversationId,
        name: item.title || '',
        avatar: item.avatar || null,
        type: item.isGroup ? SearchType.Group : SearchType.User
      })

      router.push({
        pathname: '/chat/[id]',
        params: routeParams({
          id: conversationId,
          conversationId,
          name: item.title,
          searchKeyword: debouncedQuery,
          isSearchMode: 'true',
          aroundMessageId: item.messageId
        })
      } as any)
      return
    }

    if ('conversationId' in item && !('messageId' in item)) {
      const conversationId = toRouteParam(item.conversationId)
      const recipientId = toRouteParam(item.recipientId)
      if (!conversationId && !recipientId) return

      if (!conversationId && recipientId) {
        router.push(`/user-profile/${recipientId}` as any)
        return
      }

      addRecentSearch.mutate({
        id: conversationId || recipientId || '',
        name: item.name,
        avatar: item.avatar || null,
        type: item.group ? SearchType.Group : SearchType.User
      })

      router.push({
        pathname: '/chat/[id]',
        params: routeParams({
          id: conversationId,
          conversationId,
          name: item.name
        })
      } as any)
      return
    }

    if ('messageId' in item) {
      const conversationId = toRouteParam(item.conversationId)
      const messageId = toRouteParam(item.messageId)
      if (!conversationId || !messageId) return

      addRecentSearch.mutate({
        id: conversationId,
        name: item.conversationName || item.senderName || '',
        avatar: item.conversationAvatar || item.senderAvatar || null,
        type: item.isGroup ? SearchType.Group : SearchType.User
      })

      router.push({
        pathname: '/chat/[id]',
        params: routeParams({
          id: conversationId,
          conversationId,
          isSearchMode: 'true',
          aroundMessageId: messageId,
          searchKeyword: debouncedQuery
        })
      } as any)
    }
  }

  const openMessageMatchResults = (item: MessageSearchGroupResponse) => {
    const conversationId = toRouteParam(item.conversationId)
    if (!conversationId) return

    router.push({
      pathname: '/search/message-results',
      params: routeParams({
        conversationId,
        title: item.title,
        keyword: debouncedQuery,
        filters: messageFilters.join(',')
      })
    } as any)
  }

  const hasResults = [userSearchResults, contactSearchResults, messageSearchResults].some((result) =>
    result?.pages?.some((page) => page?.data && page.data.length > 0)
  )

  const isLoadingAll = isLoadingUsers && isLoadingContacts && isLoadingMessages
  const isDebouncingSearch = !!normalizedQuery && normalizedQuery !== debouncedQuery
  const isSearchingUsers = isDebouncingSearch || (isFetchingUsers && !isFetchingNextUsersPage)
  const isSearchingContacts = isDebouncingSearch || (isFetchingContacts && !isFetchingNextContactsPage)
  const isSearchingMessages = isDebouncingSearch || (isFetchingMessages && !isFetchingNextMessagesPage)
  const isSearchingAll = isDebouncingSearch || isSearchingUsers || isSearchingContacts || isSearchingMessages
  const phoneUserResult = userSearchResults?.pages?.flatMap((page) => page.data).find((item) => item.phoneNumber)
  const phoneContactResult = contactSearchResults?.pages?.flatMap((page) => page.data).find((item) => item.phoneNumber)

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

    if (isPhoneSearch && debouncedQuery) {
      return (
        <ScrollView
          className='flex-1 bg-background-secondary'
          keyboardShouldPersistTaps='handled'
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          {(isSearchingUsers || isSearchingContacts) && renderLoading()}
          {!isSearchingUsers && !isSearchingContacts && (
            <>
              <View className='px-4 py-3 bg-background border-b border-divider'>
                <Text className='text-sm font-bold text-foreground'>{t('search.findByPhone')}</Text>
              </View>
              {phoneUserResult ? (
                <DiscoverItem item={phoneUserResult} searchQuery={debouncedQuery} onPress={onItemPress} />
              ) : phoneContactResult ? (
                <ContactItem item={phoneContactResult} searchQuery={debouncedQuery} onPress={onItemPress} />
              ) : (
                renderEmptyState()
              )}
            </>
          )}
        </ScrollView>
      )
    }

    if (activeTab === 'discover') {
      return (
        <View className='flex-1 bg-background-secondary'>
          {isSearchingUsers ? (
            renderLoading()
          ) : (
            <DiscoverTab
              searchResults={userSearchResults}
              searchQuery={searchQuery}
              onItemPress={onItemPress}
              fetchNextPage={fetchNextUsersPage}
              hasNextPage={hasNextUsersPage}
              isFetchingNextPage={isFetchingNextUsersPage}
            />
          )}
        </View>
      )
    }

    if (activeTab === 'contacts') {
      return (
        <View className='flex-1 bg-background-secondary'>
          {isSearchingContacts ? (
            renderLoading()
          ) : (
            <ContactsTab
              searchResults={contactSearchResults}
              searchQuery={searchQuery}
              onItemPress={onItemPress}
              fetchNextPage={fetchNextContactsPage}
              hasNextPage={hasNextContactsPage}
              isFetchingNextPage={isFetchingNextContactsPage}
            />
          )}
        </View>
      )
    }

    if (activeTab === 'messages') {
      return (
        <View className='flex-1 bg-background-secondary'>
          {isSearchingMessages ? (
            renderLoading()
          ) : (
            <MessagesTab
              searchResults={messageSearchResults}
              searchQuery={searchQuery}
              onItemPress={onItemPress}
              onMatchResultsPress={openMessageMatchResults}
              fetchNextPage={fetchNextMessagesPage}
              hasNextPage={hasNextMessagesPage}
              isFetchingNextPage={isFetchingNextMessagesPage}
              filters={messageFilters}
              onFiltersChange={setMessageFilters}
            />
          )}
        </View>
      )
    }

    return (
      <ScrollView
        className='flex-1 bg-background-secondary'
        keyboardShouldPersistTaps='handled'
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        {isLoadingAll && normalizedQuery && renderLoading()}
        {debouncedQuery && (
          <>
            <AllTab
              userResults={userSearchResults}
              contactResults={contactSearchResults}
              messageResults={messageSearchResults}
              searchQuery={debouncedQuery}
              setActiveTab={setActiveTab}
              onItemPress={onItemPress}
              onMessageMatchResultsPress={openMessageMatchResults}
              messageFilters={messageFilters}
              onMessageFiltersChange={setMessageFilters}
              isSearchingUsers={isSearchingUsers}
              isSearchingContacts={isSearchingContacts}
              isSearchingMessages={isSearchingMessages}
            />

            {!isSearchingAll && !hasResults && renderEmptyState()}
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
