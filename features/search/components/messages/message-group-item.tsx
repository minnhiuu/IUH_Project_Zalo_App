import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, TouchableOpacity, View } from 'react-native'
import { UserAvatar } from '@/components/common/user-avatar'
import { getFileInfo } from '@/features/message/components/file-badge'
import { useAuthStore } from '@/store'
import { HighlightText } from '../core/search-result-item'
import { MessageSearchGroupResponse } from '../../schemas'
import { formatSearchTime } from '../../utils/format-search-time'

export const formatFileSize = (bytes?: number | null) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${Math.round(bytes / (1024 * 1024))} MB`
}

const stripHighlightTags = (value: string) => value.replace(/<\/?em>/g, '')

const getDomain = (value: string) => {
  const match = stripHighlightTags(value).match(/https?:\/\/[^\s]+/i)
  if (!match) return ''
  try {
    return new URL(match[0]).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function SearchFilePreview({
  fileName,
  fileSize,
  searchQuery
}: {
  fileName: string
  fileSize: string
  searchQuery: string
}) {
  const { badgeColor, label } = getFileInfo(stripHighlightTags(fileName))

  return (
    <View className='mt-2 flex-row items-center rounded-md border border-divider px-3 py-3'>
      <View
        style={{
          width: 44,
          height: 48,
          borderRadius: 6,
          backgroundColor: badgeColor,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{label}</Text>
      </View>
      <View className='ml-3 flex-1'>
        <HighlightText
          text={fileName}
          highlight={searchQuery}
          className='text-foreground font-medium text-sm'
          highlightClassName='bg-[#FFF066] dark:bg-[#FFD700] text-black px-0.5 rounded-sm font-semibold'
        />
        {!!fileSize && <Text className='text-muted-foreground text-xs mt-1'>{fileSize}</Text>}
      </View>
    </View>
  )
}

export function SearchLinkPreview({ preview, searchQuery }: { preview: string; searchQuery: string }) {
  const domain = getDomain(preview)
  const title = domain || stripHighlightTags(preview)

  return (
    <View className='mt-2 rounded-md border border-divider px-3 py-3'>
      <View className='flex-row'>
        <View className='w-12 h-12 rounded-md bg-background-secondary items-center justify-center mr-3'>
          <Ionicons name='link-outline' size={18} color='#9AA3AF' />
        </View>
        <View className='flex-1'>
          {!!domain && <Text className='text-primary text-sm font-medium mb-1'>{domain}</Text>}
          <HighlightText
            text={title}
            highlight={searchQuery}
            className='text-foreground font-semibold text-sm'
            highlightClassName='text-primary font-semibold'
          />
          <HighlightText
            text={preview}
            highlight={searchQuery}
            className='text-muted-foreground text-xs mt-1'
            highlightClassName='text-primary font-medium'
          />
        </View>
      </View>
    </View>
  )
}

export function MessageGroupResult({
  item,
  searchQuery,
  onPress,
  onMatchResultsPress
}: {
  item: MessageSearchGroupResponse
  searchQuery: string
  onPress: (item: MessageSearchGroupResponse) => void
  onMatchResultsPress: (item: MessageSearchGroupResponse) => void
}) {
  const { t } = useTranslation()
  const currentUserName = useAuthStore((state) => state.user?.fullName?.trim())
  const participantNames = item.participantNames?.filter((name): name is string => !!name?.trim()) ?? []
  const directParticipantTitle = participantNames.find((name) => name.trim() !== currentUserName)
  const fallbackTitle = item.isGroup ? participantNames.join(', ') : directParticipantTitle
  const title = (item.isGroup ? item.title : directParticipantTitle || item.title) || fallbackTitle || t('search.unknownConversation')
  const preview = item.previewHighlights || item.previewContent || ''
  const time = formatSearchTime(item.lastMatchedAt)
  const matchCount = item.matchCount > 99 ? '99+' : item.matchCount
  const previewType = item.previewType?.toUpperCase()
  const isFile = previewType === 'FILE' || (item.hasAttachment && !item.hasLink)
  const isLink = previewType === 'LINK' || item.hasLink
  const fileSize = formatFileSize(item.size)

  return (
    <View className='flex-row bg-background pl-4 items-start'>
      <TouchableOpacity activeOpacity={0.75} onPress={() => onPress(item)} className='mt-5 mr-4'>
        <UserAvatar size='lg' source={item.avatar} name={title} />
      </TouchableOpacity>

      <View className='flex-1 pr-4 border-b border-divider py-5'>
        <TouchableOpacity activeOpacity={0.75} onPress={() => onPress(item)}>
          <View className='flex-row justify-between items-center mb-1'>
            <Text className='text-foreground font-medium flex-1 pr-3' numberOfLines={1}>
              {title}
            </Text>
            <Text className='text-muted-foreground text-xs'>{time}</Text>
          </View>

          {isFile ? (
            <SearchFilePreview
              fileName={preview || t('search.filters.file')}
              fileSize={fileSize}
              searchQuery={searchQuery}
            />
          ) : isLink ? (
            <>
              <HighlightText
                text={preview}
                highlight={searchQuery}
                className='text-muted-foreground text-sm'
                highlightClassName='bg-[#FFF066] dark:bg-[#FFD700] text-black px-0.5 rounded-sm font-medium'
              />
              <SearchLinkPreview preview={preview} searchQuery={searchQuery} />
            </>
          ) : (
            <HighlightText
              text={preview}
              highlight={searchQuery}
              className='text-muted-foreground text-sm'
              highlightClassName='bg-[#FFF066] dark:bg-[#FFD700] text-black px-0.5 rounded-sm font-medium'
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onMatchResultsPress(item)}
          className='flex-row items-center mt-2 self-start'
        >
          <Text className='text-sm'>
            <Text className='text-primary font-semibold'>{matchCount}</Text>
            <Text className='text-foreground'> {t('search.matchingResults')}</Text>
          </Text>
          <Ionicons name='chevron-forward' size={18} color='#99A' />
        </TouchableOpacity>
      </View>
    </View>
  )
}
