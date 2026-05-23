import { View, Text, TouchableOpacity } from 'react-native'

interface PromotionalBannerProps {
  onPress?: () => void
}

export function PromotionalBanner({ onPress }: PromotionalBannerProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className='mx-4 my-3 rounded-3xl bg-red-500 p-5 flex-row items-center gap-4'
      activeOpacity={0.8}
    >
      <View className='flex-1'>
        <Text className='text-white text-2xl font-bold mb-1'>Cùng Zalo đón Tết</Text>
        <Text className='text-white/90 text-sm'>
          Khám phá những trải nghiệm Tết thú vị
        </Text>
      </View>
      <View className='w-12 h-12 bg-white/20 rounded-full items-center justify-center'>
        <Text className='text-2xl'>🎉</Text>
      </View>
    </TouchableOpacity>
  )
}
