import { useMemo, useState } from 'react'
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native'

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
  const [open, setOpen] = useState(false)
  const options = useMemo(() => VISIBILITY_OPTIONS, [])

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className='flex-row items-center gap-2 bg-white rounded-lg p-3 border border-gray-200'
        activeOpacity={0.7}
      >
        <Text className='text-2xl'>{current?.icon}</Text>
        <View className='flex-1'>
          <Text className='text-xs text-gray-500'>Quyền riêng tư</Text>
          <Text className='text-sm font-semibold text-gray-900'>
            {current?.label}
          </Text>
        </View>
        <View className='px-3 py-2 bg-gray-100 rounded-lg border border-gray-200'>
          <Text className='text-xs font-semibold text-gray-700'>Chọn</Text>
        </View>
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType='fade'
        onRequestClose={() => setOpen(false)}
      >
        <Pressable className='flex-1 bg-black/40' onPress={() => setOpen(false)} />
        <View className='absolute left-4 right-4 top-1/3 bg-white rounded-2xl p-4 border border-gray-200'>
          <Text className='text-sm font-semibold text-gray-900 mb-3'>Chọn quyền riêng tư</Text>
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={`flex-row items-center gap-3 px-3 py-2 rounded-lg ${active ? 'bg-blue-50' : 'bg-transparent'}`}
                activeOpacity={0.7}
              >
                <Text className='text-xl'>{opt.icon}</Text>
                <Text className={`text-sm font-semibold ${active ? 'text-blue-700' : 'text-gray-800'}`}>
                  {opt.label}
                </Text>
                {active && <Text className='ml-auto text-xs text-blue-700 font-semibold'>Đang chọn</Text>}
              </TouchableOpacity>
            )
          })}
        </View>
      </Modal>
    </>
  )
}
