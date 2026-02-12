import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Pressable, Text, HStack, VStack } from '@/components/ui'

interface MenuItemProps {
  icon?: keyof typeof Ionicons.glyphMap
  iconColor?: string
  iconBg?: string
  title: string
  subtitle?: string
  leftComponent?: React.ReactNode
  rightComponent?: React.ReactNode
  onPress?: () => void
  disabled?: boolean
}

export function MenuItem({
  icon,
  iconColor = '#666',
  iconBg,
  title,
  subtitle,
  leftComponent,
  rightComponent,
  onPress,
  disabled = false
}: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        backgroundColor: '#ffffff'
      })}
    >
      <HStack style={{ 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0'
      }} space="md">
        {/* Left Icon/Component */}
        {leftComponent || (icon && (
          <View
            style={{
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
        ))}

        {/* Title & Subtitle */}
        <VStack style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, color: '#000000', fontWeight: '400' }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 14, color: '#666666', marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </VStack>

        {/* Right Component or Chevron */}
        {rightComponent || (onPress && (
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        ))}
      </HStack>
    </Pressable>
  )
}
