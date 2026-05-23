import { View, Text, Image, TouchableOpacity } from 'react-native'
import { useEffect, useState } from 'react'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { Video, ResizeMode } from 'expo-av'
import type { SocialPostMedia } from '../../types/post'

interface MediaSectionProps {
  media: SocialPostMedia[]
  onMediaPress?: (index: number) => void
}

function MediaTile({
  item,
  index,
  onPress
}: {
  item: SocialPostMedia
  index: number
  onPress?: () => void
}) {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null)
  const [thumbnailFailed, setThumbnailFailed] = useState(false)

  useEffect(() => {
    let isMounted = true

    const generateThumbnail = async () => {
      if (item.type !== 'VIDEO') return

      setThumbnailUri(null)
      setThumbnailFailed(false)

      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(item.url, {
          time: 1000
        })

        if (isMounted) {
          setThumbnailUri(uri)
        }
      } catch {
        if (isMounted) {
          setThumbnailFailed(true)
        }
      }
    }

    generateThumbnail()

    return () => {
      isMounted = false
    }
  }, [item.type, item.url])

  if (item.type === 'VIDEO') {
    return (
      <TouchableOpacity
        onPress={onPress}
        className='relative w-full aspect-square bg-black rounded-lg overflow-hidden'
        activeOpacity={0.7}
      >
        <Video
          source={{ uri: item.url }}
          style={{ width: '100%', height: '100%' }}
          shouldPlay
          isLooping
          isMuted
          useNativeControls={false}
          resizeMode={ResizeMode.COVER}
          posterSource={thumbnailUri ? { uri: thumbnailUri } : undefined}
          usePoster={Boolean(thumbnailUri)}
        />
        <View className='absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1'>
          <Text className='text-white text-[10px] font-semibold'>VIDEO</Text>
        </View>
        {!thumbnailUri && thumbnailFailed && (
          <View className='absolute inset-0 items-center justify-center pointer-events-none'>
            <Text className='text-white text-xs'>Không tải được ảnh xem trước</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className='relative w-full aspect-square rounded-lg overflow-hidden'
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.url }}
        className='w-full h-full'
        resizeMode='cover'
      />
    </TouchableOpacity>
  )
}

export function MediaSection({ media, onMediaPress }: MediaSectionProps) {
  if (!media?.length) return null

  if (media.length === 1) {
    return (
      <View className='rounded-xl overflow-hidden'>
        <MediaTile
          item={media[0]}
          index={0}
          onPress={() => onMediaPress?.(0)}
        />
      </View>
    )
  }

  return (
    <View className='gap-1 rounded-xl overflow-hidden'>
      {media.slice(0, 4).map((item, index) => (
        <View key={index} className='w-full aspect-square'>
          <MediaTile
            item={item}
            index={index}
            onPress={() => onMediaPress?.(index)}
          />
        </View>
      ))}
    </View>
  )
}
