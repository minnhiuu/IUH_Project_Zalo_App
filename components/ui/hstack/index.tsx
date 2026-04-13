import React from 'react'
import { View, ViewProps } from 'react-native'

type SpaceValue = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'

type IHStackProps = ViewProps & {
  className?: string
  space?: SpaceValue | string
  reversed?: boolean
}

const HStack = React.forwardRef<React.ComponentRef<typeof View>, IHStackProps>(function HStack(
  { className, space, reversed = false, style, children, ...props },
  ref
) {
  const getSpacing = () => {
    const spacingMap: Record<SpaceValue, number> = {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32
    }
    return space ? spacingMap[space as SpaceValue] || 0 : 0
  }

  const spacing = getSpacing()

  return (
    <View
      style={[
        {
          flexDirection: reversed ? 'row-reverse' : 'row',
          gap: spacing
        },
        style
      ]}
      {...props}
      ref={ref}
    >
      {children}
    </View>
  )
})

HStack.displayName = 'HStack'

export { HStack }
