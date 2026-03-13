import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { BaseSearchResultItem, HighlightText } from '../core/search-result-item'

export interface MessageItem {
  id: string
  senderName: string
  time: string
  lastMessage: string
  matchCount: string
}

export function MessageSearchResult({
  item,
  searchQuery,
  onPress
}: {
  item: MessageItem
  searchQuery: string
  onPress: (item: MessageItem) => void
}) {
  return (
    <BaseSearchResultItem item={item} onPress={onPress} avatarName={item.senderName}>
      <View className='flex-row justify-between items-center mb-1'>
        <Text className='text-foreground font-medium'>{item.senderName}</Text>
        <Text className='text-muted-foreground text-xs'>{item.time}</Text>
      </View>

      <HighlightText
        text={item.lastMessage}
        highlight={searchQuery}
        className='text-muted-foreground text-xs line-clamp-2'
        highlightClassName='text-primary font-medium'
      />

      <TouchableOpacity className='flex-row items-center mt-1'>
        <Text className='text-muted-foreground text-xs'>{item.matchCount} matching results</Text>
        <Ionicons name='chevron-forward' size={12} color='#99A' />
      </TouchableOpacity>
    </BaseSearchResultItem>
  )
}
