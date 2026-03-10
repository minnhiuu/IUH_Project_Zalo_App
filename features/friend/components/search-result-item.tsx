import React from 'react'
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { SEMANTIC, BRAND } from '@/constants/theme'
import { useFriendshipStatus } from '@/features/friend/queries'
import { useSendFriendRequest, useCancelFriendRequest } from '@/features/friend/queries'
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
  const currentUser = useAuthStore((s) => s.user)
  const { data: status, isLoading: statusLoading } = useFriendshipStatus(resultUser.id)
  const sendRequest = useSendFriendRequest()
  const cancelRequest = useCancelFriendRequest()

  const isMe = currentUser?.id === resultUser.id

  const handleSendRequest = () => {
    const defaultMessage = t('friend.addFriend.defaultMessage', {
      name: currentUser?.fullName || '',
    })
    sendRequest.mutate({ receiverId: resultUser.id, message: defaultMessage })
  }

  const handleCancel = () => {
    if (status?.friendshipId) {
      cancelRequest.mutate(status.friendshipId)
    }
  }

  const isMutating = sendRequest.isPending || cancelRequest.isPending

  const renderActionButton = () => {
    if (isMe) return null
    if (statusLoading) {
      return <ActivityIndicator size="small" color="#0068FF" />
    }

    // Already friends
    if (status?.areFriends) {
      return (
        <TouchableOpacity
          onPress={() => onPress?.(resultUser.id)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 18,
            backgroundColor: '#F3F4F6',
            gap: 4,
          }}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#6b7280' }}>
            {t('friend.actions.message')}
          </Text>
        </TouchableOpacity>
      )
    }

    // Pending — I sent
    if (status?.status === 'PENDING' && status?.requestedBy === currentUser?.id) {
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

    // Pending — They sent me
    if (status?.status === 'PENDING') {
      return (
        <TouchableOpacity
          onPress={() => onPress?.(resultUser.id)}
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
          <Ionicons name="checkmark-circle-outline" size={16} color={SEMANTIC.primary} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: SEMANTIC.primary }}>
            {t('friend.actions.accept')}
          </Text>
        </TouchableOpacity>
      )
    }

    // No relationship → Kết bạn
    return (
      <TouchableOpacity
        onPress={handleSendRequest}
        disabled={isMutating}
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
        {isMutating ? (
          <ActivityIndicator size="small" color={SEMANTIC.primary} />
        ) : (
          <>
            <Ionicons name="person-add-outline" size={16} color={SEMANTIC.primary} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: SEMANTIC.primary }}>
              {t('friend.actions.addFriend')}
            </Text>
          </>
        )}
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
