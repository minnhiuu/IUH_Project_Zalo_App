import React from 'react'
import { SearchResultItem, ContactItemType } from '../core/search-result-item'

interface ContactItemProps {
  item: ContactItemType
  searchQuery: string
  onPress: (item: ContactItemType) => void
}

export function ContactItem({ item, searchQuery, onPress }: ContactItemProps) {
  return <SearchResultItem item={item} searchQuery={searchQuery} onPress={onPress} />
}
