import { View, Text, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native'
import { X, MessageCircle, ThumbsUp, Reply } from 'lucide-react-native'
import { useState } from 'react'
import type { SocialPost } from '../../types/post'

interface CommentsModalProps {
  visible: boolean
  post: SocialPost | null
  onClose: () => void
}

export function CommentsModal({
  visible,
  post,
  onClose
}: CommentsModalProps) {
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  if (!post) return null

  const mockComments = [
    {
      id: '1',
      author: 'Ngô Linh',
      avatar: 'https://via.placeholder.com/40?text=NL',
      content: 'Bài viết hay quá! 👍',
      timestamp: '2 giờ',
      likes: 5,
      replies: 2,
    },
    {
      id: '2',
      author: 'Đoàn Lân Hương',
      avatar: 'https://via.placeholder.com/40?text=DLH',
      content: 'Quá tuyệt vời!',
      timestamp: '1 giờ',
      likes: 3,
      replies: 1,
    },
  ]

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
          <Text className='text-white font-bold text-lg'>
            Bình luận ({post.comments})
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color='white' />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
        <FlatList
          data={mockComments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className='p-4 border-b border-zinc-800'>
              <View className='flex-row gap-3'>
                <View className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600' />
                <View className='flex-1'>
                  <Text className='text-white font-semibold text-sm'>
                    {item.author}
                  </Text>
                  <Text className='text-zinc-300 text-sm mt-1'>
                    {item.content}
                  </Text>
                  <View className='flex-row gap-4 mt-2'>
                    <TouchableOpacity className='flex-row items-center gap-1'>
                      <ThumbsUp size={14} color='#a1a1a1' />
                      <Text className='text-zinc-500 text-xs'>{item.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className='flex-row items-center gap-1'>
                      <Reply size={14} color='#a1a1a1' />
                      <Text className='text-zinc-500 text-xs'>
                        Trả lời ({item.replies})
                      </Text>
                    </TouchableOpacity>
                    <Text className='text-zinc-500 text-xs'>{item.timestamp}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
          scrollIndicatorInsets={{ right: 1 }}
        />

        {/* Comment Input */}
        <View className='p-4 border-t border-zinc-800 bg-zinc-900'>
          {replyingTo && (
            <View className='bg-zinc-800 rounded p-2 mb-3 flex-row justify-between items-center'>
              <Text className='text-zinc-400 text-xs'>
                Trả lời cho: <Text className='text-white font-semibold'>User</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <X size={16} color='#71717a' />
              </TouchableOpacity>
            </View>
          )}

          <View className='flex-row items-center gap-2'>
            <TextInput
              placeholder='Viết bình luận...'
              placeholderTextColor='#71717a'
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
              className='flex-1 bg-zinc-800 text-white rounded-full px-4 py-2 text-sm'
            />
            <TouchableOpacity
              disabled={!commentText.trim()}
              className={`p-2 ${
                commentText.trim() ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <Text className='text-blue-500 font-bold'>Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
