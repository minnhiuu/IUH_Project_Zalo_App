import React, { useState, useCallback } from 'react'
import { View, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { useAuthStore } from '@/store'
import { useSearchUsers } from '@/features/users/queries/use-queries'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchResultItem } from '@/features/friend/components/search-result-item'

export default function AddFriendScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
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

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0068FF' }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#0068FF' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              height: 52
            }}
          >
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name='chevron-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff', flex: 1 }}>
              {t('friend.addFriend.title')}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
        {/* QR Card */}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View
            style={{
              width: 280,
              backgroundColor: '#4A6B8A',
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
                backgroundColor: '#fff',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name='qr-code' size={140} color='#333' />
            </View>

            {/* Hint text */}
            <Text
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.8)',
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
            borderBottomWidth: 0.5,
            borderBottomColor: '#E5E7EB',
            paddingVertical: 8
          }}
        >
          {/* Country Code */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRightWidth: 0.5,
              borderRightColor: '#E5E7EB',
              marginRight: 12
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>+84</Text>
            <Ionicons name='chevron-down' size={16} color='#6b7280' style={{ marginLeft: 4 }} />
          </View>

          {/* Phone Input */}
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder={t('friend.addFriend.phoneInput')}
            placeholderTextColor='#9ca3af'
            keyboardType='phone-pad'
            style={{
              flex: 1,
              fontSize: 16,
              color: '#111827',
              paddingVertical: 10
            }}
          />

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearch}
            disabled={!phoneNumber.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: phoneNumber.trim() ? '#0068FF' : '#E5E7EB',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name='arrow-forward' size={20} color={phoneNumber.trim() ? '#fff' : '#9ca3af'} />
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {shouldSearch && (
          <View style={{ marginTop: 8 }}>
            {searching ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator size='small' color='#0068FF' />
                <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 8 }}>{t('friend.addFriend.searching')}</Text>
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
                <Text style={{ fontSize: 14, color: '#9ca3af' }}>{t('friend.addFriend.noResult')}</Text>
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
                borderBottomColor: '#f0f0f0'
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
                <Ionicons name='scan-outline' size={28} color='#0068FF' />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>{t('friend.addFriend.scanQR')}</Text>
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
                borderBottomColor: '#f0f0f0'
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
                <Ionicons name='people-outline' size={28} color='#0068FF' />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>
                  {t('friend.addFriend.mayKnow')}
                </Text>
                <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
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
