'use client'
import React from 'react'
import { Image, ImageProps, Text, TextProps, View, ViewProps } from 'react-native'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

type IAvatarProps = ViewProps & {
  className?: string
  size?: AvatarSize
}

const Avatar = React.forwardRef<View, IAvatarProps>(function Avatar(
  { className, size = 'md', style, children, ...props },
  ref
) {
  const getSizeValue = () => {
    const sizes = { xs: 24, sm: 32, md: 48, lg: 64, xl: 80, '2xl': 96 }
    return sizes[size]
  }

  const avatarSize = getSizeValue()

  return (
    <View
      ref={ref}
      style={[
        {
          position: 'relative',
          height: avatarSize,
          width: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: '#e5e7eb',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  )
})

type IAvatarBadgeProps = ViewProps & {
  className?: string
}

const AvatarBadge = React.forwardRef<View, IAvatarBadgeProps>(function AvatarBadge(
  { className, style, ...props },
  ref
) {
  return (
    <View
      ref={ref}
      style={[
        {
          position: 'absolute',
          height: 12,
          width: 12,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: '#ffffff',
          right: 0,
          bottom: 0,
          backgroundColor: '#22c55e'
        },
        style
      ]}
      {...props}
    />
  )
})

type IAvatarFallbackTextProps = TextProps & {
  className?: string
}

const AvatarFallbackText = React.forwardRef<Text, IAvatarFallbackTextProps>(function AvatarFallbackText(
  { className, style, children, ...props },
  ref
) {
  const getInitials = (text: string) => {
    return text
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayText = typeof children === 'string' ? getInitials(children) : children

  return (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 12,
          fontWeight: '500',
          textTransform: 'uppercase'
        },
        style
      ]}
      {...props}
    >
      {displayText}
    </Text>
  )
})

type IAvatarImageProps = ImageProps & {
  className?: string
}

const AvatarImage = React.forwardRef<Image, IAvatarImageProps>(function AvatarImage(
  { className, style, ...props },
  ref
) {
  return (
    <Image
      ref={ref}
      style={[
        {
          height: '100%',
          width: '100%',
          borderRadius: 9999,
          position: 'absolute'
        },
        style
      ]}
      resizeMode='cover'
      {...props}
    />
  )
})

type IAvatarGroupProps = ViewProps & {
  className?: string
}

const AvatarGroup = React.forwardRef<View, IAvatarGroupProps>(function AvatarGroup(
  { className, style, ...props },
  ref
) {
  return (
    <View
      ref={ref}
      style={[
        {
          flexDirection: 'row-reverse',
          position: 'relative'
        },
        style
      ]}
      {...props}
    />
  )
})

// Alias for shadcn compatibility
const AvatarFallback = AvatarFallbackText

export { Avatar, AvatarBadge, AvatarFallback, AvatarFallbackText, AvatarGroup, AvatarImage }
