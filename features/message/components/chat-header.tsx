import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { HEADER } from '@/constants/theme'

interface ChatHeaderProps {
  name: string
  avatar?: string | null
  subtitle?: string
  isOnline?: boolean
  lastSeenAt?: string | null
  userId?: string
  onBack?: () => void
  onProfilePress?: () => void
  onCall?: () => void
  onVideoCall?: () => void
  onMenu?: () => void
}

export function ChatHeader({
  name,
  avatar,
  subtitle,
  isOnline,
  lastSeenAt,
  userId,
  onBack,
  onProfilePress,
  onCall,
  onVideoCall,
  onMenu
}: ChatHeaderProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'
  const headerGradient = isDark ? HEADER.gradientColorsDark : HEADER.gradientColors

  const getStatusText = () => {
    if (subtitle) return subtitle
    if (isOnline) return t('message.online', { defaultValue: 'Online' })
    if (lastSeenAt) {
      try {
        const d = new Date(lastSeenAt.endsWith('Z') ? lastSeenAt : lastSeenAt + 'Z')
        const now = new Date()
        const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000)
        if (diffMin < 1) return t('message.status.justNow', { defaultValue: 'Just now' })
        if (diffMin < 60) return t('message.lastSeen', { time: `${diffMin} ${t('message.status.minutesUnit', { defaultValue: 'min' })}` })
        const diffHour = Math.floor(diffMin / 60)
        if (diffHour < 24) return t('message.lastSeen', { time: `${diffHour} ${t('message.status.hoursUnit', { defaultValue: 'hr' })}` })
        return t('message.lastSeen', { time: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) })
      } catch {
        return ''
      }
    }
    return ''
  }

  const statusText = getStatusText()

  return (
    <LinearGradient colors={headerGradient}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: HEADER.paddingHorizontal,
            height: HEADER.height,
          }}
        >
          {/* Back */}
          <TouchableOpacity onPress={onBack ?? (() => router.back())} style={{ paddingRight: 10 }}>
            <Ionicons name='chevron-back' size={24} color='#fff' />
          </TouchableOpacity>

          {/* Avatar + Name */}
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}
            activeOpacity={0.7}
            onPress={() => {
              if (onProfilePress) onProfilePress()
              else if (userId) router.push(`/other-profile/${userId}` as any)
            }}
          >
            <UserAvatar
              source={avatar}
              name={name}
              size="sm"
              showOnline={isOnline !== undefined}
              isOnline={isOnline}
            />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: '#fff' }} numberOfLines={1}>
                {name}
              </Text>
              {statusText ? (
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>{statusText}</Text>
              ) : null}
            </View>
          </TouchableOpacity>

          {/* Action Icons */}
          <TouchableOpacity onPress={onCall} style={{ padding: 8 }}>
            <Ionicons name='call-outline' size={24} color='#fff' />
          </TouchableOpacity>
          <TouchableOpacity onPress={onVideoCall} style={{ padding: 8 }}>
            <Ionicons name='videocam-outline' size={24} color='#fff' />
          </TouchableOpacity>
          <TouchableOpacity onPress={onMenu} style={{ padding: 8 }}>
            <Ionicons name='menu-outline' size={24} color='#fff' />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}
