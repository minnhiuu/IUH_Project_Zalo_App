import React from 'react'
import { ContactsTab } from '../contacts/contacts-tab'
import { DiscoverTab } from '../discover/discover-tab'
import { MessagesTab } from '../messages/messages-tab'

interface AllTabProps {
  searchResults: any
  mockContacts: any[]
  searchQuery: string
  mockMessages: any[]
  setActiveTab: (tab: any) => void
  onItemPress: (item: any) => void
}

export function AllTab({
  searchResults,
  searchQuery,
  mockMessages,
  mockContacts,
  setActiveTab,
  onItemPress
}: AllTabProps) {
  return (
    <>
      <ContactsTab
        mockContacts={mockContacts}
        searchQuery={searchQuery}
        onItemPress={onItemPress}
        preview={true}
        onSeeMore={() => setActiveTab('contacts')}
      />

      <MessagesTab
        mockMessages={mockMessages}
        searchQuery={searchQuery}
        onItemPress={onItemPress}
        preview={true}
        onSeeMore={() => setActiveTab('messages')}
      />

      <DiscoverTab
        searchResults={searchResults}
        searchQuery={searchQuery}
        onItemPress={onItemPress}
        preview={true}
        onSeeMore={() => setActiveTab('discover')}
      />
    </>
  )
}
