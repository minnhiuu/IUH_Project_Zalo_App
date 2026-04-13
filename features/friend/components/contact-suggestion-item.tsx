import React from 'react'
import { View, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components'
import { BRAND } from '@/constants/theme'
import { useSemanticColors } from '@/context/theme-context'
import { useFriendshipStatus, useCancelFriendRequest } from '@/features/friend/queries'
import { FriendStatus } from '@/features/friend/schemas'
import type { FriendSuggestionResponse } from '@/features/friend/schemas'
import { useAuthStore } from '@/store'

interface ContactSuggestionItemProps {
  suggestion: FriendSuggestionResponse
  onPress?: (userId: string) => void
}

export function ContactSuggestionItem({ suggestion, onPress }: ContactSuggestionItemProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const semanticColors = useSemanticColors()
  const currentUser = useAuthStore((s) => s.user)
  const { data: status, isLoading: statusLoading } = useFriendshipStatus(suggestion.userId)
  const cancelRequest = useCancelFriendRequest()

  const handleAddFriend = () => {
    router.push({
      pathname: '/add-friend-confirm/[id]' as any,
      params: {
        id: suggestion.userId,
        fullName: suggestion.fullName,
        avatar: suggestion.avatar || ''
      }
    })
  }

  const handleCancel = () => {
    if (status?.friendshipId) {
      cancelRequest.mutate({ friendshipId: status.friendshipId, userId: suggestion.userId })
    }
  }

  const renderActionButton = () => {
    if (statusLoading) {
      return <ActivityIndicator size='small' color={BRAND.blue} />
    }

    if (status?.areFriends) {
      return (
        <View
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 16,
            backgroundColor: semanticColors.secondary
          }}
        >
          <Text style={{ fontSize: 12, color: semanticColors.textSecondary }}>
            {t('friend.status.accepted')}
          </Text>
        </View>
      )
    }

    const isPending = status?.status === FriendStatus.PENDING
    const iSentRequest = status?.requestedBy === currentUser?.id

    if (isPending && iSentRequest) {
      return (
        <TouchableOpacity
          onPress={handleCancel}
          disabled={cancelRequest.isPending}
          activeOpacity={0.7}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 18,
            backgroundColor: semanticColors.secondary
          }}
        >
          {cancelRequest.isPending ? (
            <ActivityIndicator size='small' color={semanticColors.textPrimary} />
          ) : (
            <Text style={{ fontSize: 13, fontWeight: '600', color: semanticColors.textPrimary }}>
              {t('friend.actions.withdraw')}
            </Text>
          )}
        </TouchableOpacity>
      )
    }

    if (isPending) return null

    return (
      <TouchableOpacity
        onPress={handleAddFriend}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 18,
          backgroundColor: BRAND.blueLight,
          gap: 4
        }}
      >
        <Ionicons name='person-add-outline' size={16} color={BRAND.blue} />
        <Text style={{ fontSize: 13, fontWeight: '600', color: BRAND.blue }}>
          {t('friend.actions.addFriend')}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={() => onPress?.(suggestion.userId)}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: semanticColors.border
      }}
    >
      <UserAvatar source={suggestion.avatar} name={suggestion.fullName} size='lg' className='mr-3' />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: semanticColors.textPrimary }}>
          {suggestion.fullName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 }}>
          <Ionicons name='call-outline' size={12} color={semanticColors.textSecondary} />
          <Text style={{ fontSize: 13, color: semanticColors.textSecondary }}>
            {t('friend.contact.fromContacts')}
          </Text>
        </View>
        {(suggestion.mutualFriendsCount ?? 0) > 0 && (
          <Text style={{ fontSize: 12, color: semanticColors.textSecondary, marginTop: 1 }}>
            {t('friend.mutualFriends', { count: suggestion.mutualFriendsCount ?? 0 })}
          </Text>
        )}
      </View>
      {renderActionButton()}
    </TouchableOpacity>
  )
}
