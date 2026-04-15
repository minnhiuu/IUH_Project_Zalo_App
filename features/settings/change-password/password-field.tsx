import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PasswordFieldProps {
  label: string
  value: string
  onChangeText: (v: string) => void
  placeholder: string
  show: boolean
  onToggleShow: () => void
  error?: string
  disabled?: boolean
}

export function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  show,
  onToggleShow,
  error,
  disabled = false
}: PasswordFieldProps) {
  return (
    <View className='gap-1.5'>
      <Text className='text-sm font-medium text-muted-foreground'>{label}</Text>
      <View
        className={`flex-row items-center border rounded-lg px-3 py-2.5 bg-background ${
          error ? 'border-destructive' : 'border-border'
        }`}
      >
        <TextInput
          className='flex-1 text-base text-foreground'
          placeholder={placeholder}
          placeholderTextColor='#9FACBC'
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!show}
          autoCapitalize='none'
          editable={!disabled}
        />
        <TouchableOpacity onPress={onToggleShow} className='pl-2'>
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color='#9FACBC' />
        </TouchableOpacity>
      </View>
      {error && <Text className='text-xs text-destructive'>{error}</Text>}
    </View>
  )
}
