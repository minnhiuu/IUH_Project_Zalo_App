import { tva } from '@gluestack-ui/nativewind-utils/tva'
import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import React from 'react'
import { View } from 'react-native'

export const cardV4Style = tva({
  base: 'rounded-lg bg-card p-4 shadow-sm',
  variants: {
    variant: {
      default: 'border border-border',
      elevated: 'shadow-md',
      ghost: 'bg-transparent border-0 shadow-none'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

type CardV4Props = VariantProps<typeof cardV4Style> & {
  children: React.ReactNode
  className?: string
}

export const CardV4 = React.forwardRef<React.ElementRef<typeof View>, CardV4Props>(
  ({ variant, children, className, ...props }, ref) => {
    return (
      <View ref={ref} className={cardV4Style({ variant, class: className })} {...props}>
        {children}
      </View>
    )
  }
)

CardV4.displayName = 'CardV4'
