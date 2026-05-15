import React from 'react'
import { useTranslation } from 'react-i18next'
import { SearchSection } from '../core/search-sections'
import { ContactItem } from './contact-item'
import { ConversationSearchResponse } from '../../schemas'
import { InfiniteData } from '@tanstack/react-query'
import { PageResponse } from '@/types/common.types'

interface ContactsTabProps {
  searchResults: InfiniteData<PageResponse<ConversationSearchResponse[]>> | undefined
  searchQuery: string
  onItemPress: (item: ConversationSearchResponse) => void
  fetchNextPage?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  preview?: boolean
  onSeeMore?: () => void
  isLoading?: boolean
}

export function ContactsTab({
  searchResults,
  searchQuery,
  onItemPress,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  preview = false,
  onSeeMore,
  isLoading = false
}: ContactsTabProps) {
  const { t } = useTranslation()

  const allItems = searchResults?.pages ? searchResults.pages.flatMap((page) => page.data) : []
  const items = preview ? allItems.slice(0, 3) : allItems
  const totalCount = searchResults?.pages?.[0]?.totalItems || items.length

  return (
    <SearchSection
      title={t('search.sections.contacts')}
      count={totalCount > 99 ? '99+' : totalCount}
      items={items}
      searchQuery={searchQuery}
      onItemPress={onItemPress}
      renderItem={(item) => <ContactItem item={item} searchQuery={searchQuery} onPress={onItemPress} />}
      onEndReached={() => {
        if (!preview && hasNextPage && fetchNextPage) {
          fetchNextPage()
        }
      }}
      isFetchingNextPage={!preview && isFetchingNextPage}
      isLoading={isLoading}
      onSeeMore={preview ? onSeeMore : undefined}
      scrollEnabled={!preview}
    />
  )
}
