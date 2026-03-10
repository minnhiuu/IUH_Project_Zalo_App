import React from 'react'
import { useTranslation } from 'react-i18next'
import { SearchSection } from '../core/search-sections'
import { ContactItem } from './contact-item'

interface ContactsTabProps {
  mockContacts: any[]
  searchQuery: string
  onItemPress: (item: any) => void
  preview?: boolean
  onSeeMore?: () => void
}

export function ContactsTab({ mockContacts, searchQuery, onItemPress, preview = false, onSeeMore }: ContactsTabProps) {
  const { t } = useTranslation()

  const items = preview ? mockContacts.slice(0, 2) : mockContacts

  return (
    <SearchSection
      title={t('search.sections.contacts')}
      count={mockContacts.length > 99 ? '99+' : mockContacts.length}
      items={items}
      searchQuery={searchQuery}
      onItemPress={onItemPress}
      renderItem={(item) => <ContactItem item={item} searchQuery={searchQuery} onPress={onItemPress} />}
      onSeeMore={preview ? onSeeMore : undefined}
      scrollEnabled={!preview}
    />
  )
}
