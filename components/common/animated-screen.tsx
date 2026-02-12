import React, { useEffect, useRef } from 'react'
import { Animated, ViewStyle } from 'react-native'

interface AnimatedScreenProps {
  children: React.ReactNode
  style?: ViewStyle
  duration?: number
  delay?: number
  animationType?: 'fade' | 'slide' | 'scale' | 'slide_horizontal'
}

export function AnimatedScreen({
  children,
  style,
  duration = 300,
  delay = 0,
  animationType = 'fade'
}: AnimatedScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = []

    if (animationType === 'fade') {
      animations.push(
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
          delay
        })
      )
    } else if (animationType === 'slide') {
      animations.push(
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
            delay
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
            delay
          })
        ])
      )
    } else if (animationType === 'slide_horizontal') {
      animations.push(
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
            delay
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration,
            useNativeDriver: true,
            delay
          })
        ])
      )
    } else if (animationType === 'scale') {
      animations.push(
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
            delay
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
            delay
          })
        ])
      )
    }

    Animated.sequence(animations).start()
  }, [fadeAnim, slideAnim, scaleAnim, duration, delay, animationType])

  const getAnimatedStyle = () => {
    switch (animationType) {
      case 'slide':
        return {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      case 'slide_horizontal':
        return {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }]
        }
      case 'scale':
        return {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      case 'fade':
      default:
        return {
          opacity: fadeAnim
        }
    }
  }

  return <Animated.View style={[{ flex: 1 }, getAnimatedStyle(), style]}>{children}</Animated.View>
}
