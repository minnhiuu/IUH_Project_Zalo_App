import React from 'react'
import { View, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ChatInputBarProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  placeholder?: string
}

/**
 * Chat input bar with text field and action icons matching Zalo style.
 * Bottom bar: sticker | text input | more | mic | image
 */
export function ChatInputBar({ value, onChangeText, onSend, placeholder = 'Tin nhắn' }: ChatInputBarProps) {
  const hasText = value.trim().length > 0

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: '#fff',
        borderTopWidth: 0.5,
        borderTopColor: '#E5E7EB',
      }}
    >
      {/* Sticker button */}
      <TouchableOpacity style={{ padding: 8 }}>
        <Ionicons name="happy-outline" size={26} color="#6b7280" />
      </TouchableOpacity>

      {/* Text Input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline
        style={{
          flex: 1,
          fontSize: 16,
          color: '#111827',
          maxHeight: 100,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: '#F3F4F6',
          borderRadius: 20,
          marginHorizontal: 4,
        }}
      />

      {hasText ? (
        /* Send button */
        <TouchableOpacity onPress={onSend} style={{ padding: 8 }}>
          <Ionicons name="send" size={24} color="#0068FF" />
        </TouchableOpacity>
      ) : (
        /* Action buttons when no text */
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ padding: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 8 }}>
            <Ionicons name="mic-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: 8 }}>
            <Ionicons name="image-outline" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
