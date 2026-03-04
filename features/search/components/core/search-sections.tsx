import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View, FlatList } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SearchResultSkeleton } from './search-result-skeleton'

interface SearchSectionProps<T> {
  title: string
  count?: string | number
  items: T[]
  searchQuery: string
  onSeeMore?: () => void
  renderItem: (item: T) => React.ReactNode
  onItemPress: (item: T) => void
  onEndReached?: () => void
  isFetchingNextPage?: boolean
  scrollEnabled?: boolean
}

export function SearchSection<T extends { id: string }>({
  title,
  count,
  items,
  onSeeMore,
  renderItem,
  onEndReached,
  isFetchingNextPage,
  scrollEnabled = false
}: SearchSectionProps<T>) {
  const { t } = useTranslation()

  if (items.length === 0) return null

  if (onSeeMore || items.length < 10) {
    return (
      <View className='bg-background mb-2'>
        <View className='px-4 py-3 flex-row justify-between items-center'>
          <Text className='text-foreground font-bold text-sm'>
            {title} {count !== undefined && <Text className='text-muted-foreground font-normal'>({count})</Text>}
          </Text>
        </View>

        {items.map((item) => (
          <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
        ))}

        {onSeeMore && (
          <TouchableOpacity
            onPress={onSeeMore}
            className='py-4 flex-row items-center justify-center border-t border-divider'
          >
            <Text className='text-muted-foreground mr-1 text-[13px]'>{t('search.sections.seeMore')}</Text>
            <Ionicons name='chevron-forward' size={14} className='text-muted-foreground' />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View className='bg-background flex-1'>
      <View className='px-4 py-3 flex-row justify-between items-center bg-background z-10'>
        <Text className='text-foreground font-bold text-sm'>
          {title} {count !== undefined && <Text className='text-muted-foreground font-normal'>({count})</Text>}
        </Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <>{renderItem(item)}</>}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.8}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className='pb-10'>
              <SearchResultSkeleton />
              <SearchResultSkeleton />
              <SearchResultSkeleton />
            </View>
          ) : null
        }
        scrollEnabled={scrollEnabled}
      />
    </View>
  )
}
