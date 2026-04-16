import React, { useState, useCallback, useMemo, useRef } from 'react'
import { View, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Text, Header } from '@/components/ui'
import { useAuthStore } from '@/store'
import { useSearchUsers } from '@/features/users/queries/use-queries'
import { useMyProfile } from '@/features/users/queries/use-queries'
import { useDebounce } from '@/hooks/useDebounce'
import { useTheme } from '@/context/theme-context'
import { SearchResultItem } from '@/features/friend/components/search-result-item'
import { useUnifiedSuggestions } from '@/features/friend/queries'
import { ForwardMessageModal } from '@/features/message/components'
import { useConversations } from '@/features/message/queries'
import { useChatWebSocket } from '@/features/message/hooks'
import { MessageStatus, MessageType, type MessageResponse } from '@/features/message/schemas'
import { serializeBusinessCard } from '@/features/message/utils'
import { UserAvatar } from '@/components/common/user-avatar'
import QRCode from 'react-native-qrcode-svg'
import * as MediaLibrary from 'expo-media-library'
import { captureRef } from 'react-native-view-shot'

const QR_PREFIX = 'bondhub://user/'

export default function AddFriendScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { data: myProfile } = useMyProfile()
  const { colors, isDark } = useTheme()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [savingQr, setSavingQr] = useState(false)
  const [showForwardModal, setShowForwardModal] = useState(false)
  const qrCaptureRef = useRef<any>(null)
  const { data: conversations = [] } = useConversations(0, 100, true)
  const { sendMessage } = useChatWebSocket()

  const debouncedPhone = useDebounce(phoneNumber, 500)
  const shouldSearch = debouncedPhone.length >= 2
  const { data: searchResults, isLoading: searching } = useSearchUsers(debouncedPhone, shouldSearch)
  const { data: suggestionResults = [], isLoading: suggestionsLoading } = useUnifiedSuggestions(0, 15, !shouldSearch)

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

  const currentUserId = String(myProfile?.id ?? user?.id ?? '')
  const currentUserName = String(myProfile?.fullName ?? user?.fullName ?? '').trim()
  const currentUserPhone = String((myProfile as any)?.phoneNumber ?? (myProfile as any)?.phone ?? '')
  const qrValue = `${QR_PREFIX}${currentUserId}?name=${encodeURIComponent(currentUserName)}`
  const qrForwardContent = serializeBusinessCard({
    userId: currentUserId,
    name: currentUserName,
    phone: currentUserPhone,
    avatar: myProfile?.avatar ?? user?.avatar ?? null,
    qrValue
  })

  const forwardSourceMessage: MessageResponse | null = useMemo(() => {
    if (!currentUserId) return null
    return {
      id: `qr-${currentUserId}`,
      conversationId: null,
      senderId: currentUserId,
      senderName: user?.fullName ?? null,
      senderAvatar: user?.avatar ?? null,
      content: qrForwardContent,
      clientMessageId: null,
      type: MessageType.CHAT,
      createdAt: new Date().toISOString(),
      lastModifiedAt: null,
      replyTo: null,
      isForwarded: true,
      status: MessageStatus.NORMAL
    }
  }, [currentUserId, qrForwardContent, user?.avatar, user?.fullName])

  const handleShareQrToForward = useCallback(() => {
    if (!currentUserId) return
    setShowForwardModal(true)
  }, [currentUserId])

  const handleSubmitForward = useCallback(
    (conversationIds: string[], note: string) => {
      const notePayload = note.trim()
      conversationIds.forEach((conversationId) => {
        sendMessage(conversationId, qrForwardContent, null, true)
        if (notePayload) {
          sendMessage(conversationId, notePayload, null, false)
        }
      })
      setShowForwardModal(false)
    },
    [qrForwardContent, sendMessage]
  )

  const handleSaveQr = useCallback(async () => {
    if (!qrCaptureRef.current || !currentUserId) return
    setSavingQr(true)
    try {
      const permission = await MediaLibrary.requestPermissionsAsync()
      if (!permission.granted) {
        Alert.alert(t('common.error'), t('friend.addFriend.savePermissionDenied'))
        return
      }

      const imageUri = await captureRef(qrCaptureRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: 1080,
        height: 1500
      })
      await MediaLibrary.createAssetAsync(imageUri)
      Alert.alert(t('common.success'), t('friend.addFriend.saveSuccess'))
    } catch {
      Alert.alert(t('common.error'), t('friend.addFriend.saveFailed'))
    } finally {
      setSavingQr(false)
    }
  }, [currentUserId, t])

  const qrScreenBg = isDark ? '#233347' : '#4A678A'
  const qrHintColor = isDark ? '#6B7280' : '#6B7280'

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <Header title={t('friend.addFriend.title')} showBackButton onBackPress={() => router.back()} showSearch={false} />

      <ScrollView
        style={{ flex: 1, backgroundColor: qrScreenBg }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps='handled'
      >
        {/* QR Card */}
        <View style={{ alignItems: 'center', paddingTop: 34, paddingBottom: 12 }}>
          <View
            collapsable={false}
            style={{
              width: 312,
              backgroundColor: isDark ? '#F5F7FA' : '#FFFFFF',
              borderRadius: 20,
              paddingTop: 58,
              paddingBottom: 20,
              paddingHorizontal: 18,
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <View style={{ position: 'absolute', top: -22, alignItems: 'center' }}>
              <View
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: 33,
                  borderWidth: 3,
                  borderColor: '#fff',
                  overflow: 'hidden',
                  backgroundColor: '#fff'
                }}
              >
                <UserAvatar source={myProfile?.avatar ?? user?.avatar} name={currentUserName || 'User'} size='4xl' />
              </View>
            </View>

            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 }}>
              {currentUserName || 'User'}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12 }}>
              {t('friend.addFriend.qrCardSubtitle')}
            </Text>

            {/* Real QR code */}
            <View
              style={{
                width: 208,
                height: 208,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF'
              }}
            >
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 8,
                  borderRadius: 8,
                  position: 'relative'
                }}
              >
                <QRCode value={qrValue} size={190} color='#000000' backgroundColor='#FFFFFF' ecl='H' />

                <View
                  pointerEvents='none'
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: [{ translateX: -26 }, { translateY: -26 }],
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: '#000',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: '#fff'
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 8.2, fontWeight: '700' }}>BondHub</Text>
                </View>
              </View>
            </View>

            {/* Hint text */}
            <Text
              style={{
                fontSize: 13,
                color: qrHintColor,
                textAlign: 'center',
                marginTop: 12,
                lineHeight: 18
              }}
            >
              {t('friend.addFriend.qrHint')}
            </Text>

            <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={handleShareQrToForward}
                disabled={!currentUserId}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.06)',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  opacity: currentUserId ? 1 : 0.6
                }}
              >
                <Ionicons name='share-social-outline' size={16} color='#1F2937' style={{ marginRight: 6 }} />
                <Text style={{ color: '#111827', fontSize: 13, fontWeight: '600' }}>
                  {t('friend.addFriend.shareQr')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveQr}
                disabled={savingQr || !currentUserId}
                activeOpacity={0.8}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.06)',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  opacity: savingQr || !currentUserId ? 0.7 : 1
                }}
              >
                {savingQr ? (
                  <ActivityIndicator size='small' color='#1F2937' style={{ marginRight: 6 }} />
                ) : (
                  <Ionicons name='download-outline' size={16} color='#1F2937' style={{ marginRight: 6 }} />
                )}
                <Text style={{ color: '#111827', fontSize: 13, fontWeight: '600' }}>
                  {t('friend.addFriend.saveQr')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: colors.backgroundSecondary,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingTop: 4,
            paddingBottom: 16
          }}
        >
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
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 8 }}>
                    {t('friend.addFriend.searching')}
                  </Text>
                </View>
              ) : searchResults && searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <SearchResultItem key={result.id} user={result} onPress={handleUserPress} />
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
                onPress={() => router.push('/add-friend/scan' as any)}
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
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text }}>
                  {t('friend.addFriend.scanQR')}
                </Text>
              </TouchableOpacity>
                onPress={() => router.push('/friend-requests' as any)}
                activeOpacity={0.7}
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

              {suggestionsLoading ? (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <ActivityIndicator size='small' color={colors.tint} />
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 8 }}>{t('friend.loading')}</Text>
                </View>
              ) : suggestionResults.length > 0 ? (
                suggestionResults.map((suggestion) => (
                  <SearchResultItem
                    key={suggestion.userId}
                    user={{
                      id: suggestion.userId,
                      fullName: suggestion.fullName,
                      avatar: suggestion.avatar,
                      phoneNumber: suggestion.phoneNumber
                    }}
                    onPress={handleUserPress}
                  />
                ))
              ) : (
                <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>{t('friend.empty.friends')}</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <ForwardMessageModal
        visible={showForwardModal}
        sourceMessage={forwardSourceMessage}
        conversations={conversations}
        onClose={() => setShowForwardModal(false)}
        onSubmit={handleSubmitForward}
      />

      {/* Hidden capture-only card (no action buttons) */}
      <View
        ref={qrCaptureRef}
        collapsable={false}
        style={{
          position: 'absolute',
          left: -9999,
          top: -9999,
          width: 1080,
          height: 1440,
          backgroundColor: isDark ? '#233347' : '#4A678A',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 80
        }}
      >
        <View
          style={{
            width: 820,
            backgroundColor: '#FFFFFF',
            borderRadius: 40,
            paddingTop: 126,
            paddingBottom: 52,
            paddingHorizontal: 54,
            alignItems: 'center',
            position: 'relative'
          }}
        >
          <View style={{ position: 'absolute', top: -62, alignItems: 'center' }}>
            <View
              style={{
                width: 124,
                height: 124,
                borderRadius: 62,
                borderWidth: 4,
                borderColor: '#fff',
                overflow: 'hidden',
                backgroundColor: '#fff'
              }}
            >
              <UserAvatar source={myProfile?.avatar ?? user?.avatar} name={currentUserName || 'User'} size='4xl' />
            </View>
          </View>

          <Text style={{ fontSize: 52, fontWeight: '700', color: '#111827', marginBottom: 8 }}>
            {currentUserName || 'User'}
          </Text>
          <Text style={{ fontSize: 36, fontWeight: '600', color: '#6B7280', marginBottom: 26 }}>
            {t('friend.addFriend.qrCardSubtitle')}
          </Text>

          <View
            style={{
              width: 560,
              height: 560,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF'
            }}
          >
            <View
              style={{
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 12,
                position: 'relative'
              }}
            >
              <QRCode value={qrValue} size={520} color='#000000' backgroundColor='#FFFFFF' ecl='H' />

              <View
                pointerEvents='none'
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: [{ translateX: -68 }, { translateY: -68 }],
                  width: 136,
                  height: 136,
                  borderRadius: 68,
                  backgroundColor: '#000',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: '#fff'
                }}
              >
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>BondHub</Text>
              </View>
            </View>
          </View>

          <Text
            style={{
              fontSize: 34,
              color: '#6B7280',
              textAlign: 'center',
              marginTop: 34,
              lineHeight: 42
            }}
          >
            {t('friend.addFriend.qrHint')}
          </Text>
        </View>
      </View>
    </View>
  )
}
