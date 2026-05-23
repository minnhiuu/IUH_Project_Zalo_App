import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
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
}

export function PostComposer({ onPosted, currentUserName, currentUserAvatar }: PostComposerProps) {
  const { t } = useTranslation('social')
  const [content, setContent] = useState('')
  const [media, setMedia] = useState<SelectedMedia[]>([])
  const [visibility, setVisibility] = useState<VisibilityType>('ALL')
  const [isUploading, setIsUploading] = useState(false)
  
  const createPostMutation = useCreateSocialPostMutation()

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh để chọn nội dung.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
    })

    if (!result.canceled) {
      const newMedia: SelectedMedia[] = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'VIDEO' : 'IMAGE'
      }))
      setMedia([...media, ...newMedia])
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
        const uploadPromises = media.map(m => fileApi.upload(m.uri, m.type))
        const uploadResults = await Promise.all(uploadPromises)
        mediaObjects = uploadResults.map((res: any, index: number) => ({
          url: res.data.data.key,
          type: media[index].type
        }))
      }

      await createPostMutation.mutateAsync({
        caption: content.trim(),
        media: mediaObjects.length > 0 ? mediaObjects : [],
        postType: 'FEED',
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
          {media.map((item, index) => (
            <View key={index} className="relative mr-2">
              <Image 
                source={{ uri: item.uri }} 
                className="w-24 h-24 rounded-lg bg-gray-100"
                style={{ width: 96, height: 96 }}
              />
              <TouchableOpacity 
                onPress={() => removeMedia(index)}
                className="absolute top-1 right-1 bg-black/40 rounded-full p-1"
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
              {item.type === 'VIDEO' && (
                <View className="absolute inset-0 items-center justify-center bg-black/10 rounded-lg">
                  <Ionicons name="play" size={24} color="white" />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      <View className="flex-row items-center justify-between pt-2 border-t border-gray-50">
        <View className="flex-row items-center space-x-6">
          <TouchableOpacity onPress={pickMedia} className="flex-row items-center" disabled={isUploading}>
            <Ionicons name="images" size={22} color="#10B981" />
            <Text className="ml-2 text-gray-600 font-medium">{t('composer.media', 'Ảnh/Video')}</Text>
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
    </View>
  )
}