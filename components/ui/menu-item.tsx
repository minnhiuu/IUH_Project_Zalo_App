import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Pressable, Text, HStack, VStack } from '@/components/ui'
import { useTheme } from '@/context'

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
  const { colors } = useTheme()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        backgroundColor: colors.background
      })}
    >
      <HStack style={{ 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.divider
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
          <Text style={{ fontSize: 16, color: colors.text, fontWeight: '400' }}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </VStack>

        {/* Right Component or Chevron */}
        {rightComponent || (onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.iconMuted} />
        ))}
      </HStack>
    </Pressable>
  )
}
