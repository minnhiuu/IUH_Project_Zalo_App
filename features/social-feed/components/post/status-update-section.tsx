import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Clock } from 'lucide-react-native'

interface StatusUpdateSectionProps {
  onPress?: () => void
}

export function StatusUpdateSection({ onPress }: StatusUpdateSectionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className='bg-zinc-900 border border-zinc-800 rounded-lg p-4 mx-4 mb-4'
      activeOpacity={0.7}
    >
      <View className='flex-row items-center gap-3'>
        <Clock size={20} color='#3b82f6' />
        <Text className='flex-1 text-sm text-zinc-400'>
          Cập nhật trạng thái 24 giờ
        </Text>
        <Text className='text-zinc-500'>+</Text>
      </View>
    </TouchableOpacity>
  )
}
