import React from 'react'
import { View, Text } from 'react-native'

export type CenteredToastVariant = 'success' | 'error' | 'info' | 'warning' | 'none'

interface CenteredToastProps {
  title?: string
  message: string
  variant?: CenteredToastVariant
}

export function CenteredToast({ title, message, variant = 'none' }: CenteredToastProps) {
  const backgroundColor = variant === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(30, 30, 30, 0.95)'
  const shouldShowTitle = title && title !== message

  return (
    <View
      style={{
        maxWidth: '85%',
        minWidth: 160,
        backgroundColor,
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5
      }}
    >
      {shouldShowTitle ? (
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 4 }}>
          {title}
        </Text>
      ) : null}

      <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 22 }}>
        {message}
      </Text>
    </View>
  )
}
