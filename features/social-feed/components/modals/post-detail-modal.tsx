import { View, Text, TouchableOpacity, Modal, FlatList, ScrollView, TextInput } from 'react-native'
import { X, ThumbsUp, MessageCircle, Share2, MoreVertical } from 'lucide-react-native'
import type { SocialPost } from '../../types/post'
import { PostCard } from '../post/post-card'
import { ReactionPicker } from '../post/reaction-picker'
import { useState } from 'react'

interface PostDetailModalProps {
  visible: boolean
  post: SocialPost | null
  onClose: () => void
}

export function PostDetailModal({
  visible,
  post,
  onClose
}: PostDetailModalProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [commentText, setCommentText] = useState('')

  if (!post) return null

  return (
    <Modal
      visible={visible}
      animationType='slide'
      onRequestClose={onClose}
      transparent={false}
    >
      <View className='flex-1 bg-black'>
        {/* Header */}
        <View className='flex-row items-center justify-between p-4 border-b border-zinc-800'>
          <Text className='text-white font-bold text-lg'>Chi tiết bài viết</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color='white' />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          {/* Post */}
          <PostCard post={post} />

          {/* Comments Section */}
          <View className='border-t border-zinc-800 p-4'>
            <Text className='text-white font-bold text-base mb-4'>
              Bình luận ({post.comments})
            </Text>

            {/* Comment Input */}
            <View className='bg-zinc-900 rounded-lg p-3 flex-row items-center gap-3 mb-4'>
              <TextInput
                placeholder='Viết bình luận...'
                placeholderTextColor='#71717a'
                value={commentText}
                onChangeText={setCommentText}
                className='flex-1 text-white text-sm'
              />
              <TouchableOpacity
                disabled={!commentText.trim()}
                className={commentText.trim() ? 'opacity-100' : 'opacity-50'}
              >
                <Text className='text-blue-500 font-semibold'>Gửi</Text>
              </TouchableOpacity>
            </View>

            {/* Sample Comments */}
            {[1, 2, 3].map((i) => (
              <View key={i} className='py-3 border-b border-zinc-800'>
                <View className='flex-row gap-3'>
                  <View className='w-8 h-8 rounded-full bg-blue-500' />
                  <View className='flex-1'>
                    <Text className='text-white text-sm font-semibold'>
                      Bạn {i}
                    </Text>
                    <Text className='text-zinc-300 text-sm mt-1'>
                      Bình luận số {i}
                    </Text>
                    <View className='flex-row gap-4 mt-2'>
                      <TouchableOpacity>
                        <Text className='text-zinc-500 text-xs'>Thích</Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text className='text-zinc-500 text-xs'>Trả lời</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Reaction Picker */}
        {showReactionPicker && (
          <ReactionPicker
            onSelect={(reaction) => {
              setShowReactionPicker(false)
            }}
          />
        )}
      </View>
    </Modal>
  )
}
