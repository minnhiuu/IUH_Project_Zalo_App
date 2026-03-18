import React, { useState } from 'react'
import { View, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { useTheme } from '@/context/theme-context'
import { useBlockDetails } from '@/features/users/queries/use-queries'
import { BlockUserModal } from '@/features/users/components/block-user-modal'

const DIVIDER_COLOR_LIGHT = '#F0F0F0'
const DIVIDER_COLOR_DARK = 'rgba(255,255,255,0.07)'

interface MenuItemRowProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  destructive?: boolean
  isDark: boolean
}

function MenuItemRow({ icon, label, onPress, destructive, isDark }: MenuItemRowProps) {
  const textColor = destructive ? '#DC2626' : isDark ? '#DFE2E7' : '#111827'
  const iconColor = destructive ? '#DC2626' : isDark ? '#B6C1CF' : '#374151'

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.55}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        backgroundColor: isDark ? '#1C1F24' : '#fff',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? DIVIDER_COLOR_DARK : DIVIDER_COLOR_LIGHT
      }}
    >
      <Ionicons name={icon} size={22} color={iconColor} style={{ marginRight: 16 }} />
      <Text style={{ flex: 1, fontSize: 16, color: textColor }}>{label}</Text>
      <Ionicons name='chevron-forward' size={18} color={isDark ? '#3E444A' : '#C7C7CC'} />
    </TouchableOpacity>
  )
}

export default function UserProfileOptionsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>()
  const { isDark } = useTheme()
  const [blockModalVisible, setBlockModalVisible] = useState(false)

  const { data: blockDetails } = useBlockDetails(id as string, !!id)

  const bg = isDark ? '#121416' : '#F3F4F6'
  const headerBg = isDark ? '#1C1F24' : '#fff'
  const headerBorder = isDark ? DIVIDER_COLOR_DARK : DIVIDER_COLOR_LIGHT

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: headerBg }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 4,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: headerBorder
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{ padding: 12 }}
          >
            <Ionicons name='chevron-back' size={24} color={isDark ? '#DFE2E7' : '#111827'} />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: '600',
              color: isDark ? '#DFE2E7' : '#111827'
            }}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
      </SafeAreaView>

      {/* Menu Items */}
      <ScrollView style={{ flex: 1 }}>
        <View style={{ marginTop: 8 }}>
          <MenuItemRow
            icon='person-add-outline'
            label={t('contacts.addFriend')}
            onPress={() => {}}
            isDark={isDark}
          />
          <MenuItemRow
            icon='information-circle-outline'
            label={t('profile.menu.information')}
            onPress={() => {}}
            isDark={isDark}
          />
          <MenuItemRow
            icon='pencil-outline'
            label={t('profile.menu.changeNickname')}
            onPress={() => {}}
            isDark={isDark}
          />
          <MenuItemRow
            icon='flag-outline'
            label={t('profile.menu.report')}
            onPress={() => {}}
            isDark={isDark}
          />
          <MenuItemRow
            icon='ban-outline'
            label={blockDetails ? t('settings.privacy.blockSettings') : t('settings.privacy.manageBlock')}
            onPress={() => setBlockModalVisible(true)}
            destructive
            isDark={isDark}
          />
        </View>
      </ScrollView>

      {/* Block Modal */}
      <BlockUserModal
        key={`block-modal-${id}-${!!blockDetails}`}
        userId={id as string}
        userName={name as string}
        visible={blockModalVisible}
        onClose={() => setBlockModalVisible(false)}
        isBlocked={!!blockDetails}
        currentPreference={blockDetails?.preference}
      />
    </View>
  )
}
