import { View, FlatList, Text, TouchableOpacity, Dimensions } from 'react-native'
import { useRef, useState, useMemo } from 'react'
import { useInfiniteSocialReels } from '../../queries/use-queries'
import { useMyProfile, useUserById } from '@/features/users'
import { useAuthStore } from '@/store'
import { useQueries } from '@tanstack/react-query'
import { userApi } from '@/features/users/api/user.api'
import { ReelCard } from './reel-card'
import type { SocialPost } from '../../types/post'

interface ReelsFeedProps {
  onReactionPress?: (reel: SocialPost, isRemoving: boolean) => void
  onCommentPress?: (reel: SocialPost) => void
  onSharePress?: (reel: SocialPost) => void
  itemHeight?: number
}

export function ReelsFeed({
  onReactionPress,
  onCommentPress,
  onSharePress,
  itemHeight
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

  const reelsRaw = useMemo(() => {
    const raw = data?.pages.flatMap((page) => page.posts) ?? []
    const seen = new Set<string>()
    return raw.filter((post) => {
      if (!post.id || seen.has(post.id)) return false
      seen.add(post.id)
      return true
    })
  }, [data])

  const { data: myProfile } = useMyProfile()
  const authStoreUser = useAuthStore((state) => state.user)
  const currentUserId = (myProfile?.id || authStoreUser?.id || null) as string | null
  const { data: myProfileById } = useUserById(currentUserId ?? '', Boolean(currentUserId))

  const currentUserName = useMemo(() => {
    const profile = myProfile as
      | ({ fullName?: string | null; name?: string | null; username?: string | null } & Record<string, unknown>)
      | null
      | undefined

    return (
      profile?.fullName?.trim() ||
      (myProfileById as { fullName?: string | null } | null | undefined)?.fullName?.trim() ||
      authStoreUser?.fullName?.trim() ||
      profile?.name?.trim() ||
      profile?.username?.trim() ||
      'Bạn'
    )
  }, [myProfile, myProfileById, authStoreUser?.fullName])

  const currentUserAvatarFromProfile = useMemo(() => {
    const profile = myProfile as
      | ({
        avatar?: string | null
        avatarUrl?: string | null
        photoUrl?: string | null
        profileAvatar?: string | null
        imageUrl?: string | null
      } & Record<string, unknown>)
      | null
      | undefined

    const profileById = myProfileById as
      | ({
        avatar?: string | null
        avatarUrl?: string | null
        photoUrl?: string | null
        profileAvatar?: string | null
        imageUrl?: string | null
      } & Record<string, unknown>)
      | null
      | undefined

    return (
      profileById?.avatar ||
      profileById?.avatarUrl ||
      profileById?.photoUrl ||
      profileById?.profileAvatar ||
      profileById?.imageUrl ||
      authStoreUser?.avatar ||
      profile?.avatar ||
      profile?.avatarUrl ||
      profile?.photoUrl ||
      profile?.profileAvatar ||
      profile?.imageUrl ||
      null
    )
  }, [myProfile, myProfileById, authStoreUser?.avatar])

  const unresolvedAuthorIds = useMemo<string[]>(() => {
    const ids = new Set<string>()
    reelsRaw.forEach((reel) => {
      if (!reel.authorId || reel.authorId === currentUserId) return
      if (!reel.authorAvatar || reel.authorName === 'Unknown user') {
        ids.add(reel.authorId)
      }
    })
    return Array.from(ids)
  }, [reelsRaw, currentUserId])

  const authorQueries = useQueries({
    queries: unresolvedAuthorIds.map((authorId) => ({
      queryKey: ['social-reel-author', authorId],
      queryFn: async () => {
        const response = await userApi.getUserById(authorId)
        return response.data.data ?? null
      },
      enabled: Boolean(authorId),
      staleTime: 5 * 60 * 1000
    }))
  })

  const authorProfileMap = useMemo(() => {
    const map = new Map<string, { fullName?: string; avatar?: string | null }>()
    unresolvedAuthorIds.forEach((authorId, index) => {
      const authorData = authorQueries[index]?.data
      if (authorData) {
        map.set(authorId, {
          fullName: authorData.fullName,
          avatar: authorData.avatar
        })
      }
    })
    return map
  }, [authorQueries, unresolvedAuthorIds])

  const reels = useMemo(() => {
    return reelsRaw.map((reel) => {
      const fallbackProfile = reel.authorId ? authorProfileMap.get(reel.authorId) : undefined
      const resolvedAuthorName =
        reel.authorName && reel.authorName !== 'Unknown user'
          ? reel.authorName
          : fallbackProfile?.fullName || reel.authorName

      return {
        ...reel,
        authorName: resolvedAuthorName,
        authorAvatar: reel.authorAvatar || fallbackProfile?.avatar || null
      }
    })
  }, [reelsRaw, authorProfileMap])
  const [activeIndex, setActiveIndex] = useState(0)
  const windowHeight = Math.max(1, itemHeight ?? Dimensions.get('window').height)

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index?: number }> }) => {
    if (viewableItems.length === 0) return
    const nextIndex = viewableItems[0]?.index ?? 0
    setActiveIndex(nextIndex)
  }).current

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
          isActive={reels[activeIndex]?.id === item.id}
          height={windowHeight}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserAvatar={currentUserAvatarFromProfile}
          onReactionPress={(isRemoving) => onReactionPress?.(item, isRemoving)}
          onCommentPress={() => onCommentPress?.(item)}
          onSharePress={() => onSharePress?.(item)}
        />
      )}
      pagingEnabled
      snapToInterval={windowHeight}
      decelerationRate='fast'
      showsVerticalScrollIndicator={false}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      getItemLayout={(_, index) => ({ length: windowHeight, offset: windowHeight * index, index })}
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
