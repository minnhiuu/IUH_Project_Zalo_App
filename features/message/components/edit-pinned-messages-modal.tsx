import React, { useRef, useEffect } from 'react'
import {
  Modal,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
  Platform,
  PanResponder,
  Dimensions
} from 'react-native'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { type PinnedMessageInfo } from '../schemas'
import { useUnpinMessage } from '../queries/use-mutations'

const SCREEN_HEIGHT = Dimensions.get('window').height

interface EditPinnedMessagesModalProps {
  visible: boolean
  onClose: () => void
  pinnedMessages: PinnedMessageInfo[]
  conversationId: string
  onItemPress?: (messageId: string) => void
}

export function EditPinnedMessagesModal({
  visible,
  onClose,
  pinnedMessages,
  conversationId,
  onItemPress
}: EditPinnedMessagesModalProps) {
  const { t } = useTranslation()
  const { colorScheme } = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()

  const translateY = useRef(new Animated.Value(0)).current
  const unpinMutation = useUnpinMessage()

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes
        return gestureState.dy > 5
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          // Close modal
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true
          }).start(onClose)
        } else {
          // Reset position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6
          }).start()
        }
      }
    })
  ).current

  useEffect(() => {
    if (visible) {
      translateY.setValue(0)
    }
  }, [visible])

  const handleUnpin = (messageId: string) => {
    unpinMutation.mutate({ conversationId, messageId })
  }

  const renderPreviewText = (msg: PinnedMessageInfo) => {
    if (msg.messageType === 'IMAGE' || msg.messageType === 'VIDEO' || msg.messageType === 'FILE') {
      return t('messages.pinned.attachment', { defaultValue: '[Tệp đính kèm]' })
    }
    return msg.contentSnapshot || t('messages.pinned.attachment', { defaultValue: '[Tệp đính kèm]' })
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Animated.View
          style={{
            flex: 1,
            marginTop: insets.top + 40,
            backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
            transform: [{ translateY }]
          }}
        >
          {/* Drag Handle */}
          <View
            {...panResponder.panHandlers}
            style={{
              width: '100%',
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent'
            }}
          >
            <View
              style={{
                width: 40,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: isDark ? '#3F3F46' : '#E5E7EB'
              }}
            />
          </View>

          {/* Header */}
          <View style={{ paddingTop: 10, paddingBottom: 20, alignItems: 'center' }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#F97316',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <Ionicons name="pin" size={32} color="#FFFFFF" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: isDark ? '#FFFFFF' : '#000000', marginBottom: 6 }}>
              {t('messages.pinned.editTitle', { defaultValue: 'Chỉnh sửa danh sách ghim' })}
            </Text>
            <Text style={{ fontSize: 15, color: isDark ? '#A1A1AA' : '#6B7280' }}>
              {t('messages.pinned.editSubtitle', { defaultValue: 'Kéo thả để sắp xếp thứ tự ghim.' })}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: isDark ? '#333333' : '#E5E7EB', marginHorizontal: 16 }} />

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 12 }}>
            {pinnedMessages.map((msg, index) => (
              <View
                key={msg.messageId}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF'
                }}
              >
                {/* Drag handle (Decorative) */}
                <Ionicons
                  name="grid-outline"
                  size={20}
                  color={isDark ? '#A1A1AA' : '#9CA3AF'}
                  style={{ marginRight: 16 }}
                />

                {/* Icon */}
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: '#36A7FF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#36A7FF" />
                </View>

                {/* Content */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onItemPress?.(msg.messageId)}
                  style={{ flex: 1, marginRight: 16 }}
                >
                  <Text style={{ fontSize: 16, color: isDark ? '#FFFFFF' : '#2B2B2B', marginBottom: 2 }} numberOfLines={1}>
                    {renderPreviewText(msg)}
                  </Text>
                </TouchableOpacity>

                {/* Unpin button */}
                <TouchableOpacity
                  onPress={() => handleUnpin(msg.messageId)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="remove-circle-outline" size={26} color={isDark ? '#A1A1AA' : '#9CA3AF'} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 20, paddingBottom: Math.max(insets.bottom + 10, 30) }}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.8}
              style={{
                backgroundColor: '#0068FF',
                paddingVertical: 15,
                borderRadius: 28,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#0068FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>
                {t('messages.pinned.done', { defaultValue: 'Xong' })}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}
