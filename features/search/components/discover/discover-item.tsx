import { UserSummaryResponse } from '@/features/user'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SearchResultItem } from '@/features/search/components/core/search-result-item'

interface DiscoverItemProps {
  item: UserSummaryResponse
  searchQuery: string
  onPress: (item: UserSummaryResponse) => void
}

export function DiscoverItem({ item, searchQuery, onPress }: DiscoverItemProps) {
  const { t } = useTranslation()

  const idValue = item.id.charCodeAt(item.id.length - 1)
  const isRequest = idValue % 3 === 0
  const buttonText = isRequest ? t('search.action.accept') : t('search.action.add')
  const buttonStyle = isRequest ? 'bg-primary' : 'bg-blue-50'
  const textStyle = isRequest ? 'text-white' : 'text-primary'

  return (
    <SearchResultItem
      item={item}
      searchQuery={searchQuery}
      onPress={onPress}
      action={
        <TouchableOpacity
          className={`${buttonStyle} px-4 py-1.5 rounded-full items-center justify-center min-w-[80px]`}
          onPress={() => console.log('Action pressed', item.id)}
        >
          <Text className={`${textStyle} font-medium text-xs`}>{buttonText}</Text>
        </TouchableOpacity>
      }
    />
  )
}
