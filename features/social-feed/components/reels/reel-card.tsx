import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native'
import { Heart, MessageCircle, Share2 } from 'lucide-react-native'
import type { SocialPost } from '../../types/post'
import { REACTION_EMOJIS } from '../post/reaction-picker'

interface ReelCardProps {
  reel: SocialPost
  onReactionPress?: () => void
  onCommentPress?: () => void
  onSharePress?: () => void
}

export function ReelCard({
  reel,
  onReactionPress,
  onCommentPress,
  onSharePress
}: ReelCardProps) {
  const videoUrl = reel.media?.[0]?.url

  return (
    <View className='relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-2'>
      {videoUrl && (
        <Image
          source={{ uri: videoUrl }}
          className='w-full h-full'
          resizeMode='cover'
        />
      )}

      {/* Overlay Controls */}
      <View className='absolute inset-0 flex justify-between p-4'>
        {/* Author Info */}
        <View className='flex-row items-center gap-2'>
          {reel.authorAvatar && (
            <Image
              source={{ uri: reel.authorAvatar }}
              className='w-8 h-8 rounded-full'
            />
          )}
          <Text className='text-white text-sm font-semibold'>{reel.authorName}</Text>
        </View>

        {/* Actions - Right Side */}
        <View className='items-center gap-4'>
          <TouchableOpacity onPress={onReactionPress} className='items-center' activeOpacity={0.7}>
            <Heart size={24} color='white' />
            <Text className='text-white text-xs mt-1'>{reel.reactions}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCommentPress} className='items-center' activeOpacity={0.7}>
            <MessageCircle size={24} color='white' />
            <Text className='text-white text-xs mt-1'>{reel.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSharePress} className='items-center' activeOpacity={0.7}>
            <Share2 size={24} color='white' />
            <Text className='text-white text-xs mt-1'>{reel.shares}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
