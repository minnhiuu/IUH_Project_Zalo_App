'use client'
import React from 'react'
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
  TextProps,
  View,
  ViewProps,
  ActivityIndicatorProps
} from 'react-native'
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'primary'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

type IButtonProps = PressableProps & {
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  isDisabled?: boolean
}

const Button = React.forwardRef<View, IButtonProps>(function Button(
  { className, variant = 'default', size = 'default', style, disabled, isDisabled, children, ...props },
  ref
) {
  const isButtonDisabled = disabled || isDisabled

  const getVariantStyle = () => {
    switch (variant) {
      case 'destructive':
        return { backgroundColor: '#ef4444' }
      case 'outline':
        return { borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'transparent' }
      case 'secondary':
        return { backgroundColor: '#f3f4f6' }
      case 'ghost':
        return { backgroundColor: 'transparent' }
      case 'link':
        return { backgroundColor: 'transparent' }
      case 'primary':
        return { backgroundColor: '#0068FF' }
      default:
        return { backgroundColor: '#3b82f6' }
    }
  }

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { minHeight: 32, paddingHorizontal: 12 }
      case 'lg':
        return { minHeight: 40, paddingHorizontal: 32 }
      case 'icon':
        return { minHeight: 36, minWidth: 36 }
      default:
        return { paddingHorizontal: 16, paddingVertical: 8 }
    }
  }

  // Parse className for h-* and rounded-* utilities
  const getClassNameStyle = () => {
    const classStyles: any = {}
    if (!className) return classStyles

    const classes = className.split(' ')
    classes.forEach((cls) => {
      if (cls.startsWith('h-')) {
        const heightValue = cls.replace('h-', '')
        if (heightValue === '14') classStyles.height = 56
        else if (heightValue === '12') classStyles.height = 48
        else if (heightValue === '10') classStyles.height = 40
        else if (heightValue === '8') classStyles.height = 32
      }
      if (cls.startsWith('rounded-')) {
        const roundedValue = cls.replace('rounded-', '')
        if (roundedValue === 'full') classStyles.borderRadius = 100
        else if (roundedValue === 'xl') classStyles.borderRadius = 12
        else if (roundedValue === 'lg') classStyles.borderRadius = 8
      }
      if (cls.startsWith('w-')) {
        const widthValue = cls.replace('w-', '')
        if (widthValue === 'full') classStyles.width = '100%'
      }
    })
    return classStyles
  }

  return (
    <Pressable
      ref={ref as any}
      disabled={isButtonDisabled}
      style={(state) => {
        const classNameStyles = getClassNameStyle()
        return [
          {
            borderRadius: 6,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          },
          getVariantStyle(),
          getSizeStyle(),
          classNameStyles,
          isButtonDisabled && { opacity: 0.4 },
          typeof style === 'function' ? style(state) : style
        ]
      }}
      {...props}
    >
      {children}
    </Pressable>
  )
})

type IButtonTextProps = TextProps & {
  className?: string
}

const ButtonText = React.forwardRef<Text, IButtonTextProps>(function ButtonText({ className, style, ...props }, ref) {
  return (
    <Text
      ref={ref}
      style={[
        {
          fontSize: 14,
          color: '#ffffff'
        },
        style
      ]}
      {...props}
    />
  )
})

type IButtonSpinnerProps = ActivityIndicatorProps & {
  className?: string
}

const ButtonSpinner = React.forwardRef<ActivityIndicator, IButtonSpinnerProps>(function ButtonSpinner(
  { className, style, color = '#ffffff', size = 'small', ...props },
  ref
) {
  return <ActivityIndicator ref={ref as any} color={color} size={size} {...props} />
})

type IButtonIcon = ViewProps & {
  className?: string
  as?: React.ComponentType<any>
  height?: number
  width?: number
}

const ButtonIcon = React.forwardRef<View, IButtonIcon>(function ButtonIcon(
  { className, as: AsComponent, style, height = 16, width = 16, ...props },
  ref
) {
  if (AsComponent) {
    return <AsComponent {...props} style={[{ width, height }, style]} />
  }
  return <View ref={ref} style={[{ height, width }, style]} {...props} />
})

type IButtonGroupProps = ViewProps & {
  className?: string
  space?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  isAttached?: boolean
}

const ButtonGroup = React.forwardRef<View, IButtonGroupProps>(function ButtonGroup(
  { className, space = 'md', flexDirection = 'column', isAttached = false, style, ...props },
  ref
) {
  const getSpaceValue = () => {
    if (isAttached) return 0
    const spaces = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 28, '4xl': 32 }
    return spaces[space]
  }

  return (
    <View
      ref={ref}
      style={[
        {
          flexDirection,
          gap: getSpaceValue()
        },
        style
      ]}
      {...props}
    />
  )
})

Button.displayName = 'Button'
ButtonText.displayName = 'ButtonText'
ButtonSpinner.displayName = 'ButtonSpinner'
ButtonIcon.displayName = 'ButtonIcon'
ButtonGroup.displayName = 'ButtonGroup'

export { Button, ButtonText, ButtonSpinner, ButtonIcon, ButtonGroup }
