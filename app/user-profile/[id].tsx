import React, { useState } from 'react'
import { View, TouchableOpacity, Image, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Text } from '@/components/ui/text'
import { ActionSheet, type ActionSheetOption } from '@/components/ui'
import { SEMANTIC, BRAND } from '@/constants/theme'
import { useFriendshipStatus } from '@/features/friend/queries/use-queries'
import { useSendFriendRequest } from '@/features/friend/queries/use-mutations'
import { useUserById, useMyProfile } from '@/features/users/queries/use-queries'
import { useUpdateAvatar, useUpdateBackground } from '@/features/users/queries/use-mutations'
import { useTheme } from '@/context/theme-context'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const COVER_HEIGHT = 260
const AVATAR_SIZE = 110

export default function UserProfileScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { isDark } = useTheme()

  const { data: myProfile } = useMyProfile()
  const { data: userProfile, isLoading: profileLoading } = useUserById(id as string)
  const { data: friendshipStatus, isLoading: statusLoading } = useFriendshipStatus(id as string, id !== myProfile?.id)
  const sendFriendRequest = useSendFriendRequest()
  const updateAvatarMutation = useUpdateAvatar()
  const updateBackgroundMutation = useUpdateBackground()

  const isLoading = profileLoading || statusLoading
  const isOwner = myProfile?.id === id
  const isFriend = friendshipStatus?.areFriends === true
  const isPending = friendshipStatus?.status === 'PENDING'

  // Action Sheet States
  const [showAvatarSheet, setShowAvatarSheet] = useState(false)
  const [showCoverSheet, setShowCoverSheet] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Request permissions on mount
  React.useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        console.warn('Camera or media library permissions not granted')
      }
    })()
  }, [])

  // Image picker helper
  const pickImage = async (source: 'camera' | 'gallery'): Promise<string | null> => {
    try {
      let result: ImagePicker.ImagePickerResult

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8
        })
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8
        })
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri
      }
      return null
    } catch (error) {
      console.error('Error picking image:', error)
      return null
    }
  }

  const pickCoverImage = async (source: 'camera' | 'gallery'): Promise<string | null> => {
    try {
      let result: ImagePicker.ImagePickerResult

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8
        })
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [16, 9],
          quality: 0.8
        })
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri
      }
      return null
    } catch (error) {
      console.error('Error picking cover image:', error)
      return null
    }
  }

  // Upload avatar
  const handleUpdateAvatar = async (source: 'camera' | 'gallery') => {
    setShowAvatarSheet(false)
    const imageUri = await pickImage(source)
    if (!imageUri) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      const filename = imageUri.split('/').pop() || 'avatar.jpg'
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : 'image/jpeg'

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type
      } as any)

      await updateAvatarMutation.mutateAsync(formData)
    } catch (error) {
      console.error('Error updating avatar:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // Upload background
  const handleUpdateBackground = async (source: 'camera' | 'gallery') => {
    setShowCoverSheet(false)
    const imageUri = await pickCoverImage(source)
    if (!imageUri) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      const filename = imageUri.split('/').pop() || 'background.jpg'
      const match = /\.(\w+)$/.exec(filename)
      const type = match ? `image/${match[1]}` : 'image/jpeg'

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type
      } as any)

      await updateBackgroundMutation.mutateAsync({ formData, y: 0 })
    } catch (error) {
      console.error('Error updating background:', error)
    } finally {
      setIsUploading(false)
    }
  }

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

  // Avatar Action Sheet Options
  const avatarOptions: ActionSheetOption[] = [
    {
      icon: 'person-circle-outline',
      label: t('profile.avatar.view'),
      onPress: () => console.log('View avatar')
    },
    {
      icon: 'camera-outline',
      label: t('profile.avatar.takePhoto'),
      onPress: () => handleUpdateAvatar('camera')
    },
    {
      icon: 'image-outline',
      label: t('profile.avatar.chooseFromGallery'),
      onPress: () => handleUpdateAvatar('gallery')
    },
    {
      icon: 'crop-outline',
      label: t('profile.avatar.chooseFrame'),
      onPress: () => console.log('Choose frame')
    },
    {
      icon: 'sparkles-outline',
      label: t('profile.avatar.chooseDecoration'),
      onPress: () => console.log('Choose decoration'),
      iconColor: '#FF6B9D'
    }
  ]

  // Cover Photo Action Sheet Options
  const coverOptions: ActionSheetOption[] = [
    {
      icon: 'albums-outline',
      label: t('profile.cover.chooseFromZStyle'),
      onPress: () => console.log('Choose from zStyle'),
      iconColor: '#FF6B9D'
    },
    {
      icon: 'image-outline',
      label: t('profile.cover.view'),
      onPress: () => console.log('View cover photo')
    },
    {
      icon: 'camera-outline',
      label: t('profile.cover.takePhoto'),
      onPress: () => handleUpdateBackground('camera')
    },
    {
      icon: 'images-outline',
      label: t('profile.cover.chooseFromGallery'),
      onPress: () => handleUpdateBackground('gallery')
    }
  ]

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
          <TouchableOpacity
            activeOpacity={isOwner ? 0.8 : 1}
            disabled={!isOwner}
            onPress={() => isOwner && setShowCoverSheet(true)}
          >
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
          </TouchableOpacity>

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
            <TouchableOpacity
              activeOpacity={isOwner ? 0.8 : 1}
              disabled={!isOwner}
              onPress={() => isOwner && setShowAvatarSheet(true)}
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
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info Card */}
        <View
          style={{
            backgroundColor: isDark ? '#22262B' : '#fff',
            paddingTop: AVATAR_SIZE / 2 + 16,
            paddingBottom: 20,
            alignItems: 'center'
          }}
        >
          {/* Name */}
          <Text style={{ fontSize: 22, fontWeight: '700', color: isDark ? '#DFE2E7' : '#111827' }}>
            {userProfile.fullName}
          </Text>

          {/* Bio - Show if exists */}
          {userProfile.bio && (
            <Text
              style={{
                fontSize: 15,
                color: isDark ? '#B6C1CF' : '#6B7280',
                textAlign: 'center',
                paddingHorizontal: 32,
                lineHeight: 22
              }}
            >
              {userProfile.bio}
            </Text>
          )}

          {/* Owner Profile: Update Profile Link */}
          {isOwner && (
            <TouchableOpacity
              onPress={() => router.push('/user-profile/edit-bio' as any)}
              style={{
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Ionicons name='pencil-outline' size={16} color='#0068FF' />
              <Text style={{ fontSize: 15, color: '#0068FF', fontWeight: '400' }}>
                {t('profile.owner.updateProfile')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Friend Profile: No Activity Message */}
          {!isOwner && isFriend && (
            <Text
              style={{
                fontSize: 14,
                color: isDark ? '#B6C1CF' : '#6b7280',
                textAlign: 'center',
                marginTop: 12,
                paddingHorizontal: 40,
                lineHeight: 20
              }}
            >
              {t('profile.friend.noActivity', { name: userProfile.fullName.split(' ')[0] })}
            </Text>
          )}

          {/* Stranger Profile: Not Friend Message */}
          {!isOwner && !isFriend && (
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

          {/* Action Buttons - Only for non-owner */}
          {!isOwner && (
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
          )}
        </View>

        {/* Owner Profile: Tabs Section */}
        {isOwner && (
          <View style={{ backgroundColor: isDark ? '#1A1D21' : '#fff', paddingVertical: 12 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {/* Customize Style */}
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? '#2C323A' : '#fff',
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  minWidth: 160,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(0,0,0,0.1)' : '#D1D5DB',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 3,
                  elevation: 1,
                  gap: 12
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isDark ? '#2C323A' : '#E8F3FF',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name='person-outline' size={18} color={isDark ? '#0068FF' : '#0068FF'} />
                </View>
                <Text style={{ fontSize: 13, color: isDark ? '#E5E7EB' : '#111827', fontWeight: '500', flex: 1 }}>
                  {t('profile.owner.customizeStyle')}
                </Text>
              </TouchableOpacity>

              {/* My Photos */}
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? '#2C323A' : '#fff',
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  minWidth: 160,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(0,0,0,0.1)' : '#D1D5DB',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 3,
                  elevation: 1,
                  gap: 12
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isDark ? '#2C323A' : '#E8F3FF',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name='image-outline' size={18} color={isDark ? '#0068FF' : '#0068FF'} />
                </View>
                <Text style={{ fontSize: 13, color: isDark ? '#E5E7EB' : '#111827', fontWeight: '500', flex: 1 }}>
                  {t('profile.owner.myPhotos')}
                </Text>
              </TouchableOpacity>

              {/* Storage */}
              <TouchableOpacity
                style={{
                  backgroundColor: isDark ? '#2C323A' : '#fff',
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  minWidth: 160,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(0,0,0,0.1)' : '#D1D5DB',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 3,
                  elevation: 1,
                  gap: 12
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isDark ? '#2C323A' : '#E8F3FF',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name='file-tray-full-outline' size={18} color={isDark ? '#0068FF' : '#0068FF'} />
                </View>
                <Text style={{ fontSize: 13, color: isDark ? '#E5E7EB' : '#111827', fontWeight: '500', flex: 1 }}>
                  {t('profile.owner.storage')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Owner Profile: Journal Prompt */}
        {isOwner && (
          <View style={{ backgroundColor: isDark ? '#22262B' : '#fff', paddingVertical: 32, paddingHorizontal: 20 }}>
            {/* Illustration */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View
                style={{
                  width: 140,
                  height: 140,
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {/* Heart icon - top left */}
                <View style={{ position: 'absolute', top: 10, left: 15 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#FFE5E5',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#FF6B6B',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 2
                    }}
                  >
                    <Ionicons name='heart' size={20} color='#FF6B6B' />
                  </View>
                </View>

                {/* Chat bubble - top right */}
                <View style={{ position: 'absolute', top: 25, right: 10 }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      backgroundColor: '#D4F4F2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#4ECDC4',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 2
                    }}
                  >
                    <Ionicons name='chatbubble' size={16} color='#4ECDC4' />
                  </View>
                </View>

                {/* Phone/Card in center */}
                <View
                  style={{
                    width: 70,
                    height: 90,
                    borderRadius: 10,
                    backgroundColor: isDark ? '#2C323A' : '#fff',
                    borderWidth: 2,
                    borderColor: isDark ? '#3E444A' : '#E5E7EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3
                  }}
                >
                  <Ionicons name='person-circle-outline' size={36} color={isDark ? '#B6C1CF' : '#9CA3AF'} />
                  <View style={{ width: 32, height: 3, backgroundColor: isDark ? '#3E444A' : '#D1D5DB', marginTop: 6, borderRadius: 2 }} />
                  <View style={{ width: 24, height: 3, backgroundColor: isDark ? '#3E444A' : '#E5E7EB', marginTop: 3, borderRadius: 2 }} />
                  <View style={{ width: 28, height: 3, backgroundColor: isDark ? '#3E444A' : '#E5E7EB', marginTop: 3, borderRadius: 2 }} />
                </View>
              </View>
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 19,
                fontWeight: '600',
                color: isDark ? '#DFE2E7' : '#111827',
                textAlign: 'center',
                marginBottom: 12,
                lineHeight: 26
              }}
            >
              {t('profile.owner.todayQuestion', { name: userProfile.fullName.split(' ').pop() })}
            </Text>

            {/* Description */}
            <Text
              style={{
                fontSize: 15,
                color: isDark ? '#B6C1CF' : '#6b7280',
                textAlign: 'center',
                lineHeight: 22,
                marginBottom: 24,
                paddingHorizontal: 10
              }}
            >
              {t('profile.owner.journalPrompt')}
            </Text>

            {/* Post to Journal Button */}
            <TouchableOpacity
              style={{
                paddingVertical: 13,
                borderRadius: 30,
                backgroundColor: '#0068FF',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#0068FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                {t('profile.owner.postToJournal')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Friend Suggestions Section - Only for Stranger Profile */}
        {!isOwner && !isFriend && (
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
        )}
      </ScrollView>

      {/* Action Sheets */}
      {isOwner && (
        <>
          <ActionSheet
            visible={showAvatarSheet}
            onClose={() => setShowAvatarSheet(false)}
            options={avatarOptions}
            title={t('profile.avatar.title')}
            isDark={isDark}
          />
          <ActionSheet
            visible={showCoverSheet}
            onClose={() => setShowCoverSheet(false)}
            options={coverOptions}
            title={t('profile.cover.title')}
            isDark={isDark}
          />
        </>
      )}

      {/* Upload Loading Overlay */}
      {isUploading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#22262B' : '#fff',
              borderRadius: 12,
              padding: 24,
              alignItems: 'center',
              gap: 12
            }}
          >
            <ActivityIndicator size='large' color='#0068FF' />
            <Text style={{ fontSize: 16, color: isDark ? '#DFE2E7' : '#111827' }}>
              {t('common.loading')}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}
