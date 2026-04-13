import React, { useEffect, useState } from 'react'
import { View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/text'
import { Header } from '@/components/ui'
import { useTheme } from '@/context/theme-context'
import { useContactSuggestions, useContactSync } from '@/features/friend/queries'
import { ContactSuggestionItem } from '@/features/friend/components'
import type { FriendSuggestionResponse } from '@/features/friend/schemas'
import { BRAND } from '@/constants/theme'

export default function FindFriendsFromContactsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { colors } = useTheme()
  const { syncContacts, syncing, permissionDenied, lastSyncResult } = useContactSync()
  const { data: rawSuggestions = [], isLoading, refetch } = useContactSuggestions()
  const [refreshing, setRefreshing] = useState(false)

  // Deduplicate by userId to avoid React key conflicts
  const suggestions = rawSuggestions.filter(
    (s, i, arr) => arr.findIndex((x) => x.userId === s.userId) === i
  )

  // Auto-sync on mount (respects 24h interval)
  useEffect(() => {
    syncContacts().then((result) => {
      if (result) refetch()
    })
  }, [])

  const handleForceSync = async () => {
    const result = await syncContacts(true)
    if (result) refetch()
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await handleForceSync()
    await refetch()
    setRefreshing(false)
  }

  const handleUserPress = (userId: string, fullName: string, avatar: string) => {
    router.push({
      pathname: '/chat/[id]' as any,
      params: {
        id: userId,
        name: fullName,
        avatar: avatar || ''
      }
    })
  }

  const renderEmpty = () => {
    if (isLoading || syncing) return null

    if (permissionDenied) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.background,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Ionicons name='lock-closed-outline' size={36} color={colors.textSecondary} />
          </View>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600', textAlign: 'center' }}>
            {t('friend.contact.permissionTitle')}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
            {t('friend.contact.permissionDenied')}
          </Text>
          <TouchableOpacity
            onPress={handleForceSync}
            activeOpacity={0.7}
            style={{
              marginTop: 8,
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 24,
              backgroundColor: BRAND.blue
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
              {t('friend.contact.grantPermission')}
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Ionicons name='people-outline' size={36} color={colors.textSecondary} />
        </View>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '600', textAlign: 'center' }}>
          {t('friend.contact.emptyTitle')}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
          {t('friend.contact.noSuggestions')}
        </Text>
        <TouchableOpacity
          onPress={handleForceSync}
          activeOpacity={0.7}
          style={{
            marginTop: 8,
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 24,
            backgroundColor: BRAND.blue
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>{t('friend.contact.syncNow')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      {/* Shared Header with SafeArea */}
      <Header
        title={t('friend.contact.title')}
        showBackButton
      />

      {/* Sync status banner */}
      {syncing && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: BRAND.blueLight,
            gap: 8
          }}
        >
          <ActivityIndicator size='small' color={BRAND.blue} />
          <Text style={{ fontSize: 13, color: BRAND.blue, fontWeight: '500' }}>
            {t('friend.contact.syncing')}
          </Text>
        </View>
      )}

      {/* Sync result info bar */}
      {lastSyncResult && !syncing && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: colors.background,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name='checkmark-circle' size={16} color='#4CAF50' />
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              {t('friend.contact.syncResult', {
                matched: lastSyncResult.matchedUsers,
                total: lastSyncResult.totalContacts
              })}
            </Text>
          </View>
          <TouchableOpacity onPress={handleForceSync} activeOpacity={0.7} style={{ padding: 4 }}>
            <Ionicons name='refresh' size={18} color={BRAND.blue} />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {isLoading && !syncing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size='large' color={colors.tint} />
          <Text style={{ color: colors.textSecondary, marginTop: 12, fontSize: 14 }}>
            {t('friend.loading')}
          </Text>
        </View>
      ) : suggestions.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList<FriendSuggestionResponse>
          data={suggestions}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <ContactSuggestionItem
              suggestion={item}
              onPress={(userId) => handleUserPress(userId, item.fullName, item.avatar)}
            />
          )}
          ListHeaderComponent={
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: colors.backgroundSecondary
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
                {t('friend.contact.listHeader', { count: suggestions.length })}
              </Text>
              <TouchableOpacity onPress={handleForceSync} disabled={syncing} activeOpacity={0.7}>
                {syncing ? (
                  <ActivityIndicator size='small' color={BRAND.blue} />
                ) : (
                  <Ionicons name='refresh' size={18} color={BRAND.blue} />
                )}
              </TouchableOpacity>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={BRAND.blue} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  )
}
