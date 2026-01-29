import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface ListItemProps {
  title: string
  subtitle?: string
  leftIcon?: keyof typeof Ionicons.glyphMap
  leftComponent?: React.ReactNode
  rightIcon?: keyof typeof Ionicons.glyphMap
  rightComponent?: React.ReactNode
  onPress?: () => void
  showArrow?: boolean
  disabled?: boolean
  className?: string
}

export function ListItem({
  title,
  subtitle,
  leftIcon,
  leftComponent,
  rightIcon,
  rightComponent,
  onPress,
  showArrow = true,
  disabled = false,
  className
}: ListItemProps) {
  const content = (
    <>
      {/* Left */}
      {(leftIcon || leftComponent) && (
        <View className='mr-3'>
          {leftComponent || (
            <View className='w-10 h-10 rounded-full bg-background-secondary items-center justify-center'>
              <Ionicons name={leftIcon!} size={20} color='#666666' />
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <View className='flex-1'>
        <Text className='text-base text-text' numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text className='text-sm text-text-secondary mt-0.5' numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right */}
      {(rightIcon || rightComponent || showArrow) && (
        <View className='ml-3 flex-row items-center'>
          {rightComponent}
          {rightIcon && !rightComponent && <Ionicons name={rightIcon} size={20} color='#999999' />}
          {showArrow && !rightComponent && !rightIcon && <Ionicons name='chevron-forward' size={20} color='#CCCCCC' />}
        </View>
      )}
    </>
  )

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        className={`
          flex-row items-center px-4 py-3 bg-white
          ${disabled ? 'opacity-50' : ''}
          ${className || ''}
        `}
      >
        {content}
      </TouchableOpacity>
    )
  }

  return (
    <View
      className={`
        flex-row items-center px-4 py-3 bg-white
        ${disabled ? 'opacity-50' : ''}
        ${className || ''}
      `}
    >
      {content}
    </View>
  )
}

export default ListItem
