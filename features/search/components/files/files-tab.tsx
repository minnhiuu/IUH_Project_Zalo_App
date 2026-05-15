import React from 'react'
import { useTranslation } from 'react-i18next'
import { InfiniteData } from '@tanstack/react-query'
import { PageResponse } from '@/types/common.types'
import { SearchSection } from '../core/search-sections'
import { MessageSearchResponse } from '../../schemas'
import { FileSearchResult } from './file-item'

interface FilesTabProps {
  searchResults: InfiniteData<PageResponse<MessageSearchResponse[]>> | undefined
  searchQuery: string
  onItemPress: (item: MessageSearchResponse) => void
  fetchNextPage?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  preview?: boolean
  onSeeMore?: () => void
}

export function FilesTab({
  searchResults,
  searchQuery,
  onItemPress,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  preview = false,
  onSeeMore
}: FilesTabProps) {
  const { t } = useTranslation()

  const allItems = searchResults?.pages ? searchResults.pages.flatMap((page) => page.data) : []
  const items = preview ? allItems.slice(0, 3) : allItems
  const totalCount = searchResults?.pages?.[0]?.totalItems || items.length

  return (
    <SearchSection
      title={t('search.sections.files')}
      count={totalCount > 99 ? '99+' : totalCount}
      items={items}
      searchQuery={searchQuery}
      renderItem={(item) => <FileSearchResult item={item} searchQuery={searchQuery} onPress={onItemPress} />}
      onItemPress={onItemPress}
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
