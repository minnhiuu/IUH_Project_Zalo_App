import { View, Text, TouchableOpacity, Image } from 'react-native'
import { useEffect, useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react-native'
import { formatRelativeTime } from '@/utils/dateUtils'
import { UserAvatar } from '@/components/common/user-avatar'
import { useSocialText } from '../../i18n/use-social-text'
import type { SocialPost } from '../../types/post'
import type { ReactionType } from '../../types/reaction'
import { ReactionPicker, REACTION_EMOJIS } from './reaction-picker'
import { MediaSection } from './media-section'
import { Image as ExpoImage } from 'expo-image'

interface PostCardProps {
  post: SocialPost
  onReactionPress?: (reactionType: ReactionType, isRemoving: boolean) => void
  onReactionsSummaryPress?: (initialReactionType?: ReactionType) => void
  onCommentPress?: () => void
  onSharePress?: () => void
  onMediaPress?: (index: number, mediaList?: SocialPost['media']) => void
  onMorePress?: () => void
  currentUserId?: string | null
  currentUserName?: string
  currentUserAvatar?: string | null
}

export function PostCard({
  post,
  onReactionPress,
  onReactionsSummaryPress,
  onCommentPress,
  onSharePress,
  onMediaPress,
  onMorePress,
  currentUserId,
  currentUserName,
  currentUserAvatar
}: PostCardProps) {
  const { text, language } = useSocialText()
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(
    (post.currentUserReaction as ReactionType) || null
  )

  useEffect(() => {
    setSelectedReaction((post.currentUserReaction as ReactionType) || null)
  }, [post.currentUserReaction])

  // Prefetch media for post and shared post
  useEffect(() => {
    const prefetchMedia = (mediaList?: SocialPost['media']) => {
      if (!mediaList) return
      mediaList.forEach((item) => {
        if (item.url) {
          void ExpoImage.prefetch(item.url).catch(() => {
            // Silently handle prefetch errors
          })
        }
      })
    }

    prefetchMedia(post.media)
    if (post.postType === 'SHARE' && post.sharedPost?.media) {
      prefetchMedia(post.sharedPost.media)
    }
  }, [post.media, post.postType, post.sharedPost?.media])

  const handleReactionPress = (type: ReactionType) => {
    const isRemoving = type === selectedReaction
    setSelectedReaction(isRemoving ? null : type)
    setShowReactionPicker(false)
    onReactionPress?.(type, isRemoving)
  }

  const postedAtLabel = formatRelativeTime(post.postedAt) || text.post.justNow
  const visibilityLabel = text.post.visibility[post.visibility]
  const isCurrentUserPost = Boolean(currentUserId && post.authorId && currentUserId === post.authorId)
  const isSameNameAsCurrentUser = Boolean(
    !isCurrentUserPost &&
      currentUserName &&
      post.authorName &&
      currentUserName.trim().toLowerCase() === post.authorName.trim().toLowerCase()
  )
  const shouldUseCurrentUserProfile = isCurrentUserPost || isSameNameAsCurrentUser
  const displayAuthorName = shouldUseCurrentUserProfile ? currentUserName || post.authorName : post.authorName
  const displayAuthorAvatar = shouldUseCurrentUserProfile
    ? currentUserAvatar || post.authorAvatar
    : post.authorAvatar
  const isShareDisabled = isCurrentUserPost

  return (
    <View className='bg-white rounded-xl p-4 mb-4 border border-gray-200'>
      {/* Header */}
      <View className='flex-row justify-between items-start mb-3'>
        <View className='flex-row items-center flex-1'>
          <UserAvatar
            source={displayAuthorAvatar || undefined}
            name={displayAuthorName || 'Người dùng'}
            size='md'
            className='mr-3'
          />
          <View className='flex-1'>
            <Text className='text-base font-semibold text-gray-900'>
              {displayAuthorName}
            </Text>
            {post.postType === 'SHARE' && (
              <Text className='text-xs text-gray-500'>{text.post.sharedAPost}</Text>
            )}
            <View className='flex-row items-center gap-1 mt-0.5'>
              <Text className='text-xs text-gray-500'>{postedAtLabel}</Text>
              <Text className='text-xs text-gray-500'>• {visibilityLabel}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={onMorePress} className='p-2 -mr-2'>
          <MoreHorizontal size={20} color='#666' />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text className='text-sm text-gray-800 mb-3 leading-5'>
        {post.content}
      </Text>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <View className='mb-3'>
          <MediaSection media={post.media} onMediaPress={(index) => onMediaPress?.(index, post.media)} />
        </View>
      )}

      {/* Shared Post Preview */}
      {post.postType === 'SHARE' && post.sharedPost && (
        <View className='border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50'>
          <View className='flex-row items-center mb-2'>
            <UserAvatar
              source={post.sharedPost.authorAvatar || undefined}
              name={post.sharedPost.authorName || 'Người dùng'}
              size='sm'
              className='mr-2'
            />
            <Text className='text-sm font-semibold text-gray-800'>
              {post.sharedPost.authorName}
            </Text>
          </View>
          <Text className='text-sm text-gray-700 mb-2'>
            {post.sharedPost.content}
          </Text>
          {post.sharedPost.media && post.sharedPost.media.length > 0 && (
            <MediaSection
              media={post.sharedPost.media}
              onMediaPress={(index) => onMediaPress?.(index, post.sharedPost?.media)}
            />
          )}
        </View>
      )}

      {/* Stats */}
      <View className='flex-row justify-between items-center py-2 border-t border-b border-gray-200 mb-3'>
        <TouchableOpacity
          className='flex-row items-center gap-2'
          activeOpacity={0.7}
          disabled={post.reactions <= 0}
          onPress={() => onReactionsSummaryPress?.(post.topReactions?.[0] ?? 'LIKE')}
        >
          {post.topReactions && post.topReactions.length > 0 && (
            <View className='flex-row'>
              {post.topReactions.slice(0, 3).map((reaction, index) => (
                <Text key={`${reaction}-${index}`} className='text-sm'>
                  {REACTION_EMOJIS[reaction]}
                </Text>
              ))}
            </View>
          )}
          <Text className='text-xs text-gray-500'>
            {post.reactions > 0 && `${post.reactions} reactions`}
          </Text>
        </TouchableOpacity>
        <View className='flex-row gap-4'>
          {post.comments > 0 && (
            <Text className='text-xs text-gray-500'>{post.comments} comments</Text>
          )}
          {post.shares > 0 && (
            <Text className='text-xs text-gray-500'>{post.shares} shares</Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View className='flex-row justify-around'>
        <TouchableOpacity
          onPress={() => setShowReactionPicker(!showReactionPicker)}
          className='flex-row items-center gap-2 py-2 px-4'
          activeOpacity={0.6}
        >
          {selectedReaction ? (
            <Text className='text-lg'>{REACTION_EMOJIS[selectedReaction]}</Text>
          ) : (
            <Heart size={20} color='#666' />
          )}
          <Text className='text-sm text-gray-600'>React</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onCommentPress}
          className='flex-row items-center gap-2 py-2 px-4'
          activeOpacity={0.6}
        >
          <MessageCircle size={20} color='#666' />
          <Text className='text-sm text-gray-600'>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isShareDisabled ? undefined : onSharePress}
          disabled={isShareDisabled}
          className={`flex-row items-center gap-2 py-2 px-4 ${isShareDisabled ? 'opacity-40' : ''}`}
          activeOpacity={0.6}
        >
          <Share2 size={20} color={isShareDisabled ? '#bbb' : '#666'} />
          <Text className={`text-sm ${isShareDisabled ? 'text-gray-400' : 'text-gray-600'}`}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Reaction Picker */}
      {showReactionPicker && (
        <View className='absolute bottom-20 left-8 z-50'>
          <ReactionPicker
            isOpen={showReactionPicker}
            onSelectReaction={handleReactionPress}
            currentReaction={selectedReaction}
          />
        </View>
      )}
    </View>
  )
}
