import React from 'react'
import { Image, ImageSourcePropType, Text, View } from 'react-native'

type AvatarSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'

interface UserAvatarProps {
  source?: ImageSourcePropType | string | null
  name?: string
  size?: AvatarSize
  showOnline?: boolean
  isOnline?: boolean
  className?: string
  role?: 'OWNER' | 'ADMIN' | 'MEMBER' | null
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; online: string }> = {
  xxs: {
    container: 'w-4 h-4',
    text: 'text-[8px]',
    online: 'w-1.5 h-1.5 border'
  },
  xs: {
    container: 'w-6 h-6',
    text: 'text-2xs',
    online: 'w-2 h-2 border'
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-xs',
    online: 'w-2.5 h-2.5 border'
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm',
    online: 'w-3 h-3 border-2'
  },
  lg: {
    container: 'w-12 h-12',
    text: 'text-base',
    online: 'w-3.5 h-3.5 border-2'
  },
  xl: {
    container: 'w-16 h-16',
    text: 'text-lg',
    online: 'w-4 h-4 border-2'
  },
  '2xl': {
    container: 'w-20 h-20',
    text: 'text-xl',
    online: 'w-5 h-5 border-2'
  },
  '3xl': {
    container: 'w-24 h-24',
    text: 'text-2xl',
    online: 'w-6 h-6 border-2'
  },
  '4xl': {
    container: 'w-32 h-32',
    text: 'text-3xl',
    online: 'w-7 h-7 border-4'
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()

  const first = parts[0].charAt(0)
  const last = parts[parts.length - 1].charAt(0)
  return (first + last).toUpperCase()
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500'
  ]
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export function UserAvatar({
  source,
  name = '',
  size = 'md',
  showOnline = false,
  isOnline = false,
  className,
  role
}: UserAvatarProps) {
  const hasImage = !!source
  const imageSource = typeof source === 'string' ? { uri: source } : source

  const getRoleBorderColor = () => {
    if (role === 'OWNER') return 'border-[#FFD700]' // Vàng
    if (role === 'ADMIN') return 'border-[#C0C0C0]' // Bạc
    return 'border-transparent'
  }

  const roleBorderWidth = role === 'OWNER' || role === 'ADMIN' ? 'border-[1.5px]' : ''
  const isDarkBg = role === 'OWNER' || role === 'ADMIN'

  return (
    <View className={`relative ${className || ''}`}>
      {hasImage ? (
        <Image
          source={imageSource as ImageSourcePropType}
          className={`${sizeStyles[size].container} rounded-full bg-gray-200 ${roleBorderWidth} ${getRoleBorderColor()}`}
          resizeMode='cover'
        />
      ) : (
        <View
          className={`
            ${sizeStyles[size].container}
            ${getColorFromName(name)}
            rounded-full items-center justify-center
            ${roleBorderWidth} ${getRoleBorderColor()}
          `}
        >
          <Text className={`${sizeStyles[size].text} font-medium text-white`}>{getInitials(name || '?')}</Text>
        </View>
      )}

      {/* Role Key Icon */}
      {role === 'OWNER' && (
        <View className='absolute -bottom-1 -right-1 bg-white rounded-full p-[1px]'>
          <View className='bg-[#FFD700] rounded-full w-4 h-4 items-center justify-center shadow-sm'>
            <Text style={{ fontSize: 9 }}>🔑</Text>
          </View>
        </View>
      )}
      {role === 'ADMIN' && (
        <View className='absolute -bottom-1 -right-1 bg-white rounded-full p-[1px]'>
          <View className='bg-[#C0C0C0] rounded-full w-4 h-4 items-center justify-center shadow-sm'>
            <Text style={{ fontSize: 9 }}>🔑</Text>
          </View>
        </View>
      )}

      {/* Online indicator */}
      {showOnline && !role && (
        <View
          className={`
            absolute bottom-0 right-0
            ${sizeStyles[size].online}
            rounded-full border-white
          `}
          style={{ backgroundColor: isOnline ? '#22C55E' : '#9CA3AF' }}
        />
      )}
    </View>
  )
}
