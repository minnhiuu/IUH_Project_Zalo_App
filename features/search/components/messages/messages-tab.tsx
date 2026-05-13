import React from 'react'
import { useTranslation } from 'react-i18next'
import { InfiniteData } from '@tanstack/react-query'
import { Text, View } from 'react-native'
import { PageResponse } from '@/types/common.types'
import { SearchSection } from '../core/search-sections'
import { MessageFilterChips } from './message-filter-chips'
import { MessageGroupResult } from './message-group-item'
import { MessageSearchFilter, MessageSearchGroupResponse } from '../../schemas'

interface MessagesTabProps {
  searchResults: InfiniteData<PageResponse<MessageSearchGroupResponse[]>> | undefined
  searchQuery: string
  onItemPress: (item: MessageSearchGroupResponse) => void
  onMatchResultsPress?: (item: MessageSearchGroupResponse) => void
  fetchNextPage?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  preview?: boolean
  onSeeMore?: () => void
  filters?: MessageSearchFilter[]
  onFiltersChange?: (filters: MessageSearchFilter[]) => void
}

export function MessagesTab({
  searchResults,
  searchQuery,
  onItemPress,
  onMatchResultsPress,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  preview = false,
  onSeeMore,
  filters = [],
  onFiltersChange
}: MessagesTabProps) {
  const { t } = useTranslation()

  const allItems = searchResults?.pages ? searchResults.pages.flatMap((page) => page.data) : []
  const items = preview ? allItems.slice(0, 3) : allItems
  const totalCount = searchResults?.pages?.[0]?.totalItems ?? items.length
  const hasActiveFilters = filters.length > 0

  const renderItem = (item: MessageSearchGroupResponse) => (
    <MessageGroupResult
      item={item}
      searchQuery={searchQuery}
      onPress={onItemPress}
      onMatchResultsPress={onMatchResultsPress || onItemPress}
    />
  )

  const filterHeader =
    onFiltersChange ? (
      <MessageFilterChips
        filters={filters}
        onFiltersChange={onFiltersChange}
        labels={{ link: t('search.filters.link'), file: t('search.filters.file') }}
        className='px-4 pb-3 bg-background'
      />
    ) : undefined

  const emptyComponent =
    hasActiveFilters && onFiltersChange ? (
      <View className='py-28 px-4 items-center'>
        <Text className='text-muted-foreground text-base text-center'>{t('search.noFilteredResults')}</Text>
      </View>
    ) : undefined

  return (
    <View className='flex-1 bg-background'>
      <SearchSection
        title={t('search.sections.messages')}
        count={totalCount > 99 ? '99+' : totalCount}
        items={items}
        searchQuery={searchQuery}
        renderItem={renderItem}
        onItemPress={onItemPress}
        onEndReached={() => {
          if (!preview && hasNextPage && fetchNextPage) {
            fetchNextPage()
          }
        }}
        isFetchingNextPage={!preview && isFetchingNextPage}
        onSeeMore={preview ? onSeeMore : undefined}
        scrollEnabled={!preview}
        headerExtra={filterHeader}
        showWhenEmpty={hasActiveFilters && !!onFiltersChange}
        emptyComponent={emptyComponent}
      />
    </View>
  )
}
