import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const phoneMatchItem = searchResults?.pages
    ?.flatMap((page: any) => page.data)
    ?.find((item: any) => item.phoneNumber)

  return (
    <>
      {phoneMatchItem && (
        <View className='px-4 py-3 bg-background border-b border-divider'>
          <Text className='text-sm font-bold text-foreground'>{t('search.findByPhone')}</Text>
        </View>
      )}
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
