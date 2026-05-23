import React, { useEffect } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
  Platform,
  LayoutRectangle
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { useTheme } from '@/context'
import type { ConversationResponse } from '../schemas'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ContextMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  destructive?: boolean
  isLast?: boolean
}

function ContextMenuItem({ icon, label, onPress, destructive, isLast }: ContextMenuItemProps) {
  const { colors } = useTheme()
  const textColor = destructive ? '#EF4444' : colors.text
  const iconColor = destructive ? '#EF4444' : colors.textSecondary

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.menuItem,
        !isLast && { borderBottomWidth: 0.5, borderBottomColor: colors.border }
      ]}
    >
      <Text style={[styles.menuText, { color: textColor }]}>{label}</Text>
      <Ionicons name={icon} size={20} color={iconColor} />
    </TouchableOpacity>
  )
}

interface ConversationContextMenuProps {
  visible: boolean
  onClose: () => void
  conversation: ConversationResponse | null
  anchorLayout: LayoutRectangle | null
  renderPreview: (conversation: ConversationResponse) => React.ReactNode
  onAction: (action: string, conversation: ConversationResponse) => void
}

export function ConversationContextMenu({
  visible,
  onClose,
  conversation,
  anchorLayout,
  renderPreview,
  onAction
}: ConversationContextMenuProps) {
  const { t } = useTranslation()
  const { isDark, colors } = useTheme()
  
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.9)
  const translateY = useSharedValue(10)

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 100 })
      scale.value = withTiming(1, { duration: 100 })
      translateY.value = withTiming(0, { duration: 100 })
    } else {
      opacity.value = withTiming(0, { duration: 100 })
      scale.value = withTiming(0.9, { duration: 100 })
      translateY.value = withTiming(10, { duration: 100 })
    }
  }, [visible])

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }))

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }]
  }))

  if (!visible || !conversation || !anchorLayout) return null

  const handleAction = (action: string) => {
    onAction(action, conversation)
    onClose()
  }

  // Calculate position: try to keep menu within screen bounds
  const menuHeight = 320 // approximate
  const itemY = anchorLayout.y
  const spaceBelow = SCREEN_HEIGHT - (itemY + anchorLayout.height)
  const showAbove = spaceBelow < menuHeight && itemY > menuHeight

  const menuPositionStyle = {
    top: showAbove ? undefined : itemY + anchorLayout.height + 10,
    bottom: showAbove ? SCREEN_HEIGHT - itemY + 10 : undefined,
  }

  const isPinned = conversation.isPinned
  const hasUnread = (conversation.unreadCount || 0) > 0 || !!conversation.manuallyMarkedUnread

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Backdrop */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View 
          style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
          pointerEvents="none"
        />
      </Pressable>

      <View style={styles.container} pointerEvents="box-none">
        {/* Peeled off item preview */}
        <Animated.View 
          style={[
            contentStyle,
            { 
              position: 'absolute', 
              top: anchorLayout.y, 
              left: anchorLayout.x,
              width: anchorLayout.width,
              backgroundColor: colors.background,
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
              zIndex: 1001
            }
          ]}
        >
          {renderPreview(conversation)}
        </Animated.View>

        {/* Menu */}
        <Animated.View 
          style={[
            styles.menuContainer,
            contentStyle,
            menuPositionStyle,
            { 
              backgroundColor: isDark ? '#252932' : '#FFFFFF',
              left: 16,
              width: SCREEN_WIDTH * 0.7,
            }
          ]}
        >
          <ContextMenuItem 
            icon={hasUnread ? 'chatbubble-outline' : 'chatbubble-ellipses-outline'} 
            label={hasUnread ? t('message.conversationOptions.markAsRead') : t('message.conversationOptions.markAsUnread')} 
            onPress={() => handleAction('toggleRead')} 
          />
          <ContextMenuItem 
            icon="pin-outline" 
            label={isPinned ? t('message.conversationOptions.unpin') : t('message.conversationOptions.pin')} 
            onPress={() => handleAction('togglePin')} 
          />
          <ContextMenuItem 
            icon="notifications-off-outline" 
            label={t('message.conversationOptions.mute')} 
            onPress={() => handleAction('mute')} 
          />
          <ContextMenuItem 
            icon="eye-off-outline" 
            label={t('message.conversationOptions.hide')} 
            onPress={() => handleAction('hide')} 
          />
          <ContextMenuItem 
            icon="trash-outline" 
            label={t('message.conversationOptions.deleteConversation')} 
            onPress={() => handleAction('delete')} 
            destructive 
          />
          <ContextMenuItem 
            icon="checkmark-circle-outline" 
            label={t('message.conversationOptions.multiSelect')} 
            onPress={() => handleAction('multiSelect')} 
            isLast 
          />
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1000
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.45)'
  },
  menuContainer: {
    position: 'absolute',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 1002
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500'
  }
})
