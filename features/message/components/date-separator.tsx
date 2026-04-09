import React from 'react'
import { View } from 'react-native'
import { Text } from '@/components/ui/text'

interface DateSeparatorProps {
  label: string
}

export function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <View style={{ alignItems: 'center', marginVertical: 12 }}>
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.15)',
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 4,
        }}
      >
        <Text style={{ fontSize: 12, color: '#fff', fontWeight: '500' }}>{label}</Text>
      </View>
    </View>
  )
}
