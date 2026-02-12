import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View, FlatList, ActivityIndicator } from 'react-native'

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
}

export function SearchSection<T extends { id: string }>({
  title,
  count,
  items,
  // searchQuery,
  onSeeMore,
  renderItem,
  // onItemPress,
  onEndReached,
  isFetchingNextPage,
  scrollEnabled = false
}: SearchSectionProps<T> & { scrollEnabled?: boolean }) {
  if (items.length === 0) return null

  if (onSeeMore || items.length < 10) {
    return (
      <View className='bg-white mb-2'>
        <View className='px-4 py-3 flex-row justify-between items-center'>
          <Text className='text-gray-900 font-bold text-sm'>
            {title} {count !== undefined && <Text className='text-gray-400 font-normal'>({count})</Text>}
          </Text>
        </View>

        {items.map((item) => (
          <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
        ))}

        {onSeeMore && (
          <TouchableOpacity
            onPress={onSeeMore}
            className='py-4 flex-row items-center justify-center border-t border-gray-50'
          >
            <Text className='text-gray-900 font-bold mr-1'>Xem thêm</Text>
            <Ionicons name='chevron-forward' size={16} color='#111827' />
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <View className='bg-white flex-1'>
      <View className='px-4 py-3 flex-row justify-between items-center bg-white z-10'>
        <Text className='text-gray-900 font-bold text-sm'>
          {title} {count !== undefined && <Text className='text-gray-400 font-normal'>({count})</Text>}
        </Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <>{renderItem(item)}</>}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className='py-4'>
              <ActivityIndicator size='small' color='#0068FF' />
            </View>
          ) : null
        }
        scrollEnabled={scrollEnabled}
      />
    </View>
  )
}
