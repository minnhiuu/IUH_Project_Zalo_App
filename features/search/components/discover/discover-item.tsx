import React from 'react'
import { Text, TouchableOpacity, ActivityIndicator, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import { SearchResultItem } from '@/features/search/components/core/search-result-item'
import { useTheme } from '@/context/theme-context'
import { useAcceptFriendRequest } from '@/features/friend/queries/use-mutations'
import { FriendStatus } from '@/features/friend/schemas'
import { useAuthStore } from '@/store'
import { UserSearchResponse } from '../../schemas'
import { searchKeys } from '../../queries/keys'

interface DiscoverItemProps {
  item: UserSearchResponse
  searchQuery: string
  onPress: (item: UserSearchResponse) => void
}

export function DiscoverItem({ item, searchQuery, onPress }: DiscoverItemProps) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const router = useRouter()
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)
  const acceptRequest = useAcceptFriendRequest()

  const isMe = currentUser?.id === item.id
  const isMutating = acceptRequest.isPending
  const friendshipStatus = item.friendshipStatus?.toUpperCase()

  const handleAddFriend = () => {
    router.push({
      pathname: '/add-friend-confirm/[id]' as any,
      params: {
        id: item.id,
        fullName: item.fullName,
        avatar: item.avatar || ''
      }
    })
  }

  const handleAccept = () => {
    if (!item.friendshipId) return

    acceptRequest.mutate(item.friendshipId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: searchKeys.all })
      }
    })
  }

  const renderActionButton = () => {
    if (isMe) return null
    if (friendshipStatus === FriendStatus.ACCEPTED) return null

    const isPending = friendshipStatus === FriendStatus.PENDING
    const iSentRequest = item.requestedBy === currentUser?.id

    if (isPending && iSentRequest) return null

    if (isPending) {
      return (
        <TouchableOpacity
          className='bg-primary px-6 py-2.5 rounded-full items-center justify-center min-w-[104px]'
          onPress={handleAccept}
          disabled={isMutating}
        >
          {isMutating ? (
            <ActivityIndicator size='small' color='#fff' />
          ) : (
            <Text className='text-white font-semibold text-sm'>{t('friend.actions.accept')}</Text>
          )}
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity
        className={`${isDark ? 'bg-primary/20' : 'bg-primary-50'} px-5 py-2 rounded-full items-center justify-center min-w-[88px]`}
        onPress={handleAddFriend}
      >
        <Text className='text-primary font-semibold text-sm'>{t('friend.actions.addFriend')}</Text>
      </TouchableOpacity>
    )
  }

  const mutualFriendsCount = item.mutualFriendsCount ?? 0
  const sharedGroupsCount = item.sharedGroupsCount ?? 0

  const getRelationshipLabel = () => {
    if (friendshipStatus === FriendStatus.ACCEPTED) return t('search.friendLabel')
    // If backend provides a label that we know is "Friend" in Vietnamese, translate it
    if (item.relationshipLabel === 'Bạn bè') return t('search.friendLabel')
    // Avoid duplicating mutual friends if it's already in the relationshipLabel
    if (item.relationshipLabel?.includes('bạn chung') && mutualFriendsCount > 0) return null
    return item.relationshipLabel
  }

  const socialLabels = [
    getRelationshipLabel(),
    mutualFriendsCount > 0 ? t('friend.mutualFriends', { count: mutualFriendsCount }) : null,
    sharedGroupsCount > 0 ? t('search.sharedGroups', { count: sharedGroupsCount }) : null
  ].filter(Boolean)

  return (
    <SearchResultItem
      item={item}
      searchQuery={searchQuery}
      onPress={onPress}
      action={renderActionButton()}
      subtitle={
        socialLabels.length > 0 ? (
          <View className='mt-1'>
            <Text className='text-xs text-muted-foreground'>{socialLabels.join(' - ')}</Text>
          </View>
        ) : null
      }
    />
  )
}
