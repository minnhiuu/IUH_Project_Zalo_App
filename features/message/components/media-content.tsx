import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Modal, Pressable, Image, Dimensions } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { Video, ResizeMode } from 'expo-av'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import type { AttachmentInfo } from '../schemas'

export function MessageMediaContent({ attachments, onLongPress }: { attachments: AttachmentInfo[]; onLongPress?: () => void }) {
  const validAttachments = attachments.filter((attachment) => !!attachment.url)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  if (validAttachments.length === 0) {
    return <Text style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Đang tải...</Text>
  }

  if (validAttachments.length === 1) {
    return (
      <>
        <PreviewableMedia
          attachment={validAttachments[0]}
          mode='original'
          onPress={() => setPreviewIndex(0)}
          onLongPress={onLongPress}
        />
        <MediaPreviewModal
          attachments={validAttachments}
          currentIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
        />
      </>
    )
  }

  return (
    <>
      <MediaGrid attachments={validAttachments} onPressIndex={setPreviewIndex} onLongPress={onLongPress} />
      <MediaPreviewModal
        attachments={validAttachments}
        currentIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    </>
  )
}

function MediaGrid({
  attachments,
  onPressIndex,
  onLongPress
}: {
  attachments: AttachmentInfo[]
  onPressIndex: (index: number) => void
  onLongPress?: () => void
}) {
  const validAttachments = attachments.filter((attachment) => !!attachment.url)

  if (validAttachments.length === 0) {
    return <Text style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>Đang tải...</Text>
  }

  if (validAttachments.length === 2) {
    return (
      <View style={{ width: 240, flexDirection: 'row', justifyContent: 'space-between' }}>
        {validAttachments.map((attachment, index) => (
          <PreviewableMedia
            key={`${attachment.url}-${index}`}
            attachment={attachment}
            mode='grid'
            size={119}
            onPress={() => onPressIndex(index)}
            onLongPress={onLongPress}
          />
        ))}
      </View>
    )
  }

  const columns = 3
  const gap = 2
  const containerWidth = 240
  const cellSize = Math.floor((containerWidth - gap * (columns - 1)) / columns)

  return (
    <View
      style={{
        width: containerWidth,
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 12,
        overflow: 'hidden'
      }}
    >
      {validAttachments.map((attachment, index) => (
        <View
          key={`${attachment.url}-${index}`}
          style={{
            marginRight: index % columns === columns - 1 ? 0 : gap,
            marginBottom: gap
          }}
        >
          <PreviewableMedia
            attachment={attachment}
            mode='grid'
            size={cellSize}
            onPress={() => onPressIndex(index)}
            onLongPress={onLongPress}
          />
        </View>
      ))}
    </View>
  )
}

function PreviewableMedia({
  attachment,
  mode,
  size = 240,
  onPress,
  onLongPress
}: {
  attachment: AttachmentInfo
  mode: 'original' | 'grid'
  size?: number
  onPress: () => void
  onLongPress?: () => void
}) {
  const isVideo = attachment.contentType?.startsWith('video/')
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    if (isVideo || !attachment.url || mode !== 'original') return

    Image.getSize(
      attachment.url,
      (width, height) => {
        if (width > 0 && height > 0) {
          setDimensions(calculateFittedDimensions(width, height, 240, 320))
        }
      },
      () => {
        setDimensions({ width: 240, height: 240 })
      }
    )
  }, [attachment.url, isVideo, mode])

  const mediaWidth = mode === 'grid' ? size : dimensions?.width || 240
  const mediaHeight = mode === 'grid' ? size : dimensions?.height || (isVideo ? 320 : 240)

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      style={{
        width: mediaWidth,
        height: mediaHeight,
        borderRadius: mode === 'original' ? 0 : 10,
        overflow: 'hidden',
        backgroundColor: mode === 'original' ? 'transparent' : '#E5E7EB'
      }}
    >
      {isVideo ? (
        <View style={{ flex: 1 }}>
          <Video
            source={{ uri: attachment.url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping={false}
            useNativeControls={mode === 'original'}
            onLoad={(event) => {
              if (mode !== 'original') return
              const naturalSize = (event as any)?.naturalSize
              const naturalWidth = naturalSize?.width || 0
              const naturalHeight = naturalSize?.height || 0
              if (naturalWidth > 0 && naturalHeight > 0) {
                setDimensions(calculateFittedDimensions(naturalWidth, naturalHeight, 240, 320))
              }
            }}
          />
          {mode === 'grid' && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.18)'
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='play' size={18} color='#fff' style={{ marginLeft: 2 }} />
              </View>
            </View>
          )}
        </View>
      ) : (
        <ExpoImage
          source={{ uri: attachment.url }}
          style={{ width: '100%', height: '100%' }}
          contentFit='cover'
          cachePolicy='memory-disk'
        />
      )}
    </TouchableOpacity>
  )
}

function MediaPreviewModal({
  attachments,
  currentIndex,
  onClose
}: {
  attachments: AttachmentInfo[]
  currentIndex: number | null
  onClose: () => void
}) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (currentIndex !== null) setIdx(currentIndex)
  }, [currentIndex])

  if (currentIndex === null) return null

  const attachment = attachments[idx]
  if (!attachment) return null

  const isVideo = attachment.contentType?.startsWith('video/')
  const screen = Dimensions.get('window')
  const canPrev = idx > 0
  const canNext = idx < attachments.length - 1

  return (
    <Modal visible transparent statusBarTranslucent animationType='none' onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.94)', justifyContent: 'center', alignItems: 'center' }}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

        {/* Close button */}
        <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 56, right: 18, zIndex: 2, padding: 8 }}>
          <Ionicons name='close' size={30} color='#fff' />
        </TouchableOpacity>

        {/* Page counter */}
        {attachments.length > 1 && (
          <View style={{ position: 'absolute', top: 62, alignSelf: 'center', zIndex: 2 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
              {idx + 1} / {attachments.length}
            </Text>
          </View>
        )}

        {isVideo ? (
          <Video
            source={{ uri: attachment.url }}
            style={{ width: screen.width, height: screen.width * 0.72 }}
            resizeMode={ResizeMode.CONTAIN}
            useNativeControls
            shouldPlay
          />
        ) : (
          <ExpoImage
            source={{ uri: attachment.url }}
            style={{ width: screen.width, height: screen.height * 0.75 }}
            contentFit='contain'
            cachePolicy='memory-disk'
          />
        )}

        {/* Prev button */}
        {canPrev && (
          <TouchableOpacity
            onPress={() => setIdx((prev) => prev - 1)}
            style={{ position: 'absolute', left: 12, zIndex: 2, padding: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name='chevron-back' size={34} color='rgba(255,255,255,0.85)' />
          </TouchableOpacity>
        )}

        {/* Next button */}
        {canNext && (
          <TouchableOpacity
            onPress={() => setIdx((prev) => prev + 1)}
            style={{ position: 'absolute', right: 12, zIndex: 2, padding: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name='chevron-forward' size={34} color='rgba(255,255,255,0.85)' />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  )
}

function calculateFittedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
) {
  const widthRatio = maxWidth / originalWidth
  const heightRatio = maxHeight / originalHeight
  const ratio = Math.min(widthRatio, heightRatio, 1)

  return {
    width: Math.max(120, Math.round(originalWidth * ratio)),
    height: Math.max(120, Math.round(originalHeight * ratio))
  }
}
