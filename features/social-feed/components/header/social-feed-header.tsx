import { View, TouchableOpacity, Text, TextInput } from 'react-native'
import { Search, Bell, Edit } from 'lucide-react-native'

interface SocialFeedHeaderProps {
  onSearchPress?: () => void
  onNotificationsPress?: () => void
  onPostPress?: () => void
}

export function SocialFeedHeader({
  onSearchPress,
  onNotificationsPress,
  onPostPress
}: SocialFeedHeaderProps) {
  return (
    <View className='bg-blue-500 px-4 py-3'>
      {/* Status bar */}
      <View className='flex-row items-center justify-between mb-3'>
        <Text className='text-white text-lg font-bold'>06:00</Text>
        <View className='flex-row items-center gap-2'>
          <View className='flex-row gap-0.5'>
            <View className='w-1 h-3 bg-white/70 rounded-sm' />
            <View className='w-1 h-3 bg-white/70 rounded-sm' />
            <View className='w-1 h-3 bg-white/70 rounded-sm' />
          </View>
          <View className='w-4 h-2.5 border border-white/70 rounded-sm' />
          <View className='w-5 h-3 bg-white/70 rounded px-0.5 items-center justify-center'>
            <Text className='text-blue-500 text-xs font-bold'>90</Text>
          </View>
        </View>
      </View>

      {/* Search bar + icons */}
      <View className='flex-row items-center gap-3'>
        <TouchableOpacity
          onPress={onSearchPress}
          className='flex-1 flex-row items-center gap-2 bg-white/90 rounded-full px-4 py-2'
          activeOpacity={0.7}
        >
          <Search size={18} color='#666' />
          <Text className='text-gray-500 text-sm flex-1'>Tìm kiếm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPostPress}
          className='p-2 rounded-full'
          activeOpacity={0.7}
        >
          <Edit size={20} color='white' />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNotificationsPress}
          className='relative p-2 rounded-full'
          activeOpacity={0.7}
        >
          <Bell size={20} color='white' />
          <View className='absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full items-center justify-center'>
            <Text className='text-white text-xs font-bold'>4</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}
