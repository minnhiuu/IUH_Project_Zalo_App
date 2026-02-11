import { tva } from '@gluestack-ui/nativewind-utils/tva'
import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import React from 'react'
import { View, Image } from 'react-native'

export const avatarStyle = tva({
  base: 'items-center justify-center overflow-hidden rounded-full bg-muted',
  variants: {
    size: {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
      '2xl': 'h-20 w-20'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

type AvatarV4Props = VariantProps<typeof avatarStyle> & {
  source?: { uri: string } | number
  alt?: string
  fallback?: React.ReactNode
  className?: string
}

export const AvatarV4 = React.forwardRef<React.ElementRef<typeof View>, AvatarV4Props>(
  ({ size, source, fallback, className, ...props }, ref) => {
    return (
      <View ref={ref} className={avatarStyle({ size, class: className })} {...props}>
        {source ? (
          <Image source={source} className="h-full w-full" resizeMode="cover" />
        ) : (
          fallback
        )}
      </View>
    )
  }
)

AvatarV4.displayName = 'AvatarV4'
