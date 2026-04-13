import { UserSummaryResponse } from '@/features/users'
import React from 'react'
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { SearchResultItem } from '@/features/search/components/core/search-result-item'
import { useTheme } from '@/context/theme-context'
import { useFriendshipStatus } from '@/features/friend/queries'
import { useCancelFriendRequest, useAcceptFriendRequest } from '@/features/friend/queries/use-mutations'
import { FriendStatus } from '@/features/friend/schemas'
import { useAuthStore } from '@/store'

interface DiscoverItemProps {
  item: UserSummaryResponse
  searchQuery: string
  onPress: (item: UserSummaryResponse) => void
}

export function DiscoverItem({ item, searchQuery, onPress }: DiscoverItemProps) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const router = useRouter()
  const currentUser = useAuthStore((s) => s.user)

  const { data: status, isLoading: statusLoading } = useFriendshipStatus(item.id)
  const cancelRequest = useCancelFriendRequest()
  const acceptRequest = useAcceptFriendRequest()

  const isMe = currentUser?.id === item.id
  const isMutating = cancelRequest.isPending || acceptRequest.isPending

  // Navigate to Add Friend Confirmation screen
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

  // Cancel/withdraw friend request I sent
  const handleCancel = () => {
    if (status?.friendshipId) {
      cancelRequest.mutate({ friendshipId: status.friendshipId, userId: item.id })
    }
  }

  // Accept friend request they sent me
  const handleAccept = () => {
    if (status?.friendshipId) {
      acceptRequest.mutate(status.friendshipId)
    }
  }

  const renderActionButton = () => {
    if (isMe) return null

    if (statusLoading) {
      return (
        <TouchableOpacity
          className='bg-gray-200 px-4 py-1.5 rounded-full items-center justify-center min-w-[80px]'
          disabled
        >
          <ActivityIndicator size='small' color='#0068FF' />
        </TouchableOpacity>
      )
    }

    // Already friends - no button
    if (status?.areFriends) {
      return null
    }

    const isPending = status?.status === FriendStatus.PENDING
    const iSentRequest = status?.requestedBy === currentUser?.id

    // I sent a pending request - show "Thu hồi"
    if (isPending && iSentRequest) {
      return (
        <TouchableOpacity
          className={`${isDark ? 'bg-gray-700' : 'bg-gray-200'} px-4 py-1.5 rounded-full items-center justify-center min-w-[80px]`}
          onPress={handleCancel}
          disabled={isMutating}
        >
          {isMutating ? (
            <ActivityIndicator size='small' color='#374151' />
          ) : (
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium text-xs`}>
              {t('friend.actions.withdraw')}
            </Text>
          )}
        </TouchableOpacity>
      )
    }

    // They sent me a request - show "Đồng ý"
    if (isPending) {
      return (
        <TouchableOpacity
          className='bg-primary px-4 py-1.5 rounded-full items-center justify-center min-w-[80px]'
          onPress={handleAccept}
          disabled={isMutating}
        >
          {isMutating ? (
            <ActivityIndicator size='small' color='#fff' />
          ) : (
            <Text className='text-white font-medium text-xs'>{t('friend.actions.accept')}</Text>
          )}
        </TouchableOpacity>
      )
    }

    // No relationship - show "Kết bạn"
    return (
      <TouchableOpacity
        className={`${isDark ? 'bg-primary/20' : 'bg-primary-50'} px-4 py-1.5 rounded-full items-center justify-center min-w-[80px]`}
        onPress={handleAddFriend}
      >
        <Text className='text-primary font-medium text-xs'>{t('friend.actions.addFriend')}</Text>
      </TouchableOpacity>
    )
  }

  return <SearchResultItem item={item} searchQuery={searchQuery} onPress={onPress} action={renderActionButton()} />
}
