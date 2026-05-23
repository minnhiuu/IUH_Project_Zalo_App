import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  FlatList
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { Video, ResizeMode } from 'expo-av'
import { useTranslation } from 'react-i18next'
import { UserAvatar } from '@/components/common/user-avatar'
import { useCreateSocialPostMutation } from '../../queries/use-mutations'
import { fileApi } from '../../api'
import { VisibilityDropdown } from './visibility-dropdown'
interface SelectedMedia {
  uri: string
  type: 'IMAGE' | 'VIDEO'
}

type VisibilityType = 'ALL' | 'FRIEND' | 'ONLY_ME'

interface PostComposerProps {
  onPosted?: () => void
  currentUserName?: string
  currentUserAvatar?: string | null
  postType?: 'FEED' | 'REEL'
  mediaMode?: 'all' | 'video' | 'image'
}

export function PostComposer({
  onPosted,
  currentUserName,
  currentUserAvatar,
  postType = 'FEED',
  mediaMode = 'all'
}: PostComposerProps) {
  const { t } = useTranslation('social')
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<SelectedMedia[]>([])
  const [visibility, setVisibility] = useState<VisibilityType>('ALL')
  const [isUploading, setIsUploading] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const isVideoOnly = mediaMode === 'video'
  const mediaLabel = isVideoOnly ? 'Video' : t('composer.media', 'Ảnh/Video')
  const mediaIcon = isVideoOnly ? 'videocam' : 'images'
  
  const createPostMutation = useCreateSocialPostMutation()

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để chọn nội dung.')
      return
    }

    const mediaTypes =
      mediaMode === 'video'
        ? ImagePicker.MediaTypeOptions.Videos
        : mediaMode === 'image'
          ? ImagePicker.MediaTypeOptions.Images
          : ImagePicker.MediaTypeOptions.All

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsMultipleSelection: mediaMode !== 'video',
      quality: 1
    })

    if (!result.canceled) {
      const newMedia: SelectedMedia[] = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'VIDEO' : 'IMAGE'
      }))

      if (mediaMode === 'video') {
        setMedia(newMedia.slice(0, 1))
      } else {
        setMedia([...media, ...newMedia])
      }
    }
  }

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index))
  }

  const handlePost = async () => {
    if (!content.trim() && media.length === 0) return

    try {
      setIsUploading(true)
      
      let mediaObjects: Array<{ url: string; type: string }> = []
      if (media.length > 0) {
        const uploadResults = await fileApi.uploadBatchWithPresigned(media)
        mediaObjects = uploadResults.map((item) => ({
          url: item.key,
          type: item.type
        }))
      }

      await createPostMutation.mutateAsync({
        caption: content.trim(),
        media: mediaObjects.length > 0 ? mediaObjects : [],
        postType,
        visibility: visibility
      })

      setContent('')
      setMedia([])
      Alert.alert('Thành công', 'Bài viết của bạn đã được đăng!')
      onPosted?.()
    } catch (error) {
      console.error('Post creation failed:', error)
      Alert.alert('Lỗi', 'Không thể đăng bài. Vui lòng thử lại sau.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <View className="bg-white p-4 border-b border-gray-100 mb-2">
      <View className="flex-row items-center mb-4">
        <UserAvatar source={currentUserAvatar || undefined} name={currentUserName || 'Bạn'} size="md" />
        <View className="flex-1 ml-3 bg-gray-50 rounded-2xl px-4 py-2 min-h-[44px] justify-center">
          <TextInput
            placeholder={t('composer.prompt_placeholder', 'Hôm nay của bạn thế nào?')}
            placeholderTextColor="#9CA3AF"
            className="text-gray-800 text-[16px]"
            value={content}
            onChangeText={setContent}
            multiline
            scrollEnabled={false}
            editable={!isUploading}
          />
        </View>
      </View>

      {/* Visibility Control */}
      <View className="mb-4 bg-gray-50 rounded-lg p-3">
        <VisibilityDropdown value={visibility} onChange={setVisibility} />
      </View>

      {media.length > 0 && (
        <View className="mb-4">
          {renderMediaGrid(media, removeMedia, setPreviewIndex)}
        </View>
      )}

      <View className="flex-row items-center justify-between pt-2 border-t border-gray-50">
        <View className="flex-row items-center space-x-6">
          <TouchableOpacity onPress={pickMedia} className="flex-row items-center" disabled={isUploading}>
            <Ionicons name={mediaIcon as any} size={22} color="#10B981" />
            <Text className="ml-2 text-gray-600 font-medium">{mediaLabel}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center ml-4" disabled={isUploading}>
            <Ionicons name="happy-outline" size={22} color="#F59E0B" />
            <Text className="ml-2 text-gray-600 font-medium">{t('composer.feeling', 'Cảm xúc')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handlePost}
          disabled={isUploading || (!content.trim() && media.length === 0)}
          className={`px-5 py-2 rounded-full ${(!content.trim() && media.length === 0) ? 'bg-blue-200' : 'bg-blue-500'}`}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-bold">{t('composer.post', 'Đăng')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={previewIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewIndex(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setPreviewIndex(null)} />
          <View style={{ position: 'absolute', inset: 0 }}>
            <FlatList
              data={media}
              horizontal
              pagingEnabled
              keyExtractor={(_, index) => `${index}`}
              initialScrollIndex={previewIndex ?? 0}
              getItemLayout={(_, index) => ({
                length: Dimensions.get('window').width,
                offset: Dimensions.get('window').width * index,
                index
              })}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {item.type === 'VIDEO' ? (
                    <Video
                      source={{ uri: item.uri }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={false}
                      isLooping={false}
                      useNativeControls
                    />
                  ) : (
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="contain"
                    />
                  )}
                </View>
              )}
            />
            <TouchableOpacity
              onPress={() => setPreviewIndex(null)}
              style={{ position: 'absolute', top: 40, right: 16, padding: 8 }}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const renderMediaGrid = (
  media: SelectedMedia[],
  onRemove: (index: number) => void,
  onPreview: (index: number) => void
) => {
  const gap = 6
  const containerWidth = Dimensions.get('window').width - 32
  const cell = Math.floor((containerWidth - gap) / 2)

  const renderTile = (
    item: SelectedMedia,
    index: number,
    style: { width: number; height: number; marginRight?: number; marginBottom?: number }
  ) => (
    <TouchableOpacity
      key={`${item.uri}-${index}`}
      activeOpacity={0.85}
      onPress={() => onPreview(index)}
      style={{
        width: style.width,
        height: style.height,
        marginRight: style.marginRight ?? 0,
        marginBottom: style.marginBottom ?? 0,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB'
      }}
    >
      <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      <TouchableOpacity
        onPress={() => onRemove(index)}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          backgroundColor: 'rgba(0,0,0,0.45)',
          borderRadius: 10,
          padding: 4
        }}
      >
        <Ionicons name="close" size={14} color="white" />
      </TouchableOpacity>
      {item.type === 'VIDEO' && (
        <View
          style={{
            position: 'absolute',
            inset: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.15)'
          }}
        >
          <Ionicons name="play" size={26} color="white" />
        </View>
      )}
    </TouchableOpacity>
  )

  if (media.length === 1) {
    return renderTile(media[0], 0, { width: containerWidth, height: Math.floor(containerWidth * 0.7) })
  }

  if (media.length === 2) {
    return (
      <View style={{ flexDirection: 'row' }}>
        {renderTile(media[0], 0, { width: cell, height: cell, marginRight: gap })}
        {renderTile(media[1], 1, { width: cell, height: cell })}
      </View>
    )
  }

  if (media.length === 3) {
    return (
      <View>
        {renderTile(media[0], 0, { width: containerWidth, height: cell, marginBottom: gap })}
        <View style={{ flexDirection: 'row' }}>
          {renderTile(media[1], 1, { width: cell, height: cell, marginRight: gap })}
          {renderTile(media[2], 2, { width: cell, height: cell })}
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
            key={`${item.uri}-${index}`}
            style={{
              marginRight: isLastColumn ? 0 : gap,
              marginBottom: isLastRow ? 0 : gap
            }}
          >
            {renderTile(item, index, { width: cell, height: cell })}
            {media.length > 4 && index === 3 && (
              <View
                style={{
                  position: 'absolute',
                  inset: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.45)'
                }}
              >
                <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>+{media.length - 4}</Text>
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}