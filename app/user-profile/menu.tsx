import React from 'react'
import { View, TouchableOpacity, ScrollView, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { useTheme } from '@/context/theme-context'
import { useUnfriend } from '@/features/friend/queries/use-mutations'
import { useMyProfile, useUserById } from '@/features/users/queries/use-queries'

export default function UserProfileMenuScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id, isFriend: isFriendString } = useLocalSearchParams<{ id: string; isFriend: string }>()
  const { isDark } = useTheme()
  const isFriend = isFriendString === 'true'

  const { data: myProfile } = useMyProfile()
  const { data: userProfile } = useUserById(id as string)
  const unfriend = useUnfriend()

  const handleUnfriend = () => {
    if (!id) return
    unfriend.mutate(id, {
      onSuccess: () => {
        router.push('/(tabs)')
      }
    })
  }

  const [notificationEnabled, setNotificationEnabled] = React.useState(false)
  const [blockActivity, setBlockActivity] = React.useState(false)
  const [hideActivity, setHideActivity] = React.useState(false)

  interface MenuItem {
    label: string
    onPress?: () => void
    showSwitch?: boolean
    switchValue?: boolean
    onSwitchChange?: (value: boolean) => void
    isDanger?: boolean
  }

  interface MenuSection {
    title: string
    items: MenuItem[]
  }

  const menuSections: MenuSection[] = [
    {
      title: t('profile.menu.information'),
      items: [
        {
          label: t('profile.menu.personalInfo'),
          onPress: () => router.push(`/user-profile/personal-info?id=${id}` as any)
        },
        {
          label: t('profile.menu.changeNickname'),
          onPress: () => console.log('Change nickname')
        },
        ...(isFriend
          ? [
              {
                label: t('profile.menu.markAsBestFriend'),
                showSwitch: true,
                switchValue: false,
                onSwitchChange: (value: boolean) => console.log('Mark as best friend', value)
              },
              {
                label: t('profile.menu.introduceToFriends'),
                onPress: () => console.log('Introduce to friends')
              }
            ]
          : [])
      ]
    },
    {
      title: t('profile.menu.notificationSection'),
      items: [
        {
          label: t('profile.menu.notifications'),
          showSwitch: true,
          switchValue: notificationEnabled,
          onSwitchChange: setNotificationEnabled
        }
      ]
    },
    {
      title: t('profile.menu.blockAndHideSection'),
      items: [
        {
          label: t('profile.menu.blockMyActivity'),
          showSwitch: true,
          switchValue: blockActivity,
          onSwitchChange: setBlockActivity
        },
        {
          label: t('profile.menu.hideTheirActivity'),
          showSwitch: true,
          switchValue: hideActivity,
          onSwitchChange: setHideActivity
        }
      ]
    }
  ]

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121416' : '#F3F4F6' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: isDark ? '#22262B' : '#fff' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#2C323A' : '#E5E7EB'
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name='arrow-back' size={24} color={isDark ? '#DFE2E7' : '#111827'} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#DFE2E7' : '#111827' }}>
            {userProfile?.fullName}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }}>
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={{ backgroundColor: isDark ? '#22262B' : '#fff', marginTop: 8 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#0068FF',
                paddingHorizontal: 16,
                paddingVertical: 10
              }}
            >
              {section.title}
            </Text>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                onPress={item.onPress}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                  borderBottomColor: isDark ? '#2C323A' : '#F3F4F6'
                }}
                disabled={item.showSwitch}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: item.isDanger ? '#EF4444' : isDark ? '#DFE2E7' : '#111827'
                  }}
                >
                  {item.label}
                </Text>
                {item.showSwitch ? (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onSwitchChange}
                    trackColor={{ false: isDark ? '#3E444A' : '#D1D5DB', true: '#0068FF' }}
                    thumbColor='#fff'
                  />
                ) : (
                  <Ionicons name='chevron-forward' size={20} color={isDark ? '#6B7280' : '#9CA3AF'} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {isFriend && (
          <View style={{ backgroundColor: isDark ? '#22262B' : '#fff', marginTop: 8 }}>
            <TouchableOpacity
              onPress={() => console.log('Unfriend')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 10
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: '#EF4444'
                }}
              >
                {t('profile.menu.unfriend')}
              </Text>
              <Ionicons name='chevron-forward' size={20} color='#EF4444' />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
