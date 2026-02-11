import { tva } from '@gluestack-ui/nativewind-utils/tva'
import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import React from 'react'
import { Pressable, Text } from 'react-native'

export const buttonV4Style = tva({
  base: 'flex-row items-center justify-center rounded-lg px-4 py-3 active:opacity-80',
  variants: {
    variant: {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      outline: 'bg-transparent border-2 border-primary',
      ghost: 'bg-transparent',
      destructive: 'bg-destructive'
    },
    size: {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4'
    },
    disabled: {
      true: 'opacity-50'
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
})

export const buttonV4TextStyle = tva({
  base: 'font-medium text-center',
  variants: {
    variant: {
      primary: 'text-white',
      secondary: 'text-secondary-foreground',
      outline: 'text-primary',
      ghost: 'text-primary',
      destructive: 'text-white'
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
})

type ButtonV4Props = VariantProps<typeof buttonV4Style> & {
  onPress?: () => void
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export const ButtonV4 = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonV4Props
>(({ variant, size, disabled, onPress, children, className, ...props }, ref) => {
  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={disabled}
      className={buttonV4Style({ variant, size, disabled, class: className })}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={buttonV4TextStyle({ variant, size })}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
})

ButtonV4.displayName = 'ButtonV4'
