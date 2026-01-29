import React from 'react'
import { View, ViewProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface ContainerProps extends ViewProps {
  children: React.ReactNode
  safeArea?: boolean
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[]
  className?: string
}

export function Container({
  children,
  safeArea = true,
  safeAreaEdges = ['top', 'bottom'],
  className,
  style,
  ...props
}: ContainerProps) {
  const insets = useSafeAreaInsets()

  const safeAreaStyle = safeArea
    ? {
        paddingTop: safeAreaEdges.includes('top') ? insets.top : 0,
        paddingBottom: safeAreaEdges.includes('bottom') ? insets.bottom : 0,
        paddingLeft: safeAreaEdges.includes('left') ? insets.left : 0,
        paddingRight: safeAreaEdges.includes('right') ? insets.right : 0
      }
    : {}

  return (
    <View className={`flex-1 bg-white ${className || ''}`} style={[safeAreaStyle, style]} {...props}>
      {children}
    </View>
  )
}

export default Container
