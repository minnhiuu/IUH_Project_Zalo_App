import { tva } from '@gluestack-ui/nativewind-utils/tva'
import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import React from 'react'
import { Text as RNText } from 'react-native'

export const textV4Style = tva({
  base: 'text-foreground',
  variants: {
    variant: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      destructive: 'text-destructive',
      success: 'text-success',
      warning: 'text-warning'
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl'
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'base',
    weight: 'normal'
  }
})

type TextV4Props = VariantProps<typeof textV4Style> &
  React.ComponentProps<typeof RNText> & {
    children: React.ReactNode
  }

export const TextV4 = React.forwardRef<React.ElementRef<typeof RNText>, TextV4Props>(
  ({ variant, size, weight, className, children, ...props }, ref) => {
    return (
      <RNText
        ref={ref}
        className={textV4Style({ variant, size, weight, class: className })}
        {...props}
      >
        {children}
      </RNText>
    )
  }
)

TextV4.displayName = 'TextV4'
