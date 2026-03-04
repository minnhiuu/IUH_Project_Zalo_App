import { UserSummaryResponse } from '@/features/users'
import { PageResponse } from '@/types/common.types'
import { InfiniteData } from '@tanstack/react-query'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SearchSection } from '../core/search-sections'
import { DiscoverItem } from './discover-item'

interface DiscoverTabProps {
  searchResults: InfiniteData<PageResponse<UserSummaryResponse[]>> | undefined
  searchQuery: string
  onItemPress: (item: UserSummaryResponse) => void
  fetchNextPage?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  preview?: boolean
  onSeeMore?: () => void
}

export function DiscoverTab({
  searchResults,
  searchQuery,
  onItemPress,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  preview = false,
  onSeeMore
}: DiscoverTabProps) {
  const { t } = useTranslation()

  const allItems = searchResults?.pages ? searchResults.pages.flatMap((page) => page.data) : []
  const items = preview ? allItems.slice(0, 5) : allItems

  const totalCount = searchResults?.pages?.[0]?.totalItems || items.length

  return (
    <SearchSection
      title={t('search.sections.discover')}
      count={totalCount > 99 ? '99+' : totalCount}
      items={items}
      searchQuery={searchQuery}
      onItemPress={onItemPress}
      renderItem={(item) => <DiscoverItem item={item} searchQuery={searchQuery} onPress={() => onItemPress(item)} />}
      onEndReached={() => {
        if (!preview && hasNextPage && fetchNextPage) {
          fetchNextPage()
        }
      }}
      isFetchingNextPage={!preview && isFetchingNextPage}
      onSeeMore={preview ? onSeeMore : undefined}
      scrollEnabled={!preview}
    />
  )
}
