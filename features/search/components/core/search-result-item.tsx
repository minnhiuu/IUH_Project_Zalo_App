import { UserAvatar } from '@/components/common/user-avatar'
import { UserResponse, UserSummaryResponse } from '@/features/users'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '@/context/theme-context'

export interface ContactItemType {
  id: string
  fullName: string
  email: string
  avatar?: string | null
}

export type SearchResultItemData = UserResponse | ContactItemType | UserSummaryResponse

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

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
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
  action?: React.ReactNode
  children?: React.ReactNode
}

export function BaseSearchResultItem<T>({
  item,
  onPress,
  avatar,
  avatarName,
  action,
  children
}: BaseSearchResultItemProps<T>) {
  return (
    <TouchableOpacity className='flex-row items-center bg-background pl-4' onPress={() => onPress(item)}>
      <UserAvatar size='lg' source={avatar} name={avatarName} className='mr-4' />
      <View className='flex-1 flex-row items-center pr-4 py-5 border-b border-divider'>
        <View className='flex-1 justify-center'>{children}</View>
        {action}
      </View>
    </TouchableOpacity>
  )
}

export interface SearchResultItemProps<T extends SearchResultItemData> {
  item: T
  searchQuery: string
  onPress: (item: T) => void
  action?: React.ReactNode
}

export function SearchResultItem<T extends SearchResultItemData>({
  item,
  searchQuery,
  onPress,
  action
}: SearchResultItemProps<T>) {
  const { isDark } = useTheme()

  const getAvatar = (item: SearchResultItemData) => {
    if ('avatar' in item) {
      return item.avatar || undefined
    }
    return undefined
  }

  const avatar = getAvatar(item)

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

  return (
    <BaseSearchResultItem
      item={item}
      onPress={onPress}
      avatar={avatar}
      avatarName={item.fullName}
      action={action || defaultAction}
    >
      <HighlightText text={item.fullName || ''} highlight={searchQuery} />
    </BaseSearchResultItem>
  )
}
