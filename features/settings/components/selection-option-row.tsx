import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface SelectionOptionRowProps {
  label: string
  selected: boolean
  onPress: () => void
}

export function SelectionOptionRow({ label, selected, onPress }: SelectionOptionRowProps) {
  return (
    <TouchableOpacity className='flex-row items-center px-4 py-3 bg-background active:bg-secondary' onPress={onPress}>
      <Text className='flex-1 text-base text-foreground'>{label}</Text>
      {selected && <Ionicons name='checkmark' size={20} color='#0A84FF' />}
    </TouchableOpacity>
  )
}
