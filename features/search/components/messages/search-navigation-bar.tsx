import React from 'react'
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface SearchNavigationBarProps {
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  onSenderPress?: () => void
  isSenderActive?: boolean
  isLoading?: boolean
  isDark?: boolean
}

export function SearchNavigationBar({
  index,
  total,
  onPrev,
  onNext,
  onSenderPress,
  isSenderActive = false,
  isLoading = false,
  isDark = false
}: SearchNavigationBarProps) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const displayIndex = total > 0 ? index : 0
  const displayTotal = total > 0 ? total : 0
  const textColor = isDark ? '#A6ADB7' : '#8A8F94'

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)',
        borderTopWidth: 0.5,
        borderTopColor: isDark ? '#374151' : '#E0E0E0',
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        height: (insets.bottom > 0 ? insets.bottom : 12) + 48,
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16
      }}
    >
      <View style={{ width: 80, flexDirection: 'row', alignItems: 'center' }}>
        {onSenderPress ? (
          <TouchableOpacity onPress={onSenderPress} style={{ padding: 8 }}>
            <Ionicons name='person-outline' size={24} color={isSenderActive ? '#0068FF' : textColor} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
        <Text style={{ fontSize: 15, fontWeight: '400', color: textColor }}>
          {t('search.resultOrdinal', { index: displayIndex, total: displayTotal })}
        </Text>
        {isLoading && <ActivityIndicator size='small' color='#8A8F94' style={{ marginLeft: 8 }} />}
      </View>

      <View style={{ width: 80, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={onPrev}
          disabled={isLoading || displayTotal === 0}
          style={{ padding: 8, opacity: isLoading || displayTotal === 0 ? 0.3 : 1 }}
        >
          <Ionicons name='chevron-up' size={24} color={textColor} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          disabled={isLoading || displayTotal === 0}
          style={{ padding: 8, marginLeft: 4, opacity: isLoading || displayTotal === 0 ? 0.3 : 1 }}
        >
          <Ionicons name='chevron-down' size={24} color={textColor} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
