import React from 'react'
import { View, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { SEMANTIC } from '@/constants/theme'
import { useMyBlockedUsers } from '../queries/use-queries'
import { useUnblockUser } from '../queries/use-mutations'
import type { BlockedUserDetailResponse } from '../schemas/block.schema'

function getBlockTypeIcons(preference: BlockedUserDetailResponse['preference']) {
  const icons: { name: keyof typeof Ionicons.glyphMap; label: string }[] = []
  if (preference.message) icons.push({ name: 'chatbubble-outline', label: 'Tin nhắn' })
  if (preference.call) icons.push({ name: 'call-outline', label: 'Cuộc gọi' })
  if (preference.story) icons.push({ name: 'camera-outline', label: 'Nhật ký' })
  return icons
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function SkeletonItem() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        marginBottom: 10
      }}
    >
      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#E2E8F0' }} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ height: 14, width: 120, backgroundColor: '#E2E8F0', borderRadius: 4 }} />
        <View style={{ height: 12, width: 180, backgroundColor: '#E2E8F0', borderRadius: 4 }} />
      </View>
      <View style={{ height: 34, width: 80, backgroundColor: '#E2E8F0', borderRadius: 8 }} />
    </View>
  )
}

interface BlockedUserItemProps {
  user: BlockedUserDetailResponse
  onUnblock: (user: BlockedUserDetailResponse) => void
  isPending: boolean
}

function BlockedUserItem({ user, onUnblock, isPending }: BlockedUserItemProps) {
  const icons = getBlockTypeIcons(user.preference)
  const initial = user.fullName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        marginBottom: 10
      }}
    >
      {/* Avatar */}
      {user.avatar ? (
        <Image source={{ uri: user.avatar }} style={{ width: 48, height: 48, borderRadius: 24 }} />
      ) : (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: SEMANTIC.primary,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 18 }}>{initial}</Text>
        </View>
      )}

      {/* Info */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontWeight: '600', fontSize: 15 }}>
          {user.fullName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 12, color: '#64748B' }}>Đã chặn: {formatDate(user.blockedAt)}</Text>
          {icons.length > 0 && (
            <>
              <Text style={{ color: '#CBD5E1', fontSize: 12 }}>•</Text>
              {icons.map(({ name, label }, idx) => (
                <Ionicons key={idx} name={name} size={14} color='#64748B' accessibilityLabel={label} />
              ))}
            </>
          )}
        </View>
      </View>

      {/* Unblock button */}
      <TouchableOpacity
        onPress={() => onUnblock(user)}
        disabled={isPending}
        activeOpacity={0.7}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#CBD5E1',
          opacity: isPending ? 0.5 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4
        }}
      >
        {isPending && <ActivityIndicator size='small' color='#374151' />}
        <Text style={{ fontSize: 13, color: '#374151' }}>Bỏ chặn</Text>
      </TouchableOpacity>
    </View>
  )
}

export function BlockedUsersSection() {
  const { data: blockedUsers, isLoading, isError, refetch } = useMyBlockedUsers()
  const unblockMutation = useUnblockUser()

  const handleUnblock = (user: BlockedUserDetailResponse) => {
    Alert.alert('Bỏ chặn', `Bạn có chắc muốn bỏ chặn ${user.fullName}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Bỏ chặn',
        onPress: () => unblockMutation.mutate(user.blockedUserId)
      }
    ])
  }

  if (isLoading) {
    return (
      <View style={{ padding: 16 }}>
        {[1, 2, 3].map((i) => (
          <SkeletonItem key={i} />
        ))}
      </View>
    )
  }

  if (isError) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 48 }}>
        <Ionicons name='alert-circle-outline' size={48} color='#CBD5E1' />
        <Text style={{ color: '#64748B', marginTop: 12, fontSize: 15 }}>Không thể tải danh sách</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={{
            marginTop: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#CBD5E1'
          }}
        >
          <Text style={{ fontSize: 13, color: '#374151' }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!blockedUsers || blockedUsers.length === 0) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 48 }}>
        <Ionicons name='ban-outline' size={48} color='#CBD5E1' />
        <Text style={{ color: '#64748B', marginTop: 12, fontSize: 15 }}>Bạn chưa chặn ai</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={blockedUsers}
      keyExtractor={(item) => item.id}
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16 }}
      onRefresh={() => refetch()}
      refreshing={isLoading}
      renderItem={({ item }) => (
        <BlockedUserItem user={item} onUnblock={handleUnblock} isPending={unblockMutation.isPending} />
      )}
    />
  )
}
