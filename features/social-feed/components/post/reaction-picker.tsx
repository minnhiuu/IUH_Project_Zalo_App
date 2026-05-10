import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { useState } from 'react'
import { useSocialText } from '../../i18n/use-social-text'
import type { ReactionType } from '../../types/reaction'

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  HAHA: '😂',
  WOW: '😮',
  SAD: '😢',
  ANGRY: '😡'
}

interface ReactionPickerProps {
  isOpen: boolean
  onSelectReaction: (type: ReactionType) => void
  currentReaction?: ReactionType | null
}

export function ReactionPicker({ isOpen, onSelectReaction, currentReaction }: ReactionPickerProps) {
  const { text } = useSocialText()
  const reactions: ReactionType[] = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY']

  if (!isOpen) {
    return null
  }

  return (
    <View className='absolute bottom-12 left-1/2 z-50 flex-row items-center gap-1 rounded-full bg-white border border-gray-200 px-2 py-1.5 shadow-lg'>
      {reactions.map((reaction) => (
        <TouchableOpacity
          key={reaction}
          onPress={() => onSelectReaction(reaction)}
          className={`h-10 w-10 items-center justify-center rounded-full ${
            currentReaction === reaction ? 'bg-blue-100' : 'bg-transparent'
          }`}
          activeOpacity={0.7}
        >
          <Text className='text-2xl'>{REACTION_EMOJIS[reaction]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}
