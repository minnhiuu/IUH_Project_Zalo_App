import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/text'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from '@/hooks/use-color-scheme'

interface AiSuggestionChipsProps {
  suggestions: string[]
  onSelect: (text: string) => void
  disabled?: boolean
}

export function AiSuggestionChips({ suggestions, onSelect, disabled = false }: AiSuggestionChipsProps) {
  const isDark = useColorScheme() === 'dark'

  if (!suggestions || suggestions.length === 0) return null

  return (
    <View className="mt-2">
      <View className="flex-row flex-wrap gap-2 px-1">
        {suggestions.map((s, index) => (
          <TouchableOpacity
            key={index}
            disabled={disabled}
            onPress={() => onSelect(s)}
            activeOpacity={0.7}
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              isDark 
                ? 'bg-blue-950 border-blue-800' 
                : 'bg-blue-50 border-blue-200'
            } ${disabled ? 'opacity-50' : 'opacity-100'}`}
          >
            <Ionicons 
              name="sparkles" 
              size={12} 
              color={isDark ? '#93c5fd' : '#1d4ed8'} 
            />
            <Text className={`text-[13px] font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
