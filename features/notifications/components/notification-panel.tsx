import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme, useSemanticColors } from '@/context/theme-context'
import { NotificationList, type NotificationFilter } from './notification-list'

interface NotificationPanelProps {
  visible: boolean
  onClose: () => void
}

export function NotificationPanel({ visible, onClose }: NotificationPanelProps) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [filter] = useState<NotificationFilter>('all')
  const semantic = useSemanticColors()
  const { isDark } = useTheme()

  const gradientColors = isDark ? ([semantic.input, semantic.divider] as const) : (['#0068FF', '#0055DD'] as const)

  return (
    <Modal visible={visible} animationType='slide' transparent statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={[styles.panel, { backgroundColor: semantic.background }]}>
        {/* New Zalo-style Header */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16 }}>
            <TouchableOpacity onPress={onClose} style={{ padding: 4, marginRight: 8 }}>
              <Ionicons name='arrow-back' size={24} color='white' />
            </TouchableOpacity>

            <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', color: 'white' }}>{t('notification.title')}</Text>

            <TouchableOpacity style={{ padding: 8 }}>
              <Ionicons name='settings-outline' size={22} color='white' />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <NotificationList key={filter} filter={filter} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827'
  },
  closeBtn: {
    padding: 4
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 4
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6'
  },
  filterBtnActive: {
    backgroundColor: '#EFF6FF'
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280'
  },
  filterTextActive: {
    color: '#0068FF'
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 8
  }
})
