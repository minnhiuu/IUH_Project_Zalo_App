import { View, FlatList, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { useInfiniteMyPosts } from '../queries/use-queries'
import { PostCard } from '../components/post/post-card'
import { PostComposerLauncher } from '../components/composer/post-composer-launcher'

interface MyProfilePageProps {
  userName?: string
  userAvatar?: string
  bio?: string
  onEditProfile?: () => void
}

export function MyProfilePage({
  userName = 'Your Name',
  userAvatar,
  bio = 'This is your bio',
  onEditProfile
}: MyProfilePageProps) {
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteMyPosts(20)

  const posts = data?.pages.flatMap((page) => page.posts) ?? []

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  return (
    <View className='flex-1 bg-zinc-50 dark:bg-black'>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={
          <View className='bg-white dark:bg-zinc-900'>
            {/* Profile Cover */}
            <View className='h-32 bg-gradient-to-r from-blue-400 to-blue-600' />

            {/* Profile Info */}
            <View className='px-4 pb-4'>
              {/* Avatar */}
              <View className='flex-row items-end gap-3 -mt-12 mb-4'>
                {userAvatar ? (
                  <Image
                    source={{ uri: userAvatar }}
                    className='w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900'
                  />
                ) : (
                  <View className='w-24 h-24 rounded-full bg-blue-500 border-4 border-white dark:border-zinc-900 items-center justify-center'>
                    <Text className='text-white text-3xl font-bold'>
                      {userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={onEditProfile}
                  className='flex-1 bg-blue-500 rounded-lg py-2'
                >
                  <Text className='text-white font-semibold text-center'>Edit Profile</Text>
                </TouchableOpacity>
              </View>

              {/* Name & Bio */}
              <Text className='text-xl font-bold text-zinc-900 dark:text-white mb-1'>
                {userName}
              </Text>
              <Text className='text-sm text-zinc-600 dark:text-zinc-400 mb-4'>
                {bio}
              </Text>

              {/* Stats */}
              <View className='flex-row justify-around py-3 border-t border-b border-zinc-200 dark:border-zinc-700'>
                <View className='items-center'>
                  <Text className='text-lg font-bold text-zinc-900 dark:text-white'>
                    {posts.length}
                  </Text>
                  <Text className='text-xs text-zinc-500'>Posts</Text>
                </View>
                <View className='items-center'>
                  <Text className='text-lg font-bold text-zinc-900 dark:text-white'>
                    0
                  </Text>
                  <Text className='text-xs text-zinc-500'>Followers</Text>
                </View>
                <View className='items-center'>
                  <Text className='text-lg font-bold text-zinc-900 dark:text-white'>
                    0
                  </Text>
                  <Text className='text-xs text-zinc-500'>Following</Text>
                </View>
              </View>
            </View>

            {/* Composer */}
            <View className='px-4 py-4'>
              <PostComposerLauncher userName={userName} userAvatar={userAvatar} />
            </View>
          </View>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className='py-4'>
              <Text className='text-center text-zinc-500'>Loading more posts...</Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}
