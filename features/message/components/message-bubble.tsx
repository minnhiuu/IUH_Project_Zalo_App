import React from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/text'

interface MessageBubbleProps {
  content: string
  timestamp: string
  isOwn: boolean
  senderName?: string
  senderAvatar?: string
  senderId?: string
  showAvatar?: boolean
  showSenderName?: boolean
  onAvatarPress?: (userId: string) => void
}

/**
 * Chat message bubble component.
 * Left-aligned with avatar for received, right-aligned for sent.
 */
export function MessageBubble({
  content,
  timestamp,
  isOwn,
  senderName,
  senderAvatar,
  senderId,
  showAvatar = true,
  showSenderName = false,
  onAvatarPress,
}: MessageBubbleProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        paddingHorizontal: 12,
        marginBottom: 4,
        alignItems: 'flex-end',
      }}
    >
      {/* Avatar (received only) */}
      {!isOwn && showAvatar && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => senderId && onAvatarPress?.(senderId)}
        >
          <Image
            source={{ uri: senderAvatar || 'https://i.pravatar.cc/100' }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#E5E7EB',
              marginRight: 8,
            }}
          />
        </TouchableOpacity>
      )}

      {!isOwn && !showAvatar && <View style={{ width: 40 }} />}

      {/* Bubble */}
      <View style={{ maxWidth: '70%' }}>
        {showSenderName && senderName && !isOwn && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => senderId && onAvatarPress?.(senderId)}
          >
            <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 2, marginLeft: 4 }}>
              {senderName}
            </Text>
          </TouchableOpacity>
        )}
        <View
          style={{
            backgroundColor: isOwn ? '#D5E9FF' : '#F3F4F6',
            borderRadius: 16,
            borderTopRightRadius: isOwn ? 4 : 16,
            borderTopLeftRadius: isOwn ? 16 : 4,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text style={{ fontSize: 15, color: '#111827', lineHeight: 21 }}>{content}</Text>
        </View>
        <Text
          style={{
            fontSize: 11,
            color: '#9ca3af',
            marginTop: 2,
            alignSelf: isOwn ? 'flex-end' : 'flex-start',
            marginHorizontal: 4,
          }}
        >
          {timestamp}
        </Text>
      </View>
    </View>
  )
}
