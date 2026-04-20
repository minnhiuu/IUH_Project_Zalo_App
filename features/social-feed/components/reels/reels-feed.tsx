import { View, FlatList, Text, TouchableOpacity } from 'react-native'
import { useInfiniteSocialReels } from '../../queries/use-queries'
import { ReelCard } from './reel-card'
import type { SocialPost } from '../../types/post'

interface ReelsFeedProps {
  onReactionPress?: (reel: SocialPost) => void
  onCommentPress?: (reel: SocialPost) => void
  onSharePress?: (reel: SocialPost) => void
}

export function ReelsFeed({
  onReactionPress,
  onCommentPress,
  onSharePress
}: ReelsFeedProps) {
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteSocialReels(20)

  const reels = data?.pages.flatMap((page) => page.posts) ?? []

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text className='text-zinc-500'>Loading reels...</Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text className='text-zinc-500 mb-4'>Failed to load reels</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className='px-4 py-2 bg-blue-500 rounded-lg'
        >
          <Text className='text-white font-semibold'>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <FlatList
      data={reels}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ReelCard
          reel={item}
          onReactionPress={() => onReactionPress?.(item)}
          onCommentPress={() => onCommentPress?.(item)}
          onSharePress={() => onSharePress?.(item)}
        />
      )}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className='py-4'>
            <Text className='text-center text-zinc-500'>Loading more...</Text>
          </View>
        ) : null
      }
    />
  )
}
