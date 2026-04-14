import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/text'
import { useTheme } from '@/context/theme-context'
import { UserAvatar } from '@/components/common/user-avatar'
import { useBlockDetails, useMyProfile, useUserById } from '@/features/users/queries/use-queries'
import { BlockUserModal } from '@/features/users/components/block-user-modal'
import { useUnfriend } from '@/features/friend/queries/use-mutations'
import { HEADER } from '@/constants/theme'

const DIVIDER_COLOR_LIGHT = '#F0F0F0'
const DIVIDER_COLOR_DARK = 'rgba(255,255,255,0.07)'

interface MenuItemRowProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  destructive?: boolean
  isDark: boolean
  showChevron?: boolean
  rightNode?: React.ReactNode
}

function MenuItemRow({ icon, label, onPress, destructive, isDark, showChevron = true, rightNode }: MenuItemRowProps) {
  const textColor = destructive ? '#DC2626' : isDark ? '#DFE2E7' : '#111827'
  const iconColor = destructive ? '#DC2626' : isDark ? '#B6C1CF' : '#374151'

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.55}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 22,
        backgroundColor: isDark ? '#1C1F24' : '#fff',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? DIVIDER_COLOR_DARK : DIVIDER_COLOR_LIGHT
      }}
    >
      <Ionicons name={icon} size={24} color={iconColor} style={{ marginRight: 16 }} />
      <Text style={{ flex: 1, fontSize: 17, color: textColor }}>{label}</Text>
      {rightNode ??
        (showChevron ? <Ionicons name='chevron-forward' size={18} color={isDark ? '#3E444A' : '#C7C7CC'} /> : null)}
    </TouchableOpacity>
  )
}

