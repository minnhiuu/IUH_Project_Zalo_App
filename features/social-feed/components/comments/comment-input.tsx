import { View, Text, TouchableOpacity, TextInput, Image } from 'react-native'
import { useState } from 'react'
import { Send, Image as ImageIcon, Video } from 'lucide-react-native'
import { useSocialText } from '../../i18n/use-social-text'

interface CommentInputProps {
  onSubmitComment: (content: string) => void
  replyingTo?: {
    authorName: string
    content: string
  } | null
  onCancelReply?: () => void
  isLoading?: boolean
}

export function CommentInput({
  onSubmitComment,
  replyingTo,
  onCancelReply,
  isLoading = false
}: CommentInputProps) {
  const [content, setContent] = useState('')
  const { text } = useSocialText()

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmitComment(content)
      setContent('')
    }
  }

  return (
    <View className='border-t border-zinc-200 dark:border-zinc-700 p-3 bg-white dark:bg-zinc-900'>
      {replyingTo && (
        <View className='mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-row justify-between items-center'>
          <View className='flex-1'>
            <Text className='text-xs text-blue-600 dark:text-blue-400 font-semibold'>
              {text.commentInput.replyingTo(replyingTo.authorName)}
            </Text>
            <Text className='text-xs text-zinc-600 dark:text-zinc-400' numberOfLines={1}>
              {replyingTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelReply} className='p-1'>
            <Text className='text-xs text-blue-600 dark:text-blue-400 font-semibold'>
              {text.commentInput.cancel}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View className='flex-row items-end gap-2'>
        <View className='flex-1 border border-zinc-300 dark:border-zinc-600 rounded-full px-4 py-2.5 flex-row items-center gap-2'>
          <TextInput
            placeholder={text.commentsModal.inputPlaceholder}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={500}
            editable={!isLoading}
            className='flex-1 text-sm text-zinc-900 dark:text-white'
            placeholderTextColor='#999'
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!content.trim() || isLoading}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            content.trim() && !isLoading ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-700'
          }`}
          activeOpacity={0.7}
        >
          <Send size={18} color='white' />
        </TouchableOpacity>
      </View>
    </View>
  )
}
