import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { useEffect, useState } from 'react'
import { Image as ExpoImage } from 'expo-image'
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
  onPress,
  style
}: {
  item: SocialPostMedia
  index: number
  onPress?: () => void
  style?: { width: number; height: number }
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
        style={{
          width: style?.width ?? '100%',
          height: style?.height ?? '100%',
          backgroundColor: '#000',
          borderRadius: 12,
          overflow: 'hidden'
        }}
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
      style={{
        width: style?.width ?? '100%',
        height: style?.height ?? '100%',
        borderRadius: 12,
        overflow: 'hidden'
      }}
      activeOpacity={0.8}
    >
      <ExpoImage
        source={{ uri: item.url }}
        style={{ width: '100%', height: '100%' }}
        contentFit='cover'
        cachePolicy='memory-disk'
      />
    </TouchableOpacity>
  )
}

export function MediaSection({ media, onMediaPress }: MediaSectionProps) {
  if (!media?.length) return null

  const gap = 6
  const containerWidth = Dimensions.get('window').width - 32
  const cell = Math.floor((containerWidth - gap) / 2)

  if (media.length === 1) {
    return (
      <View style={{ borderRadius: 12, overflow: 'hidden' }}>
        <MediaTile
          item={media[0]}
          index={0}
          onPress={() => onMediaPress?.(0)}
          style={{ width: containerWidth, height: containerWidth }}
        />
      </View>
    )
  }

  if (media.length === 2) {
    return (
      <View style={{ flexDirection: 'row' }}>
        <MediaTile
          item={media[0]}
          index={0}
          onPress={() => onMediaPress?.(0)}
          style={{ width: cell, height: cell }}
        />
        <View style={{ width: gap }} />
        <MediaTile
          item={media[1]}
          index={1}
          onPress={() => onMediaPress?.(1)}
          style={{ width: cell, height: cell }}
        />
      </View>
    )
  }

  if (media.length === 3) {
    return (
      <View>
        <MediaTile
          item={media[0]}
          index={0}
          onPress={() => onMediaPress?.(0)}
          style={{ width: containerWidth, height: cell }}
        />
        <View style={{ height: gap }} />
        <View style={{ flexDirection: 'row' }}>
          <MediaTile
            item={media[1]}
            index={1}
            onPress={() => onMediaPress?.(1)}
            style={{ width: cell, height: cell }}
          />
          <View style={{ width: gap }} />
          <MediaTile
            item={media[2]}
            index={2}
            onPress={() => onMediaPress?.(2)}
            style={{ width: cell, height: cell }}
          />
        </View>
      </View>
    )
  }

  const displayItems = media.slice(0, 4)
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {displayItems.map((item, index) => {
        const isLastColumn = index % 2 === 1
        const isLastRow = index >= 2
        return (
          <View
            key={`${item.url}-${index}`}
            style={{
              marginRight: isLastColumn ? 0 : gap,
              marginBottom: isLastRow ? 0 : gap
            }}
          >
            <View>
              <MediaTile
                item={item}
                index={index}
                onPress={() => onMediaPress?.(index)}
                style={{ width: cell, height: cell }}
              />
              {media.length > 4 && index === 3 && (
                <View
                  style={{
                    position: 'absolute',
                    inset: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    borderRadius: 12
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>+{media.length - 4}</Text>
                </View>
              )}
            </View>
          </View>
        )
      })}
    </View>
  )
}
