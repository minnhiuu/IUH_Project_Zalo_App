import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
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
          borderColor: value ? SEMANTIC.primary : isDark ? '#475569' : '#CBD5E1',
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
  const { t } = useTranslation()
  const [blockMessage, setBlockMessage] = useState(isBlocked ? (currentPreference?.message ?? false) : false)
  const [blockCall, setBlockCall] = useState(isBlocked ? (currentPreference?.call ?? false) : false)
  const [blockStory, setBlockStory] = useState(isBlocked ? (currentPreference?.story ?? false) : false)

  const { isDark } = useTheme()
  const blockMutation = useBlockUser()
  const unblockMutation = useUnblockUser()
  const updatePrefMutation = useUpdateBlockPreference()

  // Sync state with props when modal opens or when status changes
  const [prevVisible, setPrevVisible] = useState(visible)
  const [prevIsBlocked, setPrevIsBlocked] = useState(isBlocked)

  if (visible !== prevVisible || (visible && isBlocked !== prevIsBlocked)) {
    setPrevVisible(visible)
    setPrevIsBlocked(isBlocked)
    if (visible) {
      setBlockMessage(isBlocked ? (currentPreference?.message ?? false) : false)
      setBlockCall(isBlocked ? (currentPreference?.call ?? false) : false)
      setBlockStory(isBlocked ? (currentPreference?.story ?? false) : false)
    }
  }

  const handleUnblock = () => {
    Alert.alert(t('settings.privacy.unblock'), t('settings.privacy.unblockConfirm', { name: userName }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.privacy.unblock'),
        onPress: () => {
          setBlockMessage(false)
          setBlockCall(false)
          setBlockStory(false)

          unblockMutation.mutate(userId, {
            onSuccess: () => {
              onClose()
            }
          })
        }
      }
    ])
  }

  const handleSubmit = () => {
    const preference = { blockMessage, blockCall, blockStory }
    if (isBlocked) {
      updatePrefMutation.mutate(
        { blockedUserId: userId, body: preference },
        {
          onSuccess: () => {
            onClose()
          }
        }
      )
    } else {
      blockMutation.mutate(
        { blockedUserId: userId, ...preference },
        {
          onSuccess: () => {
            onClose()
          }
        }
      )
    }
  }

  const isPending = blockMutation.isPending || unblockMutation.isPending || updatePrefMutation.isPending

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
              {isBlocked ? t('settings.privacy.blockSettings') : t('settings.privacy.blockUser')}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B', marginBottom: 20 }}>
            {isBlocked
              ? t('settings.privacy.blockCustomDescription', { name: userName })
              : t('settings.privacy.blockDescriptionHeadline', { name: userName })}
          </Text>

          {/* Options */}
          <CheckboxRow
            label={t('settings.privacy.blockMessage')}
            iconName='chatbubble-outline'
            value={blockMessage}
            onChange={setBlockMessage}
            isDark={isDark}
          />
          <CheckboxRow
            label={t('settings.privacy.blockCall')}
            iconName='call-outline'
            value={blockCall}
            onChange={setBlockCall}
            isDark={isDark}
          />
          <CheckboxRow
            label={t('settings.privacy.blockStory')}
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
                <Text style={{ fontSize: 14, color: isDark ? '#DFE2E7' : '#374151' }}>
                  {t('settings.privacy.unblock')}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onClose}
              disabled={isPending}
              activeOpacity={0.7}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 18,
                backgroundColor: isDark ? '#2C323A' : '#F1F5F9'
              }}
            >
              <Text style={{ fontSize: 14, color: isDark ? '#DFE2E7' : '#374151' }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending}
              activeOpacity={0.7}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 18,
                backgroundColor: '#DC2626',
                opacity: isPending ? 0.6 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6
              }}
            >
              {isPending && <ActivityIndicator size='small' color='#fff' />}
              <Text style={{ fontSize: 14, color: '#fff', fontWeight: '600' }}>
                {isBlocked ? t('common.save') : t('settings.privacy.blockUser')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
