import React from 'react'
import { SearchResultItem } from '../core/search-result-item'
import { ConversationSearchResponse } from '../../schemas'

interface ContactItemProps {
  item: ConversationSearchResponse
  searchQuery: string
  onPress: (item: ConversationSearchResponse) => void
}

export function ContactItem({ item, searchQuery, onPress }: ContactItemProps) {
  return <SearchResultItem item={item} searchQuery={searchQuery} onPress={onPress} />
}
