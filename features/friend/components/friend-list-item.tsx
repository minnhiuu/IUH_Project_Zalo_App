import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components'
import { BRAND } from '@/constants/theme'
import { useSemanticColors } from '@/context/theme-context'
import type { FriendResponse } from '../schemas'

interface FriendListItemProps {
  friend: FriendResponse
  onPress?: (friend: FriendResponse) => void
  onCall?: (friend: FriendResponse) => void
  onVideoCall?: (friend: FriendResponse) => void
}

export function FriendListItem({
  friend,
  onPress,
  onCall,
  onVideoCall,
}: FriendListItemProps) {
  const semanticColors = useSemanticColors()

  return (
    <TouchableOpacity
      onPress={() => onPress?.(friend)}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: semanticColors.background,
      }}
    >
      <UserAvatar
        source={friend.userAvatar}
        name={friend.userName}
        size="md"
        className="mr-3"
      />
      <Text style={{ flex: 1, fontSize: 16, fontWeight: '500', color: semanticColors.textPrimary }} numberOfLines={1}>
        {friend.userName}
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={() => onCall?.(friend)}
          style={{ padding: 4 }}
        >
          <Ionicons name="call-outline" size={22} color={BRAND.blue} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onVideoCall?.(friend)}
          style={{ padding: 4 }}
        >
          <Ionicons name="videocam-outline" size={22} color={BRAND.blue} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}
