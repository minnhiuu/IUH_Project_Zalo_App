import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { SEMANTIC } from '@/constants/theme'
import { useTheme } from '@/context/theme-context'
import { useBlockUser, useUnblockUser, useUpdateBlockPreference } from '../queries/use-mutations'
import type { BlockPreference } from '../schemas/block.schema'

interface BlockUserModalProps {
  userId: string
  userName: string
  visible: boolean
  onClose: () => void
  isBlocked?: boolean
  currentPreference?: BlockPreference
}

interface CheckboxRowProps {
  label: string
  iconName: keyof typeof Ionicons.glyphMap
  value: boolean
  onChange: (v: boolean) => void
  isDark: boolean
}

function CheckboxRow({ label, iconName, value, onChange, isDark }: CheckboxRowProps) {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: value ? SEMANTIC.primary : (isDark ? '#475569' : '#CBD5E1'),
          backgroundColor: value ? SEMANTIC.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {value && <Ionicons name='checkmark' size={14} color='#fff' />}
      </View>
      <Ionicons name={iconName} size={18} color={isDark ? '#94A3B8' : '#64748B'} />
      <Text style={{ fontSize: 15, color: isDark ? '#DFE2E7' : '#111827' }}>{label}</Text>
    </TouchableOpacity>
  )
}

export function BlockUserModal({
  userId,
  userName,
  visible,
  onClose,
  isBlocked = false,
  currentPreference
}: BlockUserModalProps) {
  const [blockMessage, setBlockMessage] = useState(currentPreference?.message ?? true)
  const [blockCall, setBlockCall] = useState(currentPreference?.call ?? true)
  const [blockStory, setBlockStory] = useState(currentPreference?.story ?? true)

  const { isDark } = useTheme()
  const blockMutation = useBlockUser()
  const unblockMutation = useUnblockUser()
  const updatePrefMutation = useUpdateBlockPreference()

  useEffect(() => {
    if (visible) {
      setBlockMessage(currentPreference?.message ?? true)
      setBlockCall(currentPreference?.call ?? true)
      setBlockStory(currentPreference?.story ?? true)
    }
  }, [visible, currentPreference])

  const isPending =
    blockMutation.isPending || unblockMutation.isPending || updatePrefMutation.isPending

  const handleSubmit = () => {
    if (isBlocked) {
      updatePrefMutation.mutate(
        { blockedUserId: userId, body: { blockMessage, blockCall, blockStory } },
        { onSuccess: onClose }
      )
    } else {
      blockMutation.mutate(
        { blockedUserId: userId, blockMessage, blockCall, blockStory },
        { onSuccess: onClose }
      )
    }
  }

  const handleUnblock = () => {
    Alert.alert(
      'Bỏ chặn',
      `Bạn có chắc muốn bỏ chặn ${userName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Bỏ chặn',
          onPress: () => unblockMutation.mutate(userId, { onSuccess: onClose })
        }
      ]
    )
  }

  return (
    <Modal visible={visible} transparent animationType='slide' onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            backgroundColor: isDark ? '#1C1F24' : '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 24,
            paddingBottom: 36
          }}
        >
          {/* Handle bar */}
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: isDark ? '#3E444A' : '#E2E8F0' }} />
          </View>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Ionicons name='ban-outline' size={22} color='#DC2626' />
            <Text style={{ fontSize: 17, fontWeight: '600', color: isDark ? '#DFE2E7' : '#111827' }}>
              {isBlocked ? 'Cài đặt chặn' : 'Chặn người dùng'}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B', marginBottom: 20 }}>
            {isBlocked
              ? `Tùy chỉnh cách bạn chặn ${userName}`
              : `Chọn những gì bạn muốn chặn từ ${userName}`}
          </Text>

          {/* Options */}
          <CheckboxRow
            label='Chặn tin nhắn'
            iconName='chatbubble-outline'
            value={blockMessage}
            onChange={setBlockMessage}
            isDark={isDark}
          />
          <CheckboxRow
            label='Chặn cuộc gọi'
            iconName='call-outline'
            value={blockCall}
            onChange={setBlockCall}
            isDark={isDark}
          />
          <CheckboxRow
            label='Chặn nhật ký'
            iconName='camera-outline'
            value={blockStory}
            onChange={setBlockStory}
            isDark={isDark}
          />

          {/* Footer */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
            {isBlocked && (
              <TouchableOpacity
                onPress={handleUnblock}
                disabled={isPending}
                activeOpacity={0.7}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: isDark ? '#3E444A' : '#CBD5E1'
                }}
              >
                <Text style={{ fontSize: 14, color: isDark ? '#DFE2E7' : '#374151' }}>Bỏ chặn</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              disabled={isPending}
              activeOpacity={0.7}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 8,
                backgroundColor: isDark ? '#2C323A' : '#F1F5F9'
              }}
            >
              <Text style={{ fontSize: 14, color: isDark ? '#DFE2E7' : '#374151' }}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending}
              activeOpacity={0.7}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 8,
                backgroundColor: '#DC2626',
                opacity: isPending ? 0.6 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6
              }}
            >
              {isPending && <ActivityIndicator size='small' color='#fff' />}
              <Text style={{ fontSize: 14, color: '#fff', fontWeight: '600' }}>
                {isBlocked ? 'Cập nhật' : 'Chặn'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
