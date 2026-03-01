import React from 'react'
import { View, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'

interface ChatHeaderProps {
  name: string
  avatar?: string
  subtitle?: string
  userId?: string
  onBack?: () => void
  onProfilePress?: () => void
  onCall?: () => void
  onVideoCall?: () => void
  onMenu?: () => void
}

/**
 * Chat screen header matching Zalo design: back + avatar/name + call/video/menu
 */
export function ChatHeader({
  name,
  avatar,
  subtitle,
  userId,
  onBack,
  onProfilePress,
  onCall,
  onVideoCall,
  onMenu,
}: ChatHeaderProps) {
  const router = useRouter()

  return (
    <View style={{ backgroundColor: '#0068FF' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0068FF' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            height: 52,
          }}
        >
          {/* Back */}
          <TouchableOpacity
            onPress={onBack ?? (() => router.back())}
            style={{ padding: 4, marginRight: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Avatar + Name */}
          <TouchableOpacity 
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} 
            activeOpacity={0.7}
            onPress={() => {
              if (onProfilePress) {
                onProfilePress()
              } else if (userId) {
                router.push(`/user-profile/${userId}` as any)
              }
            }}
          >
            <Image
              source={{ uri: avatar || 'https://i.pravatar.cc/100' }}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#E5E7EB',
                marginRight: 10,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 17, fontWeight: '600', color: '#fff' }}
                numberOfLines={1}
              >
                {name}
              </Text>
              {subtitle && (
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                  {subtitle}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Action Icons */}
          <TouchableOpacity onPress={onCall} style={{ padding: 8 }}>
            <Ionicons name="call-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onVideoCall} style={{ padding: 8 }}>
            <Ionicons name="videocam-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onMenu} style={{ padding: 8 }}>
            <Ionicons name="menu-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}
