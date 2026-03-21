import React, { useEffect, useRef, useCallback } from 'react'
import { Modal, View, Animated, PanResponder, TouchableWithoutFeedback, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSemanticColors } from '@/context/theme-context'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets()
  const semantic = useSemanticColors()

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const backdropOpacity = useRef(new Animated.Value(0)).current

  const openSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40
      })
    ]).start()
  }, [backdropOpacity, translateY])

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      onClose()
    })
  }, [backdropOpacity, translateY, onClose])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          closeSheet()
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 5
          }).start()
        }
      }
    })
  ).current

  useEffect(() => {
    if (visible) {
      openSheet()
    }
  }, [visible, openSheet])

  return (
    <Modal visible={visible} transparent animationType='none' onRequestClose={closeSheet}>
      <View className='flex-1 justify-end'>
        <TouchableWithoutFeedback onPress={closeSheet}>
          <Animated.View className='absolute inset-0 bg-black/50' style={{ opacity: backdropOpacity }} />
        </TouchableWithoutFeedback>

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            {
              backgroundColor: semantic.background,
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY }]
            }
          ]}
          className='rounded-t-[24px] min-h-[200px] shadow-lg'
        >
          <View className='py-3 items-center'>
            <View className='w-10 h-1.5 bg-gray-200 rounded-full' />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  )
}
