import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native'
import { X, Globe, Users, Lock } from 'lucide-react-native'
import { useState } from 'react'
import { useCreateSocialPostMutation } from '../../queries/use-mutations'
import { useSocialText } from '../../i18n/use-social-text'
import { useMyProfile } from '@/features/users'
import { UserAvatar } from '@/components/common/user-avatar'
import { MediaSection } from '../post/media-section'
import type { SocialPost } from '../../types/post'

interface ShareModalProps {
  visible: boolean
  post?: SocialPost
  onClose: () => void
}

type VisibilityType = 'ALL' | 'FRIEND' | 'ONLY_ME'

export function ShareModal({
  visible,
  post,
  onClose
}: ShareModalProps) {
  const { text } = useSocialText()
  const { data: myProfile } = useMyProfile()
  const { mutateAsync: createPost, isPending } = useCreateSocialPostMutation()
  
  const [caption, setCaption] = useState('')
  const [visibility, setVisibility] = useState<VisibilityType>('ALL')

  const visibilityOptions = [
    { id: 'ALL', label: 'Công khai', icon: Globe },
    { id: 'FRIEND', label: 'Bạn bè', icon: Users },
    { id: 'ONLY_ME', label: 'Riêng tư', icon: Lock },
  ]

  const profileName = myProfile?.fullName?.trim() || 'Bạn'
  
  // If the post is already a share, we share its original post instead
  const isSharingAShare = post?.postType === 'SHARE' && post?.sharedPost
  const targetShareId =
    post?.rootPostId ||
    (isSharingAShare ? post.sharedPost?.postId : post?.id) ||
    post?.id ||
    ''
  
  const displayAuthorName = isSharingAShare ? post?.sharedPost?.authorName : post?.authorName
  const displayAuthorAvatar = isSharingAShare ? post?.sharedPost?.authorAvatar : post?.authorAvatar
  const displayContent = isSharingAShare ? post?.sharedPost?.content : post?.content
  const displayMedia = isSharingAShare ? post?.sharedPost?.media : post?.media

  const handleShare = async () => {
    if (!post?.id) return
    
    try {
      await createPost({
        postType: 'SHARE',
        sharedPostId: targetShareId,
        visibility,
        caption: caption.trim() || undefined
      })
      setCaption('')
      onClose()
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  const handleClose = () => {
    setCaption('')
    setVisibility('ALL')
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType='slide'
      onRequestClose={handleClose}
      transparent={false}
    >
      <View className='flex-1 bg-white'>
        {/* Header */}
        <View className='flex-row items-center justify-between p-4 border-b border-gray-200'>
          <Text className='text-gray-900 font-bold text-lg'>Chia sẻ bài viết</Text>
          <TouchableOpacity onPress={handleClose} disabled={isPending}>
            <X size={24} color='#111' />
          </TouchableOpacity>
        </View>

        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          {/* User Profile Section */}
          <View className='p-4 border-b border-gray-200'>
            <View className='flex-row items-center gap-3 mb-4'>
              <UserAvatar
                source={myProfile?.avatar || undefined}
                name={profileName}
                size='md'
              />
              <View className='flex-1'>
                <Text className='text-base font-semibold text-gray-900'>
                  {profileName}
                </Text>
              </View>
            </View>
          </View>

          {/* Caption Input */}
          <View className='p-4 border-b border-gray-200'>
            <Text className='text-gray-600 text-sm mb-2'>Thêm lời nhận xét (tùy chọn)</Text>
            <TextInput
              placeholder='Bạn nghĩ gì về bài viết này?'
              placeholderTextColor='#ccc'
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={300}
              editable={!isPending}
              className='bg-gray-100 text-gray-900 rounded-lg p-3 min-h-20 text-sm border border-gray-300'
            />
            <Text className='text-gray-500 text-xs mt-1'>
              {caption.length}/300
            </Text>
          </View>

          {/* Visibility Options */}
          <View className='p-4 border-b border-gray-200'>
            <Text className='text-gray-900 font-bold text-sm mb-3'>Ai có thể nhìn thấy</Text>
            {visibilityOptions.map((option) => {
              const Icon = option.icon
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => setVisibility(option.id as VisibilityType)}
                  disabled={isPending}
                  className={`flex-row items-center gap-3 p-3 rounded-lg mb-2 ${
                    visibility === option.id
                      ? 'bg-indigo-50 border border-indigo-500'
                      : 'bg-gray-50 border border-gray-300'
                  }`}
                >
                  <Icon
                    size={20}
                    color={visibility === option.id ? '#4f46e5' : '#666'}
                  />
                  <Text
                    className={`text-sm font-medium ${
                      visibility === option.id
                        ? 'text-indigo-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Post Preview */}
          {post && (
            <View className='p-4 border-b border-gray-200'>
              <Text className='text-gray-600 text-xs mb-3 uppercase font-semibold'>Bài viết đang chia sẻ</Text>
              <View className='border border-gray-300 rounded-lg p-3 bg-gray-50'>
                <View className='flex-row items-center mb-3'>
                  <UserAvatar
                    source={displayAuthorAvatar || undefined}
                    name={displayAuthorName || 'Người dùng'}
                    size='sm'
                    className='mr-2'
                  />
                  <Text className='text-sm font-semibold text-gray-900'>
                    {displayAuthorName}
                  </Text>
                </View>
                {displayContent && (
                  <Text className='text-sm text-gray-700 mb-2 leading-5'>
                    {displayContent}
                  </Text>
                )}
                {displayMedia && displayMedia.length > 0 && (
                  <View className='mt-2'>
                    <MediaSection 
                      media={displayMedia} 
                      onMediaPress={() => {}} 
                    />
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View className='p-4 border-t border-gray-200 flex-row gap-3'>
          <TouchableOpacity
            onPress={handleClose}
            disabled={isPending}
            className='flex-1 py-3 rounded-lg border border-gray-300'
          >
            <Text className='text-gray-900 text-center font-semibold'>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            disabled={isPending || !post}
            className='flex-1 py-3 rounded-lg bg-indigo-500 flex-row items-center justify-center gap-2'
          >
            {isPending ? (
              <ActivityIndicator size='small' color='white' />
            ) : (
              <Text className='text-white text-center font-semibold'>Chia sẻ</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
