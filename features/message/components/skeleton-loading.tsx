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

export function MessageListSkeleton({
  count = 18,
  includePinned = false
}: {
  count?: number
  includePinned?: boolean
}) {
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'
  const bubbleWidths = [128, 176, 214, 152, 238, 190]

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 8,
        justifyContent: 'flex-start',
        backgroundColor: isDark ? '#0D1117' : '#E8ECEF'
      }}
    >
      {includePinned && (
        <View style={{ paddingHorizontal: 2, paddingTop: 4, paddingBottom: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#1D232D' : '#FFFFFF',
              borderRadius: 12,
              paddingHorizontal: 12,
              minHeight: 68,
              borderWidth: isDark ? 1 : 0,
              borderColor: isDark ? '#2E3745' : 'transparent'
            }}
          >
            <SkeletonPulse style={{ width: 30, height: 30, borderRadius: 15, marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <SkeletonPulse style={{ width: '78%', height: 13, borderRadius: 7, marginBottom: 7 }} />
              <SkeletonPulse style={{ width: '55%', height: 11, borderRadius: 6 }} />
            </View>
            <SkeletonPulse style={{ width: 26, height: 26, borderRadius: 13, marginLeft: 10 }} />
          </View>
        </View>
      )}

      {Array.from({ length: count }).map((_, i) => {
        const isOwn = i % 4 === 0 || i % 7 === 0
        const bubbleWidth = bubbleWidths[i % bubbleWidths.length]
        const bubbleHeight = i % 6 === 0 ? 54 : i % 5 === 0 ? 46 : 38
        const showAvatar = !isOwn && (i % 3 === 0 || i % 5 === 0)
        const isMediaLike = i % 8 === 3
        const isTiny = i % 9 === 4

        return (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: isOwn ? 'flex-end' : 'flex-start',
              marginBottom: 8,
              alignItems: 'flex-end',
              paddingHorizontal: 2
            }}
          >
            {!isOwn && (
              <View style={{ width: 40, alignItems: 'flex-start' }}>
                {showAvatar ? (
                  <SkeletonPulse style={{ width: 30, height: 30, borderRadius: 15, marginRight: 8 }} />
                ) : null}
              </View>
            )}

            <View style={{ maxWidth: '72%' }}>
              {isMediaLike ? (
                <>
                  <SkeletonPulse
                    style={{
                      width: Math.min(230, bubbleWidth + 16),
                      height: 124,
                      borderRadius: 14,
                      borderTopLeftRadius: isOwn ? 14 : 6,
                      borderTopRightRadius: isOwn ? 6 : 14
                    }}
                  />
                  <SkeletonPulse
                    style={{
                      width: Math.max(88, bubbleWidth - 44),
                      height: 10,
                      borderRadius: 6,
                      marginTop: 6
                    }}
                  />
                </>
              ) : (
                <SkeletonPulse
                  style={{
                    width: isTiny ? 88 : bubbleWidth,
                    height: isTiny ? 30 : bubbleHeight,
                    borderRadius: 16,
                    borderTopLeftRadius: isOwn ? 16 : 6,
                    borderTopRightRadius: isOwn ? 6 : 16
                  }}
                />
              )}
              <SkeletonPulse
                style={{
                  width: isOwn ? 46 : 38,
                  height: 8,
                  borderRadius: 4,
                  marginTop: 4,
                  alignSelf: isOwn ? 'flex-end' : 'flex-start'
                }}
              />
            </View>
          </View>
        )
      })}
    </View>
  )
}
