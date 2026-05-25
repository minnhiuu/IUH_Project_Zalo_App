import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Plus } from 'lucide-react-native'
import apiConfig from '@/config/apiConfig'
import type { StoryGroup } from '../../types/story'
import { Image as ExpoImage } from 'expo-image'

interface StoriesStripProps {
  stories?: StoryGroup[]
  onCreateStory?: () => void
  onStoryPress?: (groupIndex: number) => void
  currentUserName?: string
  currentUserAvatar?: string | null
}

const FALLBACK_CARD_COLORS = ['#1d4ed8', '#0f766e', '#b91c1c', '#6d28d9', '#be185d', '#334155']

function getFallbackCardColor(name: string) {
  const seed = name
    .trim()
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return FALLBACK_CARD_COLORS[seed % FALLBACK_CARD_COLORS.length]
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

function StoryCard({
  group,
  onPress
}: {
  group: StoryGroup
  onPress?: () => void
}) {
  const previewStory = group.stories[0] as (typeof group.stories)[number] & {
    mediaUrl?: string | null
    mediaType?: string | null
  }
  const image = previewStory?.media?.[0]?.url || previewStory?.mediaUrl || null
  const displayName = group.authorName && group.authorName !== 'Unknown user'
    ? group.authorName
    : previewStory?.authorName || 'Người dùng'
  const displayAvatar = toAbsoluteMediaUri(group.authorAvatar || previewStory?.authorAvatar || null)

  return (
    <TouchableOpacity
      onPress={onPress}
      className='mr-3 relative overflow-hidden rounded-2xl bg-zinc-900'
      style={{ width: 110, height: 188 }}
      activeOpacity={0.7}
    >
      {image && (
        <ExpoImage
          source={{ uri: image }}
          style={{ width: '100%', height: '100%' }}
          contentFit='cover'
          cachePolicy='memory-disk'
        />
      )}
      <View className='absolute inset-0 bg-black/35' />

      <View className='absolute inset-0 items-center justify-center px-2'>
        <View className='w-12 h-12 rounded-full border-2 border-blue-500 p-[2px] overflow-hidden items-center justify-center'>
          {displayAvatar ? (
            <ExpoImage
              source={{ uri: displayAvatar }}
              style={{ width: '100%', height: '100%', borderRadius: 9999 }}
              contentFit='cover'
              cachePolicy='memory-disk'
            />
          ) : (
            <View className='w-full h-full rounded-full bg-blue-500 items-center justify-center'>
              <Text className='text-white font-bold text-sm'>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text className='mt-2 text-center text-white text-[13px] font-semibold' numberOfLines={1}>
          {displayName}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

function StoryCreateCard({
  onPress,
  currentUserName,
  currentUserAvatar
}: {
  onPress?: () => void
  currentUserName?: string
  currentUserAvatar?: string | null
}) {
  const displayName = currentUserName?.trim() || 'Bạn'
  const resolvedCurrentUserAvatar = toAbsoluteMediaUri(currentUserAvatar)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)

  useEffect(() => {
    setAvatarLoadFailed(false)
  }, [resolvedCurrentUserAvatar])

  useEffect(() => {
    if (!__DEV__) return

    const compact = (value: string | null) => {
      if (!value) return null
      return value.length > 120 ? `${value.slice(0, 120)}...` : value
    }

    console.log('[AvatarDebug][StoriesStrip] create-card input', {
      displayName,
      currentUserAvatar: compact(currentUserAvatar ?? null),
      resolvedCurrentUserAvatar: compact(resolvedCurrentUserAvatar)
    })
  }, [displayName, currentUserAvatar, resolvedCurrentUserAvatar])

  const showAvatarBackground = Boolean(resolvedCurrentUserAvatar && !avatarLoadFailed)
  const fallbackInitial = displayName.charAt(0).toUpperCase()

  return (
    <TouchableOpacity
      onPress={onPress}
      className='mr-3 rounded-2xl bg-zinc-900 overflow-hidden'
      style={{ width: 110, height: 188 }}
      activeOpacity={0.7}
    >
      {showAvatarBackground ? (
        <ExpoImage
          source={{ uri: resolvedCurrentUserAvatar as string }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          contentFit='cover'
          cachePolicy='memory-disk'
          onError={() => {
            if (__DEV__) {
              console.warn('[AvatarDebug][StoriesStrip] create-card image load failed', {
                displayName,
                currentUserAvatar,
                resolvedCurrentUserAvatar
              })
            }
            setAvatarLoadFailed(true)
          }}
        />
      ) : (
        <View
          className='absolute inset-0 items-center justify-center'
          style={{ backgroundColor: getFallbackCardColor(displayName) }}
        >
          <Text className='text-white font-bold text-3xl'>{fallbackInitial}</Text>
        </View>
      )}

      <View className='absolute inset-0 bg-black/30' />

      <View className='absolute bottom-12 items-center' style={{ left: 0, right: 0 }}>
        <View className='w-11 h-11 rounded-full border-[3px] border-white items-center justify-center bg-blue-500'>
          <Plus size={22} color='white' />
        </View>
      </View>

      <Text className='absolute bottom-3 left-2 right-2 text-center text-white text-[13px] font-semibold'>
        Thêm khoảnh khắc
      </Text>
    </TouchableOpacity>
  )
}

export function StoriesStrip({
  stories = [],
  onCreateStory,
  onStoryPress,
  currentUserName,
  currentUserAvatar
}: StoriesStripProps) {
  // Prefetch story media
  useEffect(() => {
    stories.forEach((group) => {
      group.stories.forEach((story) => {
        const rawStory = story as typeof story & { mediaUrl?: string | null }
        const mediaUrl = story.media?.[0]?.url || rawStory.mediaUrl
        if (mediaUrl) {
          const absoluteUrl = toAbsoluteMediaUri(mediaUrl)
          if (absoluteUrl) {
            void ExpoImage.prefetch(absoluteUrl).catch(() => {
              // Silently handle prefetch errors
            })
          }
        }
      })
    })
  }, [stories])

  return (
    <View className='bg-white rounded-3xl border border-zinc-200 px-4 py-4'>
      <View className='mb-3 flex-row items-center'>
        <View className='w-7 h-7 rounded-xl bg-indigo-100 items-center justify-center mr-2'>
          <Text className='text-indigo-600 text-sm'>✦</Text>
        </View>
        <Text className='text-zinc-900 text-[22px] font-semibold'>Stories</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        <StoryCreateCard
          onPress={onCreateStory}
          currentUserName={currentUserName}
          currentUserAvatar={currentUserAvatar}
        />

        {stories.map((group, index) => (
          <StoryCard
            key={group.authorId || `${group.authorName}-${index}`}
            group={group}
            onPress={() => onStoryPress?.(index)}
          />
        ))}
      </ScrollView>

      {stories.length === 0 && (
        <Text className='text-zinc-500 text-xs mt-3'>Chưa có story nào từ bạn bè.</Text>
      )}
    </View>
  )
}
