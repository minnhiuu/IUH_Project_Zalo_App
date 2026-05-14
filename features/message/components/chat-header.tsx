import React from 'react'
import { View, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { HEADER } from '@/constants/theme'
import { parseMessageDate } from '../utils/date-utils'

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
  isGroup?: boolean
  isSearchMode?: boolean
  searchQuery?: string
  setSearchQuery?: (query: string) => void
  searchInputRef?: React.RefObject<TextInput | null>
  isSenderPickerMode?: boolean
  selectedSearchSenderName?: string | null
  onSenderLabelPress?: () => void
  onSearchKeyPress?: (key: string) => void
  onSearchPress?: () => void
  onCancelSearch?: () => void
  onSubmitSearch?: () => void
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
  onMenu,
  isGroup,
  isSearchMode,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  isSenderPickerMode,
  selectedSearchSenderName,
  onSenderLabelPress,
  onSearchKeyPress,
  onSearchPress,
  onCancelSearch,
  onSubmitSearch
}: ChatHeaderProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'

  const headerGradient = (isSearchMode
    ? isDark
      ? ['#1F2937', '#1F2937']
      : ['#FFFFFF', '#FFFFFF']
    : isDark
      ? HEADER.gradientColorsDark
      : HEADER.gradientColors) as any

  const getStatusText = () => {
    if (subtitle) return subtitle
    if (isOnline) return t('message.online', { defaultValue: 'Online' })
    if (lastSeenAt) {
      try {
        const d = parseMessageDate(lastSeenAt)
        if (!d) return ''
        const now = new Date()
        const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000)
        if (diffMin < 1) return t('message.status.justNow', { defaultValue: 'Just now' })
        if (diffMin < 60) {
          return t('message.lastSeen', {
            time: `${diffMin} ${t('message.status.minutesUnit', { defaultValue: 'min' })}`
          })
        }
        const diffHour = Math.floor(diffMin / 60)
        if (diffHour < 24) {
          return t('message.lastSeen', { time: `${diffHour} ${t('message.status.hoursUnit', { defaultValue: 'hr' })}` })
        }
        return t('message.lastSeen', {
          time: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        })
      } catch {
        return ''
      }
    }
    return ''
  }

  const statusText = getStatusText()

  return (
    <View style={{ borderBottomWidth: isSearchMode ? 0.5 : 0, borderBottomColor: isDark ? '#374151' : '#E0E0E0' }}>
      <LinearGradient colors={headerGradient}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              height: 56
            }}
          >
            {isSearchMode ? (
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={onCancelSearch} style={{ padding: 4 }}>
                  <Ionicons name='arrow-back' size={24} color={isDark ? '#FFFFFF' : '#666666'} />
                </TouchableOpacity>

                {isSenderPickerMode || selectedSearchSenderName ? (
                  <>
                    <Text style={{ fontSize: 17, color: isDark ? '#FFFFFF' : '#333333', marginLeft: 12 }}>
                      {t('search.fromLabel', { defaultValue: 'From:' })}
                    </Text>
                    {selectedSearchSenderName ? (
                      <TouchableOpacity
                        onPress={onSenderLabelPress}
                        activeOpacity={0.7}
                        style={{
                          maxWidth: 160,
                          marginLeft: 4,
                        }}
                      >
                        <Text style={{ fontSize: 17, color: '#0A84FF' }} numberOfLines={1}>
                          {selectedSearchSenderName}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                    <TextInput
                      ref={searchInputRef}
                      style={{
                        flex: 1,
                        color: isDark ? '#FFFFFF' : '#333333',
                        fontSize: 17,
                        height: '100%',
                        paddingHorizontal: selectedSearchSenderName ? 6 : 4
                      }}
                      placeholder={
                        isSenderPickerMode && !selectedSearchSenderName
                          ? t('search.chooseSenderPlaceholder', { defaultValue: 'Choose sender' })
                          : ''
                      }
                      placeholderTextColor={isDark ? '#6B7280' : '#B0B0B0'}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      onKeyPress={({ nativeEvent }) => onSearchKeyPress?.(nativeEvent.key)}
                      autoFocus
                      returnKeyType='search'
                      onSubmitEditing={onSubmitSearch}
                    />
                  </>
                ) : (
                  <TextInput
                    ref={searchInputRef}
                    style={{
                      flex: 1,
                      color: isDark ? '#FFFFFF' : '#333333',
                      fontSize: 16,
                      height: '100%',
                      paddingHorizontal: 12
                    }}
                    placeholder={t('search.chatMessagePlaceholder', { defaultValue: 'Search text messages' })}
                    placeholderTextColor={isDark ? '#6B7280' : '#B0B0B0'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                    returnKeyType='search'
                    onSubmitEditing={onSubmitSearch}
                  />
                )}
              </View>
            ) : (
              <>
                <TouchableOpacity onPress={onBack ?? (() => router.back())} style={{ paddingRight: 10 }}>
                  <Ionicons name='chevron-back' size={24} color='#fff' />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (onProfilePress) onProfilePress()
                    else if (userId) router.push(`/other-profile/${userId}` as any)
                  }}
                >
                  <UserAvatar source={avatar} name={name} size='sm' showOnline={isOnline !== undefined} isOnline={isOnline} />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: '600', color: '#fff' }} numberOfLines={1}>
                      {name}
                    </Text>
                    {statusText ? (
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>{statusText}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={isGroup ? onSearchPress : onCall} style={{ padding: 8 }}>
                  <Ionicons name={isGroup ? 'search-outline' : 'call-outline'} size={24} color='#fff' />
                </TouchableOpacity>
                <TouchableOpacity onPress={onVideoCall} style={{ padding: 8 }}>
                  <Ionicons name='videocam-outline' size={24} color='#fff' />
                </TouchableOpacity>
                <TouchableOpacity onPress={onMenu} style={{ padding: 8 }}>
                  <Ionicons name='menu-outline' size={24} color='#fff' />
                </TouchableOpacity>
              </>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  )
}
