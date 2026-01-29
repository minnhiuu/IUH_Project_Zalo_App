import { Ionicons } from '@expo/vector-icons'
import React, { forwardRef, useState } from 'react'
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  isPassword?: boolean
  containerClassName?: string
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, isPassword = false, containerClassName, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    return (
      <View className={`mb-4 ${containerClassName || ''}`}>
        {label && <Text className='text-sm font-medium text-text mb-2'>{label}</Text>}
        <View
          className={`
            flex-row items-center
            bg-background-secondary rounded-xl
            border
            ${error ? 'border-error' : isFocused ? 'border-primary' : 'border-transparent'}
            px-4 py-3
          `}
        >
          {leftIcon && <View className='mr-3'>{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={`flex-1 text-base text-text ${className || ''}`}
            placeholderTextColor='#999999'
            secureTextEntry={isPassword && !showPassword}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ letterSpacing: 0 }}
            {...props}
          />
          {isPassword ? (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className='ml-3'>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color='#999999' />
            </TouchableOpacity>
          ) : (
            rightIcon && <View className='ml-3'>{rightIcon}</View>
          )}
        </View>
        {error && <Text className='text-xs text-error mt-1'>{error}</Text>}
        {hint && !error && <Text className='text-xs text-text-tertiary mt-1'>{hint}</Text>}
      </View>
    )
  }
)

Input.displayName = 'Input'

export default Input
