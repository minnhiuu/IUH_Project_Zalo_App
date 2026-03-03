import React, { useEffect, useRef } from 'react'
import { Animated, View } from 'react-native'

export function SearchResultSkeleton() {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true
        })
      ])
    ).start()
  }, [opacity])

  return (
    <View className='flex-row items-center bg-background pl-4 py-3'>
      {/* Circle Skeleton */}
      <Animated.View style={{ opacity }} className='w-12 h-12 rounded-full bg-muted mr-4' />
      {/* Content Skeleton */}
      <View className='flex-1 pr-4 py-2 border-b border-divider'>
        <Animated.View style={{ opacity }} className='w-1/2 h-4 bg-muted rounded mb-2' />
        <Animated.View style={{ opacity }} className='w-1/3 h-3 bg-muted rounded' />
      </View>
    </View>
  )
}
