import React, { useMemo } from 'react'
import { View, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { SEMANTIC, BRAND } from '@/constants/theme'
import { useFriendshipStatus } from '@/features/friend/queries/use-queries'
import { useSendFriendRequest } from '@/features/friend/queries/use-mutations'
import { useUserById } from '@/features/users/queries/use-queries'
import { useTheme } from '@/context/theme-context'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const COVER_HEIGHT = 260
const AVATAR_SIZE = 110

export default function UserProfileScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { isDark } = useTheme()

  const { data: userProfile, isLoading: profileLoading } = useUserById(id as string)
  const { data: friendshipStatus, isLoading: statusLoading } = useFriendshipStatus(id as string)
  const sendFriendRequest = useSendFriendRequest()

  const isLoading = profileLoading || statusLoading
  const isFriend = friendshipStatus?.areFriends === true
  const isPending = friendshipStatus?.status === 'PENDING'
  const isRequester = friendshipStatus?.requestedBy !== null

  const handleAddFriend = () => {
    if (!id) return
    sendFriendRequest.mutate({ receiverId: id as string })
  }

  const handleMessage = () => {
    if (!id || !userProfile) return
    router.push({
      pathname: '/chat/[id]' as any,
      params: {
        id: id as string,
        name: userProfile.fullName,
        avatar: userProfile.avatar || '',
        userId: id as string
      }
    })
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? '#1A1D21' : '#fff',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ActivityIndicator size='large' color='#0068FF' />
      </View>
    )
  }

  if (!userProfile) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? '#1A1D21' : '#fff',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Ionicons name='person-outline' size={48} color={isDark ? '#3E444A' : '#D1D5DB'} />
        <Text style={{ color: '#9ca3af', marginTop: 12 }}>{t('friend.addFriend.noResult')}</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121416' : '#F3F4F6' }}>
      <ScrollView style={{ flex: 1 }} bounces={false}>
        {/* Cover Photo + Avatar */}
        <View style={{ position: 'relative' }}>
          {/* Cover Photo */}
          <Image
            source={
              userProfile.background
                ? { uri: userProfile.background }
                : { uri: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80' }
            }
            style={{
              width: SCREEN_WIDTH,
              height: COVER_HEIGHT,
              backgroundColor: isDark ? '#1A1D21' : '#4A6B8A'
            }}
            resizeMode='cover'
          />

          {/* Back Button (floating) */}
          <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='chevron-back' size={22} color='#fff' />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name='search' size={20} color='#fff' />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name='ellipsis-horizontal' size={20} color='#fff' />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          {/* Avatar (overlapping cover) */}
          <View
            style={{
              position: 'absolute',
              bottom: -(AVATAR_SIZE / 2),
              left: SCREEN_WIDTH / 2 - AVATAR_SIZE / 2,
              zIndex: 10
            }}
          >
            <Image
              source={{ uri: userProfile.avatar || 'https://i.pravatar.cc/300' }}
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                borderWidth: 3,
                borderColor: isDark ? '#22262B' : '#fff',
                backgroundColor: isDark ? '#2C323A' : '#E5E7EB'
              }}
            />
          </View>
        </View>

        {/* Profile Info Card */}
        <View
          style={{
            backgroundColor: isDark ? '#22262B' : '#fff',
            paddingTop: AVATAR_SIZE / 2 + 12,
            paddingBottom: 24,
            alignItems: 'center'
          }}
        >
          {/* Name */}
          <Text style={{ fontSize: 22, fontWeight: '700', color: isDark ? '#DFE2E7' : '#111827' }}>
            {userProfile.fullName}
          </Text>

          {/* Bio or not-friend hint */}
          {!isFriend && (
            <Text
              style={{
                fontSize: 14,
                color: isDark ? '#B6C1CF' : '#6b7280',
                textAlign: 'center',
                marginTop: 8,
                paddingHorizontal: 40,
                lineHeight: 20
              }}
            >
              {t('friend.profile.notFriendJournal', { name: userProfile.fullName })}
            </Text>
          )}

          {userProfile.bio && isFriend && (
            <Text
              style={{
                fontSize: 14,
                color: isDark ? '#B6C1CF' : '#6b7280',
                textAlign: 'center',
                marginTop: 8,
                paddingHorizontal: 40
              }}
            >
              {userProfile.bio}
            </Text>
          )}

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginTop: 20,
              paddingHorizontal: 24
            }}
          >
            {/* Message Button */}
            <TouchableOpacity
              onPress={handleMessage}
              activeOpacity={0.7}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 24,
                backgroundColor: isDark ? 'rgba(0, 104, 255, 0.15)' : BRAND.blueLight,
                gap: 8
              }}
            >
              <Ionicons name='chatbubble-ellipses-outline' size={20} color={isDark ? '#0068FF' : SEMANTIC.primary} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#0068FF' : SEMANTIC.primary }}>
                {t('friend.actions.message')}
              </Text>
            </TouchableOpacity>

            {/* Add Friend / Status Button */}
            {!isFriend && !isPending && (
              <TouchableOpacity
                onPress={handleAddFriend}
                disabled={sendFriendRequest.isPending}
                activeOpacity={0.7}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: isDark ? '#2C323A' : '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {sendFriendRequest.isPending ? (
                  <ActivityIndicator size='small' color='#0068FF' />
                ) : (
                  <Ionicons name='person-add-outline' size={22} color={isDark ? '#DFE2E7' : '#374151'} />
                )}
              </TouchableOpacity>
            )}

            {isPending && (
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 24,
                  backgroundColor: isDark ? '#2C323A' : '#F3F4F6'
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '500', color: isDark ? '#B6C1CF' : '#6b7280' }}>
                  {t('friend.status.pending')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Friend Suggestions Section */}
        <View style={{ backgroundColor: isDark ? '#22262B' : '#fff', marginTop: 8, paddingVertical: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              marginBottom: 14
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#DFE2E7' : '#111827' }}>
              👋 {t('friend.profile.friendSuggestion')}
            </Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 14, color: isDark ? '#B6C1CF' : '#6b7280' }}>{t('friend.profile.seeMore')}</Text>
            </TouchableOpacity>
          </View>

          {/* Suggestion Cards (placeholder) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  width: 140,
                  backgroundColor: isDark ? '#2C323A' : '#fff',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB',
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                {/* Close button */}
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: isDark ? '#1A1D21' : '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name='close' size={14} color={isDark ? '#B6C1CF' : '#9ca3af'} />
                </TouchableOpacity>

                <Image
                  source={{ uri: `https://i.pravatar.cc/100?img=${i + 10}` }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: isDark ? '#1A1D21' : '#E5E7EB',
                    marginBottom: 8
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: isDark ? '#DFE2E7' : '#111827',
                    textAlign: 'center'
                  }}
                  numberOfLines={1}
                >
                  {['Nguyễn Tha...', 'Mai Thị Quỳ...', 'Minh'][i - 1]}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{
                    marginTop: 10,
                    paddingVertical: 6,
                    paddingHorizontal: 20,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#0068FF'
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#0068FF' }}>
                    {t('friend.actions.addFriend')}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  )
}
