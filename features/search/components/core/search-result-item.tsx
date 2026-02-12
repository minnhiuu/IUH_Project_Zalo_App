import { UserAvatar } from '@/components/common/user-avatar'
import { UserResponse } from '@/features/user'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export interface ContactItemType {
  id: string
  fullName: string
  email: string
  avatar?: string | null
}

export type SearchResultItemData = UserResponse | ContactItemType

export function HighlightText({
  text,
  highlight,
  className = 'text-gray-900 font-medium',
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
    <TouchableOpacity className='flex-row items-center bg-white pl-4' onPress={() => onPress(item)}>
      <UserAvatar size='lg' source={avatar} name={avatarName} className='mr-4' />
      <View className='flex-1 flex-row items-center pr-4 py-5 border-b border-gray-50'>
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
  /* const getEmail = (item: SearchResultItemData) => {
    if ('accountInfo' in item) {
      return item.accountInfo?.email
    }
    return (item as ContactItemType).email
  } */

  const getAvatar = (item: SearchResultItemData) => {
    if ('avatar' in item) {
      return (item as ContactItemType).avatar || undefined
    }
    return undefined
  }

  const avatar = getAvatar(item)

  const defaultAction = (
    <TouchableOpacity
      style={{
        backgroundColor: '#F0F8FF',
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
