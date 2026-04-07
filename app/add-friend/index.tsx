import React, { useState, useCallback } from 'react'
import { View, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Text, Header } from '@/components/ui'
import { useAuthStore } from '@/store'
import { useSearchUsers } from '@/features/users/queries/use-queries'
import { useDebounce } from '@/hooks/useDebounce'
import { useTheme } from '@/context/theme-context'
import { SearchResultItem } from '@/features/friend/components/search-result-item'

export default function AddFriendScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { colors, isDark } = useTheme()
  const [phoneNumber, setPhoneNumber] = useState('')

  const debouncedPhone = useDebounce(phoneNumber, 500)
  const shouldSearch = debouncedPhone.length >= 2
  const { data: searchResults, isLoading: searching } = useSearchUsers(debouncedPhone, shouldSearch)

  const handleSearch = useCallback(() => {
    if (!phoneNumber.trim()) return
    // Search is automatic via debounce, but if user presses arrow we can force
  }, [phoneNumber])

  const handleUserPress = useCallback(
    (userId: string) => {
      router.push(`/user-profile/${userId}` as any)
    },
    [router]
  )

  const qrCardBg = isDark ? '#1E2530' : '#4A6B8A'
  const qrInnerBg = isDark ? '#101722' : '#1A1F2E'
  const qrHintColor = isDark ? 'rgba(237,239,243,0.82)' : 'rgba(255,255,255,0.8)'

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <Header
        title={t('friend.addFriend.title')}
        showBackButton
        onBackPress={() => router.back()}
        showSearch={false}
      />

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
        {/* QR Card */}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View
            style={{
              width: 280,
              backgroundColor: qrCardBg,
              borderRadius: 16,
              paddingVertical: 24,
              paddingHorizontal: 20,
              alignItems: 'center'
            }}
          >
            {/* User name */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 }}>
              {user?.fullName || 'User'}
            </Text>

            {/* Fake QR placeholder */}
            <View
              style={{
                width: 180,
                height: 180,
                backgroundColor: qrInnerBg,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name='qr-code' size={140} color='#FFFFFF' />
            </View>

            {/* Hint text */}
            <Text
              style={{
                fontSize: 13,
                color: qrHintColor,
                textAlign: 'center',
                marginTop: 16,
                lineHeight: 18
              }}
            >
              {t('friend.addFriend.qrHint')}
            </Text>
          </View>
        </View>

        {/* Phone Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 16,
            marginVertical: 16,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            backgroundColor: colors.background,
            paddingHorizontal: 12
          }}
        >
          {/* Country Code */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 10,
              borderRightWidth: 1,
              borderRightColor: colors.border,
              marginRight: 8
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>+84</Text>
            <Ionicons name='chevron-down' size={16} color={colors.textSecondary} style={{ marginLeft: 4 }} />
          </View>

          {/* Phone Input */}
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder={t('friend.addFriend.phoneInput')}
            placeholderTextColor={colors.textSecondary}
            keyboardType='phone-pad'
            style={{
              flex: 1,
              fontSize: 16,
              color: colors.text,
              paddingVertical: 12
            }}
          />

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearch}
            disabled={!phoneNumber.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: phoneNumber.trim() ? colors.tint : colors.backgroundSecondary,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8
            }}
          >
            <Ionicons name='arrow-forward' size={20} color={phoneNumber.trim() ? '#fff' : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {shouldSearch && (
          <View style={{ marginTop: 8 }}>
            {searching ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size='small' color={colors.tint} />
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 8 }}>{t('friend.addFriend.searching')}</Text>
              </View>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((result) => (
                <SearchResultItem
                  key={result.id}
                  user={result}
                  onPress={handleUserPress}
                />
              ))
            ) : debouncedPhone.length >= 2 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>{t('friend.addFriend.noResult')}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Scan QR Option */}
        {!shouldSearch && (
          <>
            <TouchableOpacity
              onPress={() => router.push('/qr')}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border,
                backgroundColor: colors.background
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14
                }}
              >
                <Ionicons name='scan-outline' size={28} color={colors.tint} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>{t('friend.addFriend.scanQR')}</Text>
            </TouchableOpacity>

            {/* People You May Know */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border,
                backgroundColor: colors.background
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14
                }}
              >
                <Ionicons name='people-outline' size={28} color={colors.tint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
                  {t('friend.addFriend.mayKnow')}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  {t('friend.addFriend.mayKnowHint')}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  )
}
