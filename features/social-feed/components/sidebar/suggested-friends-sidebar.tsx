import { View, ScrollView, TouchableOpacity, Text, Image } from 'react-native'
import { Plus } from 'lucide-react-native'

interface SuggestedFriendsItem {
  id: string
  name: string
  avatar?: string
  mutualFriends: number
}

interface SuggestedFriendsSidebarProps {
  friends?: SuggestedFriendsItem[]
  onAddFriend?: (friendId: string) => void
}

export function SuggestedFriendsSidebar({
  friends = [],
  onAddFriend
}: SuggestedFriendsSidebarProps) {
  return (
    <ScrollView className='bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-700 w-80'>
      <View className='p-4'>
        <Text className='text-base font-bold text-zinc-900 dark:text-white mb-4'>
          People You May Know
        </Text>

        <View className='gap-3'>
          {friends.map((friend) => (
            <View
              key={friend.id}
              className='border border-zinc-200 dark:border-zinc-700 rounded-lg p-3'
            >
              <View className='flex-row items-center gap-3 mb-2'>
                {friend.avatar ? (
                  <Image
                    source={{ uri: friend.avatar }}
                    className='w-10 h-10 rounded-full'
                  />
                ) : (
                  <View className='w-10 h-10 rounded-full bg-blue-400 items-center justify-center'>
                    <Text className='text-white font-bold'>
                      {friend.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className='flex-1'>
                  <Text className='text-sm font-semibold text-zinc-900 dark:text-white'>
                    {friend.name}
                  </Text>
                  <Text className='text-xs text-zinc-500'>
                    {friend.mutualFriends} mutual friends
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => onAddFriend?.(friend.id)}
                className='bg-blue-500 rounded-lg py-2 flex-row items-center justify-center gap-1'
                activeOpacity={0.7}
              >
                <Plus size={16} color='white' />
                <Text className='text-white text-sm font-semibold'>Add Friend</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
