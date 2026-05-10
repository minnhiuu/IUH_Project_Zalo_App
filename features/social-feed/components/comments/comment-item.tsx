import { View, Text, TouchableOpacity, Image } from 'react-native'
import { useState } from 'react'
import { Heart, MessageCircle, MoreHorizontal } from 'lucide-react-native'
import { formatRelativeTime } from '@/utils/dateUtils'
import { useSocialText } from '../../i18n/use-social-text'
import { REACTION_EMOJIS } from '../post/reaction-picker'
import type { SocialFeedComment } from '../../schemas/comment.schema'
import type { ReactionType } from '../../types/reaction'

interface CommentItemProps {
  comment: SocialFeedComment
  onReply?: () => void
  onReactionPress?: (reactionType: ReactionType) => void
  onMorePress?: () => void
  onViewReplies?: () => void
}

export function CommentItem({
  comment,
  onReply,
  onReactionPress,
  onMorePress,
  onViewReplies
}: CommentItemProps) {
  const { text, language } = useSocialText()
  const [isLiked, setIsLiked] = useState(!!comment.currentUserReaction)

  const handleReactionPress = () => {
    const newState = !isLiked
    setIsLiked(newState)
    if (newState) {
      onReactionPress?.('LIKE')
    }
  }

  const postedAt = formatRelativeTime(comment.createdAt) || 'Just now'

  return (
    <View className='px-4 py-3 border-b border-zinc-200 dark:border-zinc-700'>
      <View className='flex-row gap-3'>
        {/* Avatar */}
        <View className='w-8 h-8 rounded-full bg-blue-400 items-center justify-center flex-shrink-0'>
          <Text className='text-white text-xs font-bold'>
            {comment.authorName.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Content */}
        <View className='flex-1'>
          {/* Author & Time */}
          <View className='flex-row items-center justify-between mb-1'>
            <View className='flex-row items-center gap-2 flex-1'>
              <Text className='text-sm font-semibold text-zinc-900 dark:text-white'>
                {comment.authorName}
              </Text>
              <Text className='text-xs text-zinc-500'>{postedAt}</Text>
              {comment.isEdited && (
                <Text className='text-xs text-zinc-500'>{text.commentItem.edited}</Text>
              )}
            </View>
            <TouchableOpacity onPress={onMorePress} className='p-1 -mr-2'>
              <MoreHorizontal size={16} color='#999' />
            </TouchableOpacity>
          </View>

          {/* Comment Text */}
          <Text className='text-sm text-zinc-800 dark:text-zinc-200 mb-2'>
            {comment.content}
          </Text>

          {/* Actions */}
          <View className='flex-row items-center gap-4'>
            <TouchableOpacity
              onPress={handleReactionPress}
              className='flex-row items-center gap-1'
              activeOpacity={0.6}
            >
              {isLiked ? (
                <Text className='text-sm'>❤️</Text>
              ) : (
                <Heart size={14} color='#999' />
              )}
              {comment.reactions > 0 && (
                <Text className='text-xs text-zinc-500'>{comment.reactions}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onReply}
              className='flex-row items-center gap-1'
              activeOpacity={0.6}
            >
              <MessageCircle size={14} color='#999' />
              <Text className='text-xs text-zinc-600 dark:text-zinc-400'>
                {text.commentItem.reply}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Replies */}
          {comment.replyCount > 0 && (
            <TouchableOpacity
              onPress={onViewReplies}
              className='mt-2 py-1'
              activeOpacity={0.6}
            >
              <Text className='text-xs text-blue-600 dark:text-blue-400 font-semibold'>
                {comment.replyCount === 1 ? '1 reply' : `${comment.replyCount} replies`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}
