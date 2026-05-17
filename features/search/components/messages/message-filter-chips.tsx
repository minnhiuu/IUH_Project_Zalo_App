import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { MessageSearchFilter } from '../../schemas'

interface MessageFilterChipsProps {
  filters: MessageSearchFilter[]
  onFiltersChange: (filters: MessageSearchFilter[]) => void
  labels: Record<MessageSearchFilter, string>
  className?: string
}

export function MessageFilterChips({ filters, onFiltersChange, labels, className }: MessageFilterChipsProps) {
  const toggleFilter = (filter: MessageSearchFilter) => {
    onFiltersChange(filters.includes(filter) ? filters.filter((item) => item !== filter) : [...filters, filter])
  }

  return (
    <View className={`flex-row ${className || ''}`}>
      {(['link', 'file'] as MessageSearchFilter[]).map((filter) => {
        const active = filters.includes(filter)
        return (
          <TouchableOpacity
            key={filter}
            className='flex-row items-center rounded-full px-4 py-1.5 mr-2 bg-background-secondary'
            onPress={() => toggleFilter(filter)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={active ? 'checkmark-circle' : 'ellipse-outline'}
              size={18}
              color={active ? '#0068FF' : '#AEB4BD'}
            />
            <Text className='ml-1.5 text-sm font-medium text-foreground'>{labels[filter]}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
