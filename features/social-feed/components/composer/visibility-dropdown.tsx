import { View, Text, TouchableOpacity } from 'react-native'

type VisibilityType = 'ALL' | 'FRIEND' | 'ONLY_ME'

interface VisibilityDropdownProps {
  value: VisibilityType
  onChange: (value: VisibilityType) => void
}

const VISIBILITY_OPTIONS: { value: VisibilityType; label: string; icon: string }[] = [
  { value: 'ALL', label: 'Công khai', icon: '🌐' },
  { value: 'FRIEND', label: 'Bạn bè', icon: '👥' },
  { value: 'ONLY_ME', label: 'Riêng tư', icon: '🔒' }
]

export function VisibilityDropdown({ value, onChange }: VisibilityDropdownProps) {
  const current = VISIBILITY_OPTIONS.find((opt) => opt.value === value)

  return (
    <View className='flex-row items-center gap-2 bg-white rounded-lg p-3 border border-gray-200'>
      <Text className='text-2xl'>{current?.icon}</Text>
      <View className='flex-1'>
        <Text className='text-xs text-gray-500'>Quyền riêng tư</Text>
        <Text className='text-sm font-semibold text-gray-900'>
          {current?.label}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          const currentIndex = VISIBILITY_OPTIONS.findIndex((opt) => opt.value === value)
          const nextIndex = (currentIndex + 1) % VISIBILITY_OPTIONS.length
          onChange(VISIBILITY_OPTIONS[nextIndex].value)
        }}
        className='px-3 py-2 bg-gray-100 rounded-lg border border-gray-200'
        activeOpacity={0.7}
      >
        <Text className='text-xs font-semibold text-gray-700'>Đổi</Text>
      </TouchableOpacity>
    </View>
  )
}
