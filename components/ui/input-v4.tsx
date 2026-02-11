import { tva } from '@gluestack-ui/nativewind-utils/tva'
import type { VariantProps } from '@gluestack-ui/nativewind-utils'
import React from 'react'
import { TextInput, View, Text } from 'react-native'

export const inputV4Style = tva({
  base: 'w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground',
  variants: {
    variant: {
      default: 'border-input',
      error: 'border-destructive'
    },
    size: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'md'
  }
})

type InputV4Props = VariantProps<typeof inputV4Style> &
  React.ComponentProps<typeof TextInput> & {
    label?: string
    error?: string
    helperText?: string
  }

export const InputV4 = React.forwardRef<React.ElementRef<typeof TextInput>, InputV4Props>(
  ({ variant, size, label, error, helperText, className, ...props }, ref) => {
    return (
      <View className="w-full">
        {label && <Text className="mb-2 text-sm font-medium text-foreground">{label}</Text>}
        <TextInput
          ref={ref}
          className={inputV4Style({ variant: error ? 'error' : variant, size, class: className })}
          placeholderTextColor="#8c8c8c"
          {...props}
        />
        {error && <Text className="mt-1 text-sm text-destructive">{error}</Text>}
        {helperText && !error && (
          <Text className="mt-1 text-sm text-muted-foreground">{helperText}</Text>
        )}
      </View>
    )
  }
)

InputV4.displayName = 'InputV4'
