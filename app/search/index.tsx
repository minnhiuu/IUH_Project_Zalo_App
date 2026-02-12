import React, { useState, useRef, useEffect } from 'react'
import { View, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'

// Mock data for recent contacts
const RECENT_CONTACTS = [
  { id: '1', name: 'My Documents', avatar: 'https://i.pravatar.cc/150?img=1', isOfficial: true },
  { id: '2', name: 'Trần Ngọc Huyền', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: '3', name: 'Phạm Minh Châu', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '4', name: 'Gia đình là số 1', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: '5', name: 'T Thi', avatar: 'https://i.pravatar.cc/150?img=6' },
]

// Mock data for mini apps
const MINI_APPS = [
  { id: '1', name: 'Tất cả', icon: 'apps', color: '#0068FF' },
  { id: '2', name: 'CellphoneS CSKH', icon: 'headset', color: '#E53838' },
  { id: '3', name: 'Thiệp Tết AI', icon: 'gift', color: '#F59E0B' },
  { id: '4', name: 'Highlands Rewards', icon: 'cafe', color: '#059669' },
  { id: '5', name: 'Dịch vụ công', icon: 'business', color: '#0068FF' },
]

export default function SearchScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const inputRef = useRef<TextInput>(null)
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<'mine' | 'explore'>('mine')

  useEffect(() => {
    // Auto focus the search input
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#005AE0' }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#005AE0' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, height: 56 }}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ padding: 4 }}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Search Input */}
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 8,
                marginHorizontal: 8,
                paddingHorizontal: 10,
                height: 38,
              }}
            >
              <Ionicons name="search" size={18} color="rgba(255,255,255,0.7)" />
              <TextInput
                ref={inputRef}
                placeholder={t('search.placeholder')}
                placeholderTextColor="rgba(255,255,255,0.6)"
                style={{ flex: 1, color: '#fff', fontSize: 15, marginLeft: 8, padding: 0 }}
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')} activeOpacity={0.7} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity activeOpacity={0.7} style={{ padding: 4 }}>
              <Ionicons name="qr-code-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' }}>
        <TouchableOpacity
          onPress={() => setActiveTab('mine')}
          activeOpacity={0.7}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderBottomWidth: activeTab === 'mine' ? 2 : 0,
            borderBottomColor: '#0068FF',
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: activeTab === 'mine' ? '600' : '400',
              color: activeTab === 'mine' ? '#0068FF' : '#6b7280',
            }}
          >
            {t('search.tabs.mine')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('explore')}
          activeOpacity={0.7}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderBottomWidth: activeTab === 'explore' ? 2 : 0,
            borderBottomColor: '#0068FF',
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: activeTab === 'explore' ? '600' : '400',
              color: activeTab === 'explore' ? '#0068FF' : '#6b7280',
            }}
          >
            {t('search.tabs.explore')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        {activeTab === 'mine' && (
          <>
            {/* Mini App section */}
            <View style={{ paddingTop: 16 }}>
              <View style={{ flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
                  {t('search.miniAppsUsed')}
                </Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={{ fontSize: 14, color: '#6b7280' }}>
                    {t('search.edit')}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12 }}
              >
                {MINI_APPS.map((app) => (
                  <TouchableOpacity
                    key={app.id}
                    activeOpacity={0.7}
                    style={{ alignItems: 'center', marginHorizontal: 8, width: 70 }}
                  >
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        backgroundColor: app.color + '15',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <Ionicons name={app.icon as any} size={28} color={app.color} />
                    </View>
                    <Text
                      style={{ fontSize: 12, color: '#374151', textAlign: 'center' }}
                      numberOfLines={2}
                    >
                      {app.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Divider */}
            <View style={{ height: 8, backgroundColor: '#F3F4F6', marginTop: 16 }} />

            {/* Recent contacts */}
            <View style={{ paddingTop: 16 }}>
              <View style={{ flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
                  {t('search.recentContacts')}
                </Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={{ fontSize: 14, color: '#6b7280' }}>
                    {t('search.edit')}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12 }}
              >
                {RECENT_CONTACTS.map((contact) => (
                  <TouchableOpacity
                    key={contact.id}
                    activeOpacity={0.7}
                    style={{ alignItems: 'center', marginHorizontal: 8, width: 70 }}
                  >
                    <Image
                      source={{ uri: contact.avatar }}
                      style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#E5E7EB', marginBottom: 6 }}
                    />
                    <Text
                      style={{ fontSize: 12, color: '#374151', textAlign: 'center' }}
                      numberOfLines={2}
                    >
                      {contact.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Manage search history */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 20,
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 14, color: '#0068FF' }}>
                {t('search.manageHistory')}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#0068FF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'explore' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Ionicons name="compass-outline" size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 12 }}>
              {t('search.exploreContent')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}
