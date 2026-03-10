import React from 'react'
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import { SEMANTIC, BRAND } from '@/constants/theme'
import { useFriendshipStatus } from '@/features/friend/queries'
import { useCancelFriendRequest } from '@/features/friend/queries'
import { FriendStatus } from '@/features/friend/schemas'
import { useAuthStore } from '@/store'

interface SearchResultItemProps {
  user: {
    id: string
    fullName: string
    avatar: string | null
    phoneNumber?: string | null
  }
  onPress?: (userId: string) => void
}

export function SearchResultItem({ user: resultUser, onPress }: SearchResultItemProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const currentUser = useAuthStore((s) => s.user)
  const { data: status, isLoading: statusLoading } = useFriendshipStatus(resultUser.id)
  const cancelRequest = useCancelFriendRequest()

  const isMe = currentUser?.id === resultUser.id

  // Navigate to Add Friend Confirmation screen instead of direct API call
  const handleAddFriend = () => {
    router.push({
      pathname: '/add-friend-confirm/[id]' as any,
      params: {
        id: resultUser.id,
        fullName: resultUser.fullName,
        avatar: resultUser.avatar || '',
      },
    })
  }

  const handleCancel = () => {
    if (status?.friendshipId) {
      cancelRequest.mutate({ friendshipId: status.friendshipId, userId: resultUser.id })
    }
  }

  const isMutating = cancelRequest.isPending

  const renderActionButton = () => {
    if (isMe) return null
    if (statusLoading) {
      return <ActivityIndicator size="small" color="#0068FF" />
    }

    if (status?.areFriends) {
      return null
    }

    // Check if I sent a pending request
    const isPending = status?.status === FriendStatus.PENDING
    const iSentRequest = status?.requestedBy === currentUser?.id

    if (isPending && iSentRequest) {
      return (
        <TouchableOpacity
          onPress={handleCancel}
          disabled={isMutating}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 18,
            backgroundColor: '#E5E7EB',
            gap: 4,
          }}
        >
          {isMutating ? (
            <ActivityIndicator size="small" color="#374151" />
          ) : (
            <>
              <Ionicons name="close-circle-outline" size={16} color="#374151" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>
                {t('friend.actions.withdraw')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )
    }

    // They sent me a request - don't show button
    if (isPending) {
      return null
    }

    // Not friends - show "Kết bạn" button (navigates to confirmation screen)
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
          gap: 4,
        }}
      >
        <Ionicons name="person-add-outline" size={16} color={SEMANTIC.primary} />
        <Text style={{ fontSize: 13, fontWeight: '600', color: SEMANTIC.primary }}>
          {t('friend.actions.addFriend')}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={() => onPress?.(resultUser.id)}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
      }}
    >
      <Image
        source={{ uri: resultUser.avatar || 'https://i.pravatar.cc/150' }}
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: '#E5E7EB',
          marginRight: 12,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>
          {resultUser.fullName}
        </Text>
        {resultUser.phoneNumber && (
          <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
            {resultUser.phoneNumber}
          </Text>
        )}
      </View>
      {renderActionButton()}
    </TouchableOpacity>
  )
}
