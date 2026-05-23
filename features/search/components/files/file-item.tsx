import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { BaseSearchResultItem } from '../core/search-result-item'
import { MessageSearchResponse } from '../../schemas'
import { formatFileSize, SearchFilePreview } from '../messages/message-group-item'
import { formatSearchTime } from '../../utils/format-search-time'
import { resolveMessageResultAvatar, resolveMessageResultTitle } from '../../utils/message-result-display'

export function FileSearchResult({
  item,
  searchQuery,
  onPress,
  compact = false
}: {
  item: MessageSearchResponse
  searchQuery: string
  onPress: (item: MessageSearchResponse) => void
  compact?: boolean
}) {
  const title = resolveMessageResultTitle(item)
  const fileName = item.displayHighlights || item.displayContent || item.type || 'File'
  const subtitle = item.conversationName || item.senderName || ''
  const time = formatSearchTime(item.createdAt)

  return (
    <BaseSearchResultItem
      item={item}
      onPress={onPress}
      avatar={resolveMessageResultAvatar(item)}
      avatarName={title}
      alignAvatarTop
      compact={compact}
    >
      <View className='flex-row justify-between items-center mb-1'>
        <Text className='text-foreground font-medium flex-1 pr-3' numberOfLines={1}>
          {title}
        </Text>
        <Text className='text-muted-foreground text-xs'>{time}</Text>
      </View>

      <SearchFilePreview fileName={fileName} fileSize={formatFileSize(item.size)} searchQuery={searchQuery} />

      {!compact && (
        <TouchableOpacity className='flex-row items-center mt-1'>
          <Text className='text-muted-foreground text-xs' numberOfLines={1}>
            {subtitle}
          </Text>
        </TouchableOpacity>
      )}
    </BaseSearchResultItem>
  )
}
