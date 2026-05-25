import React from 'react'
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { Text } from '@/components/ui/text'
import { useTheme } from '@/context'

export type QuickCreateMenuAction = {
  id: string
  label: string
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
}

interface QuickCreateMenuProps {
  visible: boolean
  onClose: () => void
  actions: QuickCreateMenuAction[]
}

export function QuickCreateMenu({ visible, onClose, actions }: QuickCreateMenuProps) {
  const { isDark } = useTheme()
  const palette = isDark
    ? {
        overlay: 'rgba(0,0,0,0.34)',
        panel: '#22262D',
        panelBorder: '#2F3640',
        divider: '#353D47',
        icon: '#A3AFBE',
        text: '#F1F5F9'
      }
    : {
        overlay: 'rgba(0,0,0,0.18)',
        panel: '#F6F6FB',
        panelBorder: '#DCE1E8',
        divider: '#D8DEE6',
        icon: '#9AA2AD',
        text: '#1E1F24'
      }

  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: palette.overlay }]} onPress={onClose}>
        <View style={[styles.notch, { backgroundColor: palette.panel, borderColor: palette.panelBorder }]} />
        <View style={[styles.panel, { backgroundColor: palette.panel, borderColor: palette.panelBorder }]}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={action.id}
              activeOpacity={0.7}
              onPress={() => {
                onClose()
                action.onPress()
              }}
              style={[styles.item, index < actions.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.divider }]}
            >
              <Ionicons name={action.icon} size={24} color={palette.icon} />
              <Text style={[styles.itemLabel, { color: palette.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1
  },
  notch: {
    position: 'absolute',
    right: 37,
    top: 94,
    width: 14,
    height: 14,
    transform: [{ rotate: '45deg' }],
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    zIndex: 20
  },
  panel: {
    position: 'absolute',
    right: 8,
    top: 102,
    width: 246,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8
  },
  item: {
    minHeight: 57,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 18
  },
  itemLabel: {
    fontSize: 18,
    fontWeight: '400'
  }
})
