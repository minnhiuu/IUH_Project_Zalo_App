import React from 'react'
import { TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { SEMANTIC, BRAND } from '@/constants/theme'
import type { FriendStatus } from '../schemas'

type ButtonVariant = 'addFriend' | 'unfriend' | 'cancelRequest' | 'message' | 'accept' | 'decline'

interface FriendActionButtonProps {
  variant: ButtonVariant
  onPress: () => void
  isLoading?: boolean
  disabled?: boolean
  compact?: boolean
}

const BUTTON_CONFIGS: Record<
  ButtonVariant,
  {
    bgColor: string
    textColor: string
    icon: keyof typeof Ionicons.glyphMap
    labelKey: string
  }
> = {
  addFriend: {
    bgColor: BRAND.blueLight,
    textColor: SEMANTIC.primary,
    icon: 'person-add-outline',
    labelKey: 'friend.actions.addFriend',
  },
  unfriend: {
    bgColor: '#FEE2E2',
    textColor: '#DC2626',
    icon: 'person-remove-outline',
    labelKey: 'friend.actions.unfriend',
  },
  cancelRequest: {
    bgColor: SEMANTIC.secondary,
    textColor: SEMANTIC.secondaryForeground,
    icon: 'close-circle-outline',
    labelKey: 'friend.actions.cancelRequest',
  },
  message: {
    bgColor: BRAND.blueLight,
    textColor: SEMANTIC.primary,
    icon: 'chatbubble-outline',
    labelKey: 'friend.actions.message',
  },
  accept: {
    bgColor: BRAND.blueLight,
    textColor: SEMANTIC.primary,
    icon: 'checkmark-circle-outline',
    labelKey: 'friend.actions.accept',
  },
  decline: {
    bgColor: SEMANTIC.secondary,
    textColor: SEMANTIC.secondaryForeground,
    icon: 'close-outline',
    labelKey: 'friend.actions.decline',
  },
}

export function FriendActionButton({
  variant,
  onPress,
  isLoading = false,
  disabled = false,
  compact = false,
}: FriendActionButtonProps) {
  const { t } = useTranslation()
  const config = BUTTON_CONFIGS[variant]

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: config.bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={config.textColor} />
        ) : (
          <Ionicons name={config.icon} size={20} color={config.textColor} />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: config.bgColor,
        opacity: disabled ? 0.5 : 1,
        gap: 6,
      }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={config.textColor} />
      ) : (
        <>
          <Ionicons name={config.icon} size={18} color={config.textColor} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: config.textColor }}>
            {t(config.labelKey)}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}

export function getFriendButtonVariant(
  status: FriendStatus | null,
  isRequester: boolean
): ButtonVariant | null {
  if (!status) return 'addFriend'

  switch (status) {
    case 'PENDING':
      return isRequester ? 'cancelRequest' : 'accept'
    case 'ACCEPTED':
      return 'message'
    case 'DECLINED':
    case 'CANCELLED':
      return 'addFriend'
    default:
      return 'addFriend'
  }
}
