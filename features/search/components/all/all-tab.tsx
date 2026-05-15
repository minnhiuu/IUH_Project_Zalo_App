import { View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ContactsTab } from '../contacts/contacts-tab'
import { DiscoverTab } from '../discover/discover-tab'
import { MessagesTab } from '../messages/messages-tab'
import { MessageSearchFilter } from '../../schemas'

interface AllTabProps {
  userResults: any
  contactResults: any
  messageResults: any
  searchQuery: string
  setActiveTab: (tab: any) => void
  onItemPress: (item: any) => void
  onMessageMatchResultsPress?: (item: any) => void
  messageFilters?: MessageSearchFilter[]
  onMessageFiltersChange?: (filters: MessageSearchFilter[]) => void
  isSearchingUsers?: boolean
  isSearchingContacts?: boolean
  isSearchingMessages?: boolean
}

export function AllTab({
  userResults,
  contactResults,
  messageResults,
  searchQuery,
  setActiveTab,
  onItemPress,
  onMessageMatchResultsPress,
  messageFilters,
  onMessageFiltersChange,
  isSearchingUsers,
  isSearchingContacts,
  isSearchingMessages
}: AllTabProps) {
  const { t } = useTranslation()
  const phoneMatchItem = userResults?.pages?.flatMap((page: any) => page.data)?.find((item: any) => item.phoneNumber)

  return (
    <>
      {phoneMatchItem && (
        <View className='px-4 py-3 bg-background border-b border-divider'>
          <Text className='text-sm font-bold text-foreground'>{t('search.findByPhone')}</Text>
        </View>
      )}
      <ContactsTab
        searchResults={contactResults}
        searchQuery={searchQuery}
        onItemPress={onItemPress}
        preview={true}
        onSeeMore={() => setActiveTab('contacts')}
        isLoading={isSearchingContacts}
      />

      <MessagesTab
        searchResults={messageResults}
        searchQuery={searchQuery}
        onItemPress={onItemPress}
        onMatchResultsPress={onMessageMatchResultsPress}
        preview={true}
        onSeeMore={() => setActiveTab('messages')}
        filters={messageFilters}
        onFiltersChange={onMessageFiltersChange}
        isLoading={isSearchingMessages}
      />

      <DiscoverTab
        searchResults={userResults}
        searchQuery={searchQuery}
        onItemPress={onItemPress}
        preview={true}
        onSeeMore={() => setActiveTab('discover')}
        isLoading={isSearchingUsers}
      />
    </>
  )
}
