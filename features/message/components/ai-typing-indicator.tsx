import React, { useEffect } from 'react'
import { View, Image, Animated } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'

interface AiTypingIndicatorProps {
  avatarUrl?: any
}

export function AiTypingIndicator({ avatarUrl }: AiTypingIndicatorProps) {
  const isDark = useColorScheme() === 'dark'
  const anim1 = new Animated.Value(0)
  const anim2 = new Animated.Value(0)
  const anim3 = new Animated.Value(0)

  useEffect(() => {
    const createAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true })
          ])
        )
      ])
    }

    Animated.parallel([
      createAnimation(anim1, 0),
      createAnimation(anim2, 150),
      createAnimation(anim3, 300)
    ]).start()
  }, [])

  const translateY = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -4]
    })

  return (
    <View className="flex-row items-end gap-2 px-2 mt-3">
      <View className="w-8 h-8 rounded-full shadow-sm">
        <Image
          source={typeof avatarUrl === 'number' || (avatarUrl && typeof avatarUrl === 'object') ? avatarUrl : { uri: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=ai-assistant-001` }}
          className="w-full h-full rounded-full border border-black/5"
        />
      </View>
      <View className={`rounded-2xl rounded-bl-md px-4 py-3 shadow-sm ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
        <View className="flex-row items-center gap-1.5 h-4">
          <Animated.View
            className="w-2 h-2 bg-blue-400 rounded-full"
            style={{ transform: [{ translateY: translateY(anim1) }] }}
          />
          <Animated.View
            className="w-2 h-2 bg-blue-400 rounded-full"
            style={{ transform: [{ translateY: translateY(anim2) }] }}
          />
          <Animated.View
            className="w-2 h-2 bg-blue-400 rounded-full"
            style={{ transform: [{ translateY: translateY(anim3) }] }}
          />
        </View>
      </View>
    </View>
  )
}
