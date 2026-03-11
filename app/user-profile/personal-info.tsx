import React from 'react'
import { View, TouchableOpacity, ScrollView, ImageBackground, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { useTheme } from '@/context/theme-context'
import { useUserById, useMyProfile } from '@/features/users/queries/use-queries'
import { formatDate, formatPhoneNumber } from '@/utils'
import { Gender } from '@/constants/enum'

export default function PersonalInfoScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { isDark } = useTheme()

  const { data: myProfile } = useMyProfile()
  const { data: userProfile } = useUserById(id as string)

  //TODO: retrieve owner's information from cache or context to avoid loading state on own profile
  const isOwner = myProfile?.id === id

  if (!userProfile) {
    return null
  } else {
    console.log();
    console.log('User profile loaded:', userProfile)

  }
  const getGenderLabel = (gender: Gender | null | undefined) => {
    if (!gender) return '---'
    switch (gender) {
      case Gender.Male:
        return t('profile.personalInfo.male')
      case Gender.Female:
        return t('profile.personalInfo.female')
      default:
        return t('profile.personalInfo.other')
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121416' : '#F3F4F6' }}>
      {/* Header with cover image and avatar */}
      <ImageBackground
        source={{ uri: userProfile.background || 'https://via.placeholder.com/375x200' }}
        style={{ height: 200 }}
        resizeMode='cover'
      >
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: 50,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.3)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name='arrow-back' size={24} color='#fff' />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Avatar and name at bottom */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingBottom: 16
          }}
        >
          <Image
            source={{ uri: userProfile.avatar || 'https://via.placeholder.com/80' }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 3,
              borderColor: '#fff'
            }}
          />
          <Text
            style={{
              marginLeft: 16,
              fontSize: 20,
              fontWeight: '600',
              color: '#fff',
              textShadowColor: 'rgba(0, 0, 0, 0.75)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3
            }}
          >
            {userProfile.fullName}
          </Text>
        </View>
      </ImageBackground>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ backgroundColor: isDark ? '#22262B' : '#fff', marginTop: 8 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#0068FF',
              paddingHorizontal: 16,
              paddingVertical: 12
            }}
          >
            {t('profile.personalInfo.title')}
          </Text>

          {/* Gender */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? '#2C323A' : '#F3F4F6'
            }}
          >
            <Text style={{ width: 100, fontSize: 15, color: isDark ? '#B6C1CF' : '#6B7280' }}>
              {t('profile.personalInfo.gender')}
            </Text>
            <Text style={{ flex: 1, fontSize: 15, color: isDark ? '#DFE2E7' : '#111827' }}>
              {getGenderLabel(userProfile.gender)}
            </Text>
          </View>

          {/* Date of Birth */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? '#2C323A' : '#F3F4F6'
            }}
          >
            <Text style={{ width: 100, fontSize: 15, color: isDark ? '#B6C1CF' : '#6B7280' }}>
              {t('profile.personalInfo.dob')}
            </Text>
            <Text style={{ flex: 1, fontSize: 15, color: isDark ? '#DFE2E7' : '#111827' }}>
              {userProfile.dob ? formatDate(userProfile.dob) : '---'}
            </Text>
          </View>

          {/* Phone Number */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              paddingVertical: 16
            }}
          >
            <Text style={{ width: 100, fontSize: 15, color: isDark ? '#B6C1CF' : '#6B7280' }}>
              {t('profile.personalInfo.phone')}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: isDark ? '#DFE2E7' : '#111827', marginBottom: 4 }}>
                {userProfile.accountInfo?.phoneNumber
                  ? formatPhoneNumber(userProfile.accountInfo.phoneNumber)
                  : '---'}
              </Text>
              {userProfile.accountInfo?.phoneNumber && (
                <Text style={{ fontSize: 13, color: isDark ? '#6B7280' : '#9CA3AF' }}>
                  {isOwner ? t('profile.personalInfo.phoneNote') : t('profile.personalInfo.phoneNoteOther')}
                </Text>
              )}
            </View>
          </View>

          {/* Edit Button - Only for owner */}
          {isOwner && (
            <TouchableOpacity
              onPress={() => router.push('/user-profile/edit-profile' as any)}
              style={{
                marginHorizontal: 16,
                marginTop: 16,
                marginBottom: 20,
                paddingVertical: 12,
                borderRadius: 50,
                backgroundColor: isDark ? '#2C323A' : '#F3F4F6',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Ionicons
                name='pencil-outline'
                size={18}
                color={isDark ? '#DFE2E7' : '#111827'}
              />
              <Text style={{ fontSize: 15, fontWeight: '500', color: isDark ? '#DFE2E7' : '#111827' }}>
                {t('profile.personalInfo.edit')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
