import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { Video, ResizeMode } from 'expo-av'
import { Heart, MessageCircle, Share2, Bookmark, Play } from 'lucide-react-native'
import apiConfig from '@/config/apiConfig'
import { useSavedReelsStore } from '@/store'
import type { SocialPost } from '../../types/post'

interface ReelCardProps {
  reel: SocialPost
  isActive?: boolean
  height?: number
  onReactionPress?: (isRemoving: boolean) => void
  onCommentPress?: () => void
  onSavePress?: () => void
  onSharePress?: () => void
  currentUserId?: string | null
  currentUserName?: string
  currentUserAvatar?: string | null
}

function toAbsoluteMediaUri(uri?: string | null) {
  if (!uri) return null
  const normalizedUri = uri.trim()
  if (!normalizedUri) return null
  if (
    normalizedUri.startsWith('http://') ||
    normalizedUri.startsWith('https://') ||
    normalizedUri.startsWith('data:') ||
    normalizedUri.startsWith('file:')
  ) {
    return normalizedUri
  }
  const baseOrigin = apiConfig.apiUrl.replace(/\/api\/?$/, '')
  if (normalizedUri.startsWith('/')) {
    return `${baseOrigin}${normalizedUri}`
  }
  return `${baseOrigin}/${normalizedUri}`
}

export function ReelCard({
  reel,
  isActive = false,
  height,
  onReactionPress,
  onCommentPress,
  onSavePress,
  onSharePress,
  currentUserId,
  currentUserName,
  currentUserAvatar
}: ReelCardProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [isLiked, setIsLiked] = useState(reel.currentUserReaction === 'LIKE')
  const [likeCount, setLikeCount] = useState(reel.reactions ?? 0)
  const video = reel.media?.find((item) => item.type === 'VIDEO') ?? reel.media?.[0]
  const videoUrl = video?.url
  const caption = reel.content?.trim()
  const isSaved = useSavedReelsStore((state) => (reel.id ? Boolean(state.savedReelIds[reel.id]) : false))
  const toggleSaved = useSavedReelsStore((state) => state.toggleSaved)

  const isCurrentUserPost = Boolean(currentUserId && reel.authorId && currentUserId === reel.authorId)
  const isSameNameAsCurrentUser = Boolean(
    !isCurrentUserPost &&
    currentUserName &&
    reel.authorName &&
    currentUserName.trim().toLowerCase() === reel.authorName.trim().toLowerCase()
  )
  const shouldUseCurrentUserProfile = isCurrentUserPost || isSameNameAsCurrentUser

  const displayAuthorName = shouldUseCurrentUserProfile ? currentUserName || reel.authorName : reel.authorName
  const displayAuthorAvatar = shouldUseCurrentUserProfile
    ? currentUserAvatar || reel.authorAvatar
    : reel.authorAvatar

  const resolvedAvatar = toAbsoluteMediaUri(displayAuthorAvatar)
  const displayName = displayAuthorName?.trim() || 'Người dùng'

  useEffect(() => {
    setIsLiked(reel.currentUserReaction === 'LIKE')
    setLikeCount(reel.reactions ?? 0)
  }, [reel.id, reel.currentUserReaction, reel.reactions])

  const handleSavePress = () => {
    if (reel.id) {
      toggleSaved(reel.id)
    }
    if (onSavePress) {
      onSavePress()
    }
  }

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev)
  }

  const handleReactionPress = () => {
    const nextIsLiked = !isLiked
    setIsLiked(nextIsLiked)
    setLikeCount((prev) => Math.max(0, prev + (nextIsLiked ? 1 : -1)))
    onReactionPress?.(!nextIsLiked)
  }

  return (
    <View
      className='w-full bg-black'
      style={{ height: height ?? undefined }}
    >
      {videoUrl ? (
        <Pressable
          onPress={handleTogglePause}
          className='absolute inset-0 z-0'
          accessibilityRole='button'
          accessibilityLabel={isPaused ? 'Phát lại video' : 'Tạm dừng video'}
        >
          <Video
            source={{ uri: toAbsoluteMediaUri(videoUrl) || '' }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={isActive && !isPaused}
            isLooping
            useNativeControls={false}
          />
          {isPaused ? (
            <View className='flex-1 items-center justify-center'>
              <View className='w-16 h-16 rounded-full items-center justify-center bg-black/60'>
                <Play size={28} color='white' />
              </View>
            </View>
          ) : null}
        </Pressable>
      ) : (
        <View className='flex-1 items-center justify-center'>
          <Text className='text-white text-sm'>Video không khả dụng</Text>
        </View>
      )}

      <View className='absolute inset-0 justify-end z-10' pointerEvents='box-none'>
        <View className='flex-row items-end justify-between px-4 pb-12'>
          <View className='flex-1 mr-4'>
            <View className='flex-row items-center mb-4'>
              <View className='w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-200'>
                {resolvedAvatar ? (
                  <ExpoImage
                    source={{ uri: resolvedAvatar }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit='cover'
                  />
                ) : (
                  <View className='w-10 h-10 items-center justify-center bg-blue-500'>
                    <Text className='text-white font-bold'>{displayName.charAt(0)}</Text>
                  </View>
                )}
              </View>
              <Text className='text-white text-[16px] font-semibold ml-3'>{displayName}</Text>
            </View>
            {caption ? (
              <Text className='text-white text-sm' numberOfLines={3}>
                {caption}
              </Text>
            ) : null}
          </View>

          <View className='items-center gap-5'>
            <TouchableOpacity
              onPress={handleReactionPress}
              className='items-center'
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
            >
              <Heart
                size={26}
                color={isLiked ? '#ef4444' : 'white'}
                fill={isLiked ? '#ef4444' : 'transparent'}
              />
              <Text className='text-white text-xs mt-1'>{likeCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onCommentPress}
              className='items-center'
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
            >
              <MessageCircle size={26} color='white' />
              <Text className='text-white text-xs mt-1'>{reel.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSavePress}
              className='items-center'
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
            >
              <Bookmark
                size={26}
                color={isSaved ? '#facc15' : 'white'}
                fill={isSaved ? '#facc15' : 'transparent'}
              />
              <Text className={`text-xs mt-1 ${isSaved ? 'text-yellow-400 font-bold' : 'text-white'}`}>
                {isSaved ? 'Đã lưu' : 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}
