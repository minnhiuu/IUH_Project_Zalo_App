import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { BaseSearchResultItem, HighlightText } from '../core/search-result-item'
import { MessageSearchResponse } from '../../schemas'
import { SearchFilePreview, SearchLinkPreview, formatFileSize } from './message-group-item'

export function MessageSearchResult({
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
  const content = item.displayHighlights || item.displayContent || ''
  const time = formatSearchTime(item.createdAt)
  const previewType = item.type?.toUpperCase()
  const isFile = previewType === 'FILE' || (item.hasAttachment && !item.hasLink)
  const isLink = previewType === 'LINK' || item.hasLink
  const fileSize = formatFileSize(item.size)

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

      <HighlightText
        text={content}
        highlight={searchQuery}
        className='text-muted-foreground text-sm'
        highlightClassName='bg-[#FFF066] dark:bg-[#FFD700] text-black px-0.5 rounded-sm font-medium'
      />

      {isLink && <SearchLinkPreview preview={content} searchQuery={searchQuery} />}

      {!compact && (
        <TouchableOpacity className='flex-row items-center mt-1'>
          <Text className='text-muted-foreground text-xs'>{item.conversationName || item.senderName}</Text>
        </TouchableOpacity>
      )}
    </BaseSearchResultItem>
  )
}
