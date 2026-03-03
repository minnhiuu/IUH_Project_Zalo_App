import React from 'react'
import { useTranslation } from 'react-i18next'
import { SearchSection } from '../core/search-sections'
import { MessageSearchResult, MessageItem } from './message-item'

interface MessagesTabProps {
  mockMessages: MessageItem[]
  searchQuery: string
  onItemPress: (item: any) => void
  preview?: boolean
  onSeeMore?: () => void
}

export function MessagesTab({ mockMessages, searchQuery, onItemPress, preview = false, onSeeMore }: MessagesTabProps) {
  const { t } = useTranslation()

  const items = preview ? mockMessages.slice(0, 2) : mockMessages

  return (
    <SearchSection
      title={t('search.sections.messages')}
      count='99+'
      items={items}
      searchQuery={searchQuery}
      renderItem={(item) => <MessageSearchResult item={item} searchQuery={searchQuery} onPress={onItemPress} />}
      onItemPress={onItemPress}
      onSeeMore={preview ? onSeeMore : undefined}
      scrollEnabled={!preview}
    />
  )
}
