import React from 'react'
import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { SEMANTIC, BRAND } from '@/constants/theme'
import { useUserById, useMyProfile } from '@/features/user/queries/use-queries'
import { useFriendshipStatus } from '@/features/friend/queries/use-queries'
import { useSendFriendRequest } from '@/features/friend/queries/use-mutations'
import { useAuth } from '@/features/auth'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const COVER_HEIGHT = 260
const AVATAR_SIZE = 110

export default function UserProfileScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user: currentUser } = useAuth()

  // Check if viewing own profile
  const isOwnProfile = id === currentUser?.id || id === 'me'

  // Fetch data based on profile type
  const { data: myProfile, isLoading: myProfileLoading } = useMyProfile()
  const { data: otherUserProfile, isLoading: otherProfileLoading } = useUserById(id, !isOwnProfile)
  const { data: friendshipStatus, isLoading: statusLoading } = useFriendshipStatus(id, !isOwnProfile)
  const sendFriendRequest = useSendFriendRequest()

  // Determine which profile to show
  const userProfile = isOwnProfile ? myProfile : otherUserProfile
  const isLoading = isOwnProfile ? myProfileLoading : (otherProfileLoading || statusLoading)
  
  const isFriend = friendshipStatus?.areFriends === true
  const isPending = friendshipStatus?.status === 'PENDING'

  const handleAddFriend = () => {
    if (!id) return
    sendFriendRequest.mutate({ receiverId: id })
  }

  const handleMessage = () => {
    if (!id || !userProfile) return
    router.push({
      pathname: '/chat/[id]' as any,
      params: {
        id: id,
        name: userProfile.fullName,
        avatar: userProfile.avatar || '',
        userId: id,
      },
    })
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0068FF" />
      </View>
    )
  }

  if (!userProfile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="person-outline" size={48} color="#D1D5DB" />
        <Text style={{ color: '#9ca3af', marginTop: 12 }}>
          {t('friend.addFriend.noResult')}
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
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
              backgroundColor: '#4A6B8A',
            }}
            resizeMode="cover"
          />

          {/* Back Button (floating) */}
          <SafeAreaView
            edges={['top']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 8,
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
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="search" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
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
              zIndex: 10,
            }}
          >
            <Image
              source={{ uri: userProfile.avatar || 'https://i.pravatar.cc/300' }}
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderRadius: AVATAR_SIZE / 2,
                borderWidth: 3,
                borderColor: '#fff',
                backgroundColor: '#E5E7EB',
              }}
            />
          </View>
        </View>

        {/* Profile Info Card */}
        <View
          style={{
            backgroundColor: '#fff',
            paddingTop: AVATAR_SIZE / 2 + 12,
            paddingBottom: 24,
            alignItems: 'center',
          }}
        >
          {/* Name */}
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827' }}>
            {userProfile.fullName}
          </Text>

          {/* Owner Profile - Update Bio Link */}
          {isOwnProfile && (
            <TouchableOpacity style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 15, color: SEMANTIC.primary }}>
                ✏️ {t('profile.updateBio')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Friend Profile - Activity Status */}
          {!isOwnProfile && isFriend && !userProfile.bio && (
            <Text
              style={{
                fontSize: 14,
                color: '#9ca3af',
                textAlign: 'center',
                marginTop: 12,
                paddingHorizontal: 40,
                lineHeight: 22,
              }}
            >
              {t('profile.noActivity', { name: userProfile.fullName })}
            </Text>
          )}

          {/* Non-Friend Profile - Warning Message */}
          {!isOwnProfile && !isFriend && (
            <Text
              style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center',
                marginTop: 8,
                paddingHorizontal: 40,
                lineHeight: 20,
              }}
            >
              {t('friend.profile.notFriendJournal', { name: userProfile.fullName })}
            </Text>
          )}

          {userProfile.bio && (isFriend || isOwnProfile) && (
            <Text
              style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center',
                marginTop: 8,
                paddingHorizontal: 40,
              }}
            >
              {userProfile.bio}
            </Text>
          )}

          {/* Action Buttons */}
          {isOwnProfile ? (
            // Owner Profile - 3 Feature Buttons
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                marginTop: 20,
                marginHorizontal: 20,
                gap: 12,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                  }}
                >
                  <Ionicons name="brush-outline" size={22} color="#374151" />
                </View>
                <Text style={{ fontSize: 13, color: '#374151', textAlign: 'center' }}>
                  {t('profile.owner.setupZStyle')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                  }}
                >
                  <Ionicons name="images-outline" size={22} color="#374151" />
                </View>
                <Text style={{ fontSize: 13, color: '#374151', textAlign: 'center' }}>
                  {t('profile.owner.myPhotos')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                  }}
                >
                  <Ionicons name="archive-outline" size={22} color="#374151" />
                </View>
                <Text style={{ fontSize: 13, color: '#374151', textAlign: 'center' }}>
                  {t('profile.owner.storage')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Other User Profile - Message + Add Friend Buttons
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginTop: 20,
                paddingHorizontal: 24,
              }}
            >
              {/* Message Button - Only show if not friend (friends have floating button) */}
              {!isFriend && (
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
                    backgroundColor: BRAND.blueLight,
                    gap: 8,
                  }}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color={SEMANTIC.primary} />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: SEMANTIC.primary }}>
                    {t('friend.actions.message')}
                  </Text>
                </TouchableOpacity>
              )}

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
                    backgroundColor: '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {sendFriendRequest.isPending ? (
                    <ActivityIndicator size="small" color="#0068FF" />
                  ) : (
                    <Ionicons name="person-add-outline" size={22} color="#374151" />
                  )}
                </TouchableOpacity>
              )}

              {isPending && (
                <View
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderRadius: 24,
                    backgroundColor: '#F3F4F6',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '500', color: '#6b7280' }}>
                    {t('friend.status.pending')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Friend Suggestions Section - Only for other users */}
        {!isOwnProfile && (
          <View style={{ backgroundColor: '#fff', marginTop: 8, paddingVertical: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                👋 {t('friend.profile.friendSuggestion')}
              </Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  {t('friend.profile.seeMore')}
                </Text>
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
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    paddingVertical: 16,
                    paddingHorizontal: 12,
                    alignItems: 'center',
                    position: 'relative',
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
                      backgroundColor: '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="close" size={14} color="#9ca3af" />
                  </TouchableOpacity>

                  <Image
                    source={{ uri: `https://i.pravatar.cc/100?img=${i + 10}` }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: '#E5E7EB',
                      marginBottom: 8,
                    }}
                  />
                  <Text
                    style={{ fontSize: 13, fontWeight: '500', color: '#111827', textAlign: 'center' }}
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
                      borderColor: '#0068FF',
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
        )}
      </ScrollView>

      {/* Floating Message Button - Only for Friends */}
      {!isOwnProfile && isFriend && (
        <SafeAreaView
          edges={['bottom']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8,
            backgroundColor: 'rgba(255,255,255,0.98)',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
          }}
        >
          <TouchableOpacity
            onPress={handleMessage}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 28,
              backgroundColor: SEMANTIC.primary,
              gap: 8,
              shadowColor: '#0068FF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
              {t('friend.actions.message')}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  )
}
