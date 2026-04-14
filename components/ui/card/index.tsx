'use client'
import React from 'react'
import { View, ViewProps, StyleSheet } from 'react-native'

type CardSize = 'default' | 'sm'

type ICardProps = ViewProps & {
  className?: string
  size?: CardSize
}

const Card = React.forwardRef<React.ComponentRef<typeof View>, ICardProps>(function Card(
  { className, size = 'default', style, ...props },
  ref
) {
  const sizeStyle = size === 'sm' ? { padding: 12, gap: 12 } : { padding: 16, gap: 24 }

  return <View style={[styles.card, sizeStyle, style]} {...props} ref={ref} />
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  }
})

Card.displayName = 'Card'

export { Card }
