import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { Plus } from 'lucide-react-native'

interface SuggestedFriend {
  id: string
  name: string
  avatar: string
  mutualFriends: number
}

interface MomentsSection {
  suggestedFriends?: SuggestedFriend[]
  onAddFriend?: (friendId: string) => void
  onViewMore?: () => void
}

export function MomentsSection({
  suggestedFriends = [],
  onAddFriend,
  onViewMore
}: MomentsSection) {
  return (
    <View className='bg-blue-50 p-4 mb-2'>
      <Text className='text-black font-bold text-base mb-4'>Khoảnh khác</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* Add moments button */}
        <TouchableOpacity
          onPress={onViewMore}
          className='items-center mr-4'
          activeOpacity={0.7}
        >
          <View className='w-20 h-20 rounded-full bg-white border-2 border-blue-300 items-center justify-center'>
            <Plus size={32} color='#3b82f6' />
          </View>
          <Text className='text-center text-xs text-black mt-2 max-w-20'>
            Thêm khoảnh khác
          </Text>
        </TouchableOpacity>

        {/* Suggested friends */}
        {suggestedFriends.slice(0, 4).map((friend) => (
          <TouchableOpacity
            key={friend.id}
            className='items-center mr-4'
            activeOpacity={0.7}
          >
            <View className='w-20 h-20 rounded-full border-4 border-blue-500 overflow-hidden'>
              <Image
                source={{ uri: friend.avatar }}
                className='w-full h-full'
              />
            </View>
            <Text className='text-center text-xs text-black mt-2 max-w-20'>
              {friend.name}
            </Text>
            <Text className='text-center text-xs text-gray-500'>
              {friend.mutualFriends} bạn chung
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}
