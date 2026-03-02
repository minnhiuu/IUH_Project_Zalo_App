import React from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
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
  return (
    <TouchableOpacity
      onPress={() => onPress?.(friend)}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#fff',
      }}
    >
      <Image
        source={{ uri: friend.userAvatar || 'https://i.pravatar.cc/150' }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: '#E5E7EB',
          marginRight: 12,
        }}
      />
      <Text style={{ flex: 1, fontSize: 16, color: '#111827' }} numberOfLines={1}>
        {friend.userName}
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity
          onPress={() => onCall?.(friend)}
          style={{ padding: 4 }}
        >
          <Ionicons name="call-outline" size={22} color="#0068FF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onVideoCall?.(friend)}
          style={{ padding: 4 }}
        >
          <Ionicons name="videocam-outline" size={22} color="#0068FF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}
