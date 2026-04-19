import React, { useEffect, useRef, useCallback } from 'react'
import { Modal, View, Animated, PanResponder, TouchableWithoutFeedback, Dimensions, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSemanticColors } from '@/context/theme-context'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export interface BottomSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean
  /** Callback fired when the bottom sheet closes (user action or code) */
  onClose: () => void
  /** The content to display inside the bottom sheet */
  children: React.ReactNode
  /** Optional title to display at the top of the sheet */
  title?: string
}

export function BottomSheet({ visible, onClose, children, title }: BottomSheetProps) {
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
          style={[
            {
              backgroundColor: semantic.background,
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY }],
              maxHeight: SCREEN_HEIGHT * 0.9
            }
          ]}
          className='rounded-t-[24px] min-h-[200px] shadow-lg border border-border border-b-0'
        >
          {/* Drag Handle Container */}
          <View {...panResponder.panHandlers} className='py-4 items-center w-full bg-transparent'>
            <View className='w-12 h-1.5 bg-secondary rounded-full active:bg-icon-muted' />
          </View>

          {/* Optional Title */}
          {title ? <Text className='text-[19px] font-bold text-foreground text-center mb-4'>{title}</Text> : null}

          {/* Children Content */}
          <View className='w-full flex-shrink'>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  )
}
