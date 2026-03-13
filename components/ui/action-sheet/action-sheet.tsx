import React, { useEffect, useRef } from 'react'
import {
  View,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export interface ActionSheetOption {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  color?: string
  iconColor?: string
}

interface ActionSheetProps {
  visible: boolean
  onClose: () => void
  options: ActionSheetOption[]
  title?: string
  isDark?: boolean
}

export function ActionSheet({ visible, onClose, options, title, isDark = false }: ActionSheetProps) {
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current

  useEffect(() => {
    if (visible) {
      // Open animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true
        })
      ]).start()
    } else {
      // Close animation
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true
        })
      ]).start()
    }
  }, [visible, backdropOpacity, translateY])

  const handleOptionPress = (onPress: () => void) => {
    // Close animation first, then execute callback
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      onClose()
      setTimeout(() => onPress(), 100)
    })
  }

  if (!visible) return null

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none" statusBarTranslucent>
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.6]
                })
              }
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Action Sheet Panel */}
        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: isDark ? '#22262B' : '#FFFFFF',
              transform: [{ translateY }]
            }
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: isDark ? '#3E444A' : '#D1D5DB' }]} />
          </View>

          {/* Title */}
          {title && (
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: isDark ? '#DFE2E7' : '#111827' }]}>{title}</Text>
            </View>
          )}

          {/* Options */}
          <ScrollView style={styles.optionsContainer} bounces={false}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  { borderBottomColor: isDark ? '#2C323A' : '#F3F4F6' },
                  index === options.length - 1 && styles.lastOption
                ]}
                onPress={() => handleOptionPress(option.onPress)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: option.iconColor ? `${option.iconColor}15` : isDark ? '#2C323A' : '#F3F4F6' }
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={22}
                    color={option.iconColor || (isDark ? '#B6C1CF' : '#6B7280')}
                  />
                </View>
                <Text
                  style={[
                    styles.optionText,
                    { color: option.color || (isDark ? '#DFE2E7' : '#111827') }
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000'
  },
  panel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center'
  },
  optionsContainer: {
    paddingBottom: 12
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  lastOption: {
    borderBottomWidth: 0
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  optionText: {
    fontSize: 16,
    fontWeight: '400',
    flex: 1
  }
})
