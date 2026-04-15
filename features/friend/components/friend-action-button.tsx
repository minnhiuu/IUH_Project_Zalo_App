import React from 'react'
import { TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { BRAND } from '@/constants/theme'
import { useSemanticColors } from '@/context/theme-context'
import { FriendStatus } from '../schemas'

type ButtonVariant = 'addFriend' | 'unfriend' | 'cancelRequest' | 'message' | 'accept' | 'decline'

interface FriendActionButtonProps {
  variant: ButtonVariant
  onPress: () => void
  isLoading?: boolean
  disabled?: boolean
  compact?: boolean
}

const BUTTON_ICON_CONFIGS: Record<
  ButtonVariant,
  {
    icon: keyof typeof Ionicons.glyphMap
    labelKey: string
  }
> = {
  addFriend: {
    icon: 'person-add-outline',
    labelKey: 'friend.actions.addFriend'
  },
  unfriend: {
    icon: 'person-remove-outline',
    labelKey: 'friend.actions.unfriend'
  },
  cancelRequest: {
    icon: 'close-circle-outline',
    labelKey: 'friend.actions.cancelRequest'
  },
  message: {
    icon: 'chatbubble-outline',
    labelKey: 'friend.actions.message'
  },
  accept: {
    icon: 'checkmark-circle-outline',
    labelKey: 'friend.actions.accept'
  },
  decline: {
    icon: 'close-outline',
    labelKey: 'friend.actions.decline'
  }
}

export function FriendActionButton({
  variant,
  onPress,
  isLoading = false,
  disabled = false,
  compact = false
}: FriendActionButtonProps) {
  const { t } = useTranslation()
  const semanticColors = useSemanticColors()
  const config = BUTTON_ICON_CONFIGS[variant]

  // Determine colors based on variant and theme
  const getButtonColors = (): { bgColor: string; textColor: string } => {
    switch (variant) {
      case 'addFriend':
      case 'message':
      case 'accept':
        return { bgColor: BRAND.blueLight, textColor: BRAND.blue }
      case 'unfriend':
        return { bgColor: '#FEE2E2', textColor: '#DC2626' }
      case 'cancelRequest':
      case 'decline':
        return { bgColor: semanticColors.secondary, textColor: semanticColors.textPrimary }
      default:
        return { bgColor: BRAND.blueLight, textColor: BRAND.blue }
    }
  }

  const { bgColor, textColor } = getButtonColors()

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
          backgroundColor: bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1
        }}
      >
        {isLoading ? (
          <ActivityIndicator size='small' color={textColor} />
        ) : (
          <Ionicons name={config.icon} size={20} color={textColor} />
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
        backgroundColor: bgColor,
        opacity: disabled ? 0.5 : 1,
        gap: 6
      }}
    >
      {isLoading ? (
        <ActivityIndicator size='small' color={textColor} />
      ) : (
        <>
          <Ionicons name={config.icon} size={18} color={textColor} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }}>{t(config.labelKey)}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}

export function getFriendButtonVariant(status: FriendStatus | null, isRequester: boolean): ButtonVariant | null {
  if (!status) return 'addFriend'

  switch (status) {
    case FriendStatus.PENDING:
      return isRequester ? 'cancelRequest' : 'accept'
    case FriendStatus.ACCEPTED:
      return 'message'
    case FriendStatus.DECLINED:
    case FriendStatus.CANCELLED:
      return 'addFriend'
    default:
      return 'addFriend'
  }
}
