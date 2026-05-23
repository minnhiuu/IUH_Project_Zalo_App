import { UserAvatar } from '@/components/common/user-avatar'
import { UserResponse, UserSummaryResponse } from '@/features/users'
import { ConversationSearchResponse, UserSearchResponse } from '../../schemas'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/theme-context'

export interface ContactItemType {
  id: string
  fullName: string
  email: string
  avatar?: string | null
}

export type SearchResultItemData = UserResponse | ContactItemType | UserSummaryResponse
export type SearchPersonResultItemData = SearchResultItemData | UserSearchResponse | ConversationSearchResponse

export function HighlightText({
  text,
  highlight,
  className = 'text-foreground font-medium',
  highlightClassName = 'text-primary'
}: {
  text: string
  highlight: string
  className?: string
  highlightClassName?: string
}) {
  if (!highlight.trim()) return <Text className={className}>{text}</Text>

  if (text.includes('<em>') && text.includes('</em>')) {
    const parts = text.split(/(<em>.*?<\/em>)/gi)
    return (
      <Text className={className}>
        {parts.map((part, i) => {
          const match = part.match(/^<em>(.*?)<\/em>$/i)
          return match ? (
            <Text key={i} className={highlightClassName}>
              {match[1]}
            </Text>
          ) : (
            part
          )
        })}
      </Text>
    )
  }

  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'))
  return (
    <Text className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={i} className={highlightClassName}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  )
}

export interface BaseSearchResultItemProps<T> {
  item: T
  onPress: (item: T) => void
  avatar?: string | null
  avatarName?: string
  alignAvatarTop?: boolean
  compact?: boolean
  action?: React.ReactNode
  children?: React.ReactNode
}

export function BaseSearchResultItem<T>({
  item,
  onPress,
  avatar,
  avatarName,
  alignAvatarTop = false,
  compact = false,
  action,
  children
}: BaseSearchResultItemProps<T>) {
  return (
    <TouchableOpacity
      className={`flex-row bg-background pl-4 ${alignAvatarTop ? 'items-start' : 'items-center'}`}
      onPress={() => onPress(item)}
    >
      <UserAvatar
        size='lg'
        source={avatar}
        name={avatarName}
        className={`mr-4 ${alignAvatarTop ? (compact ? 'mt-3' : 'mt-5') : ''}`}
      />
      <View className={`flex-1 flex-row items-center pr-4 border-b border-divider ${compact ? 'py-3' : 'py-5'}`}>
        <View className='flex-1 justify-center'>{children}</View>
        {action}
      </View>
    </TouchableOpacity>
  )
}

export interface SearchResultItemProps<T extends SearchPersonResultItemData> {
  item: T
  searchQuery: string
  onPress: (item: T) => void
  action?: React.ReactNode
  subtitle?: React.ReactNode
}

export function SearchResultItem<T extends SearchPersonResultItemData>({
  item,
  searchQuery,
  onPress,
  action,
  subtitle
}: SearchResultItemProps<T>) {
  const { isDark } = useTheme()

  const getAvatar = (item: SearchPersonResultItemData) => {
    if ('avatar' in item) {
      return item.avatar || undefined
    }
    return undefined
  }

  const avatar = getAvatar(item)
  const title = 'fullName' in item ? item.fullName : 'name' in item ? item.name : ''

  const defaultAction = (
    <TouchableOpacity
      style={{
        backgroundColor: isDark ? '#2C323A' : '#F0F8FF',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Ionicons name='call' size={18} color='#0068FF' />
    </TouchableOpacity>
  )

  const { t } = useTranslation()

  return (
    <BaseSearchResultItem
      item={item}
      onPress={onPress}
      avatar={avatar}
      avatarName={title}
      action={action !== undefined ? action : defaultAction}
    >
      <View>
        <HighlightText text={title} highlight={searchQuery} />
        {'phoneNumber' in item && item.phoneNumber && (
          <Text className='text-xs text-muted-foreground mt-1'>
            {t('search.phoneNumber')} <Text className='text-primary'>{item.phoneNumber}</Text>
          </Text>
        )}
        {subtitle}
      </View>
    </BaseSearchResultItem>
  )
}
