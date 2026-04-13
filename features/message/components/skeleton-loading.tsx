import React, { useEffect, useRef } from 'react'
import { View, Animated } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'

function SkeletonPulse({ style }: { style?: object }) {
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true })
      ])
    )
    animation.start()
    return () => animation.stop()
  }, [opacity])

  return (
    <Animated.View
      style={[
        {
          backgroundColor: isDark ? '#2A2F36' : '#E5E7EB',
          borderRadius: 4,
          opacity
        },
        style
      ]}
    />
  )
}

export function ConversationListSkeleton({ count = 6 }: { count?: number }) {
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'

  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14
          }}
        >
          <SkeletonPulse style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <SkeletonPulse style={{ width: '60%', height: 16, marginBottom: 8, borderRadius: 8 }} />
            <SkeletonPulse style={{ width: '80%', height: 14, borderRadius: 8 }} />
          </View>
          <SkeletonPulse style={{ width: 40, height: 12, borderRadius: 6, marginLeft: 8 }} />
        </View>
      ))}
    </View>
  )
}

export function MessageListSkeleton({ count = 14 }: { count?: number }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 8, justifyContent: 'flex-end' }}>
      {Array.from({ length: count }).map((_, i) => {
        const isOwn = i % 3 === 0
        const width = 120 + (i % 4) * 40
        return (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: isOwn ? 'flex-end' : 'flex-start',
              marginBottom: 12,
              alignItems: 'flex-end'
            }}
          >
            {!isOwn && <SkeletonPulse style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} />}
            <SkeletonPulse style={{ width, height: 40, borderRadius: 16 }} />
          </View>
        )
      })}
    </View>
  )
}
