import React from 'react'
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native'

type TextSize = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'

type ITextProps = RNTextProps & {
  className?: string
  size?: TextSize
  isTruncated?: boolean
  bold?: boolean
  underline?: boolean
  strikeThrough?: boolean
  sub?: boolean
  italic?: boolean
  highlight?: boolean
}

const Text = React.forwardRef<RNText, ITextProps>(function Text(
  {
    className,
    isTruncated,
    bold,
    underline,
    strikeThrough,
    size = 'md',
    sub,
    italic,
    highlight,
    style,
    numberOfLines,
    ...props
  },
  ref
) {
  const getFontSize = (): number => {
    const sizeMap: Record<TextSize, number> = {
      '2xs': 10,
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60
    }
    return sizeMap[size]
  }

  const textStyle: TextStyle = {
    fontSize: sub ? getFontSize() * 0.75 : getFontSize(),
    ...(bold && { fontWeight: '700' }),
    ...(italic && { fontStyle: 'italic' }),
    ...(underline && strikeThrough && { textDecorationLine: 'underline line-through' }),
    ...(underline && !strikeThrough && { textDecorationLine: 'underline' }),
    ...(strikeThrough && !underline && { textDecorationLine: 'line-through' }),
    ...(highlight && { backgroundColor: '#ffeb3b' })
  }

  return (
    <RNText
      ref={ref}
      className={className}
      style={[textStyle, style]}
      numberOfLines={isTruncated ? 1 : numberOfLines}
      ellipsizeMode={isTruncated ? 'tail' : undefined}
      {...props}
    />
  )
})

Text.displayName = 'Text'

export { Text }
