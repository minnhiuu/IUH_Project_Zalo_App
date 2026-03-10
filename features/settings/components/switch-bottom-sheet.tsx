import React from 'react'
import { ActivityIndicator, Modal, Pressable, Switch, Text, View } from 'react-native'
import { useTheme } from '@/context'

interface SwitchBottomSheetProps {
  visible: boolean
  title: string
  value: boolean
  onClose: () => void
  onValueChange: (nextValue: boolean) => void
  isSaving?: boolean
}

export function SwitchBottomSheet({
  visible,
  title,
  value,
  onClose,
  onValueChange,
  isSaving = false
}: SwitchBottomSheetProps) {
  const { colors } = useTheme()

  return (
    <Modal transparent visible={visible} animationType='fade' onRequestClose={onClose}>
      <View className='flex-1 justify-end'>
        <Pressable className='absolute inset-0' style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={onClose} />

        <View className='rounded-t-3xl bg-background px-5 pb-8 pt-4'>
          <View className='self-center mb-4 h-1.5 w-10 rounded-full bg-border' />

          <View className='flex-row items-center justify-between py-2'>
            <Text className='flex-1 pr-3 text-base text-foreground'>{title}</Text>
            {isSaving ? (
              <ActivityIndicator size='small' color={colors.tint} />
            ) : (
              <Switch value={value} onValueChange={onValueChange} trackColor={{ true: '#0068FF' }} />
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}