export default function MessageOptionsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id, name, isFriend: isFriendString } = useLocalSearchParams<{ id: string; name: string; isFriend: string }>()
  const { isDark } = useTheme()
  const [blockModalVisible, setBlockModalVisible] = useState(false)
  const [isBestFriend, setIsBestFriend] = useState(false)
  const [pinChat, setPinChat] = useState(false)
  const [muteNotification, setMuteNotification] = useState(false)
  const isFriend = isFriendString === 'true'
  const unfriend = useUnfriend()

  const { data: myProfile } = useMyProfile()
  const { data: userProfile } = useUserById(id as string)
  const isOwner = myProfile?.id === id
  const { data: blockDetails } = useBlockDetails(id as string, !!id)

  const quickActions = useMemo(
    () => [
      { key: 'search', icon: 'search-outline' as const, label: t('profile.chatOptions.searchMessages') },
      { key: 'profile', icon: 'person-outline' as const, label: t('profile.chatOptions.profile') },
      { key: 'wallpaper', icon: 'brush-outline' as const, label: t('profile.chatOptions.changeWallpaper') },
      { key: 'mute', icon: 'notifications-outline' as const, label: t('profile.chatOptions.muteNotification') }
    ],
    [t]
  )

  const handleUnfriend = () => {
    Alert.alert(t('profile.menu.unfriendConfirm.title'), t('profile.menu.unfriendConfirm.message', { name }), [
      {
        text: t('profile.menu.unfriendConfirm.cancel'),
        style: 'cancel'
      },
      {
        text: t('profile.menu.unfriendConfirm.confirm'),
        onPress: () => {
          if (!id) return
          unfriend.mutate(id, {
            onSuccess: () => {
              router.push('/(tabs)')
            }
          })
        },
        style: 'destructive'
      }
    ])
  }

  const bg = isDark ? '#121416' : '#F3F4F6'
  const cardBg = isDark ? '#1C1F24' : '#fff'
  const headerGradient = isDark ? HEADER.gradientColorsDark : HEADER.gradientColors

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <LinearGradient colors={headerGradient}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: HEADER.paddingHorizontal,
              height: HEADER.height
            }}
          >
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ paddingRight: 10 }}>
              <Ionicons name='chevron-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={{ flex: 1, fontSize: 19, fontWeight: '600', color: '#fff' }} numberOfLines={1}>
              {t('profile.chatOptions.title')}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ backgroundColor: cardBg, paddingTop: 18, paddingBottom: 16, alignItems: 'center' }}>
          <View
            style={{
              borderRadius: 56,
              padding: 2,
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6
            }}
          >
            <UserAvatar
              source={userProfile?.avatar || null}
              name={(name as string) || userProfile?.fullName || ''}
              size='3xl'
            />
          </View>
          <Text style={{ marginTop: 14, fontSize: 22, fontWeight: '700', color: isDark ? '#F8FAFC' : '#111827' }}>
            {(name as string) || userProfile?.fullName || ''}
          </Text>

          <View style={{ flexDirection: 'row', marginTop: 18, paddingHorizontal: 10 }}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={{ width: '25%', alignItems: 'center' }}
                activeOpacity={0.7}
                onPress={() => {
                  if (action.key === 'mute') setMuteNotification((v) => !v)
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: isDark ? '#2A2F36' : '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8
                  }}
                >
                  <Ionicons name={action.icon} size={27} color={isDark ? '#D0D6DD' : '#111827'} />
                </View>
                <Text
                  style={{ fontSize: 14, textAlign: 'center', color: isDark ? '#D0D6DD' : '#1F2937', lineHeight: 18 }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 8, backgroundColor: cardBg }}>
          <MenuItemRow
            icon='create-outline'
            label={t('profile.menu.changeNickname')}
            onPress={() => {}}
            isDark={isDark}
          />
          <MenuItemRow
            icon='star-outline'
            label={t('profile.menu.markAsBestFriend')}
            onPress={() => {}}
            isDark={isDark}
            showChevron={false}
            rightNode={
              <Switch
                value={isBestFriend}
                onValueChange={setIsBestFriend}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor='#fff'
              />
            }
          />
          <MenuItemRow
            icon='time-outline'
            label={t('profile.chatOptions.sharedJournal')}
            onPress={() => {}}
            isDark={isDark}
          />
        </View>

        <View
          style={{ marginTop: 10, backgroundColor: cardBg, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}
          >
            <Ionicons
              name='images-outline'
              size={22}
              color={isDark ? '#D0D6DD' : '#6B7280'}
              style={{ marginRight: 14 }}
            />
            <Text style={{ flex: 1, fontSize: 18, color: isDark ? '#F1F5F9' : '#1F2937' }}>
              {t('profile.chatOptions.mediaFilesLinks')}
            </Text>
            <Ionicons name='chevron-forward' size={18} color={isDark ? '#3E444A' : '#C7C7CC'} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <View
                key={idx}
                style={{ flex: 1, aspectRatio: 1, borderRadius: 8, backgroundColor: isDark ? '#2A2F36' : '#ECEFF3' }}
              />
            ))}
          </View>
        </View>

        <View style={{ marginTop: 10, backgroundColor: cardBg }}>
          <MenuItemRow
            icon='people-outline'
            label={t('profile.chatOptions.createGroupWithUser', { name })}
            onPress={() => {}}
            isDark={isDark}
          />
          <MenuItemRow
            icon='person-add-outline'
            label={t('profile.chatOptions.addUserToGroup', { name })}
            onPress={() => {}}
            isDark={isDark}
          />
          <MenuItemRow
            icon='people-circle-outline'
            label={t('profile.chatOptions.viewCommonGroups')}
            onPress={() => {}}
            isDark={isDark}
          />
        </View>

        <View style={{ marginTop: 10, backgroundColor: cardBg }}>
          <MenuItemRow
            icon='pin-outline'
            label={t('profile.chatOptions.pinConversation')}
            onPress={() => setPinChat((v) => !v)}
            isDark={isDark}
            showChevron={false}
            rightNode={
              <Switch
                value={pinChat}
                onValueChange={setPinChat}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor='#fff'
              />
            }
          />
          {!isOwner && (
            <MenuItemRow
              icon='ban-outline'
              label={blockDetails ? t('settings.privacy.blockSettings') : t('settings.privacy.manageBlock')}
              onPress={() => setBlockModalVisible(true)}
              destructive
              isDark={isDark}
            />
          )}
          {isFriend && !isOwner && (
            <MenuItemRow
              icon='person-remove-outline'
              label={t('profile.menu.unfriend')}
              onPress={handleUnfriend}
              destructive
              isDark={isDark}
            />
          )}
        </View>
      </ScrollView>

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
