import { Ionicons } from '@expo/vector-icons'
import { View, SectionList, TouchableOpacity, Image } from 'react-native'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Header } from '@/components/ui'
import { Text } from '@/components/ui/text'

interface Contact {
  id: string
  name: string
  avatar: string
}

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Ba', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Bảo Photocopy - Printing', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Boconganh', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: '4', name: 'Bong', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: '5', name: 'Bùi Thu Thảo', avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: '6', name: 'Châu Minh', avatar: 'https://i.pravatar.cc/150?img=6' },
  { id: '7', name: 'Duy Hoàng', avatar: 'https://i.pravatar.cc/150?img=7' },
  { id: '8', name: 'Đào Linh', avatar: 'https://i.pravatar.cc/150?img=8' },
  { id: '9', name: 'Hùng Nguyễn', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: '10', name: 'Kiên Trần', avatar: 'https://i.pravatar.cc/150?img=10' },
]

function groupByLetter(contacts: Contact[]): { title: string; data: Contact[] }[] {
  const groups: Record<string, Contact[]> = {}
  contacts.forEach((c) => {
    const letter = c.name.charAt(0).toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(c)
  })
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({ title, data }))
}

const ALPHABET = ['A','B','C','Đ','G','H','K','L','M','N','O','P','Q','R','S','T','V','X','Y','Z']

export default function ContactsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'oa'>('friends')
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'recent'>('all')

  const sections = useMemo(() => groupByLetter(MOCK_CONTACTS), [])

  const tabs = [
    { key: 'friends' as const, label: t('contacts.tabs.friends') },
    { key: 'groups' as const, label: t('contacts.tabs.groups') },
    { key: 'oa' as const, label: 'OA' },
  ]

  const filters = [
    { key: 'all' as const, label: t('contacts.filters.all'), count: 135 },
    { key: 'new' as const, label: t('contacts.filters.new'), count: 1 },
    { key: 'recent' as const, label: t('contacts.filters.recent'), count: 8 },
  ]

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <Header
        showSearch
        searchPlaceholder={t('contacts.search')}
        showAddButton
        onAddPress={() => {}}
      />

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' }}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: activeTab === tab.key ? 2 : 0,
              borderBottomColor: '#0068FF',
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: activeTab === tab.key ? '600' : '400',
                color: activeTab === tab.key ? '#0068FF' : '#6b7280',
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View>
        <TouchableOpacity
          onPress={() => router.push('/friend-requests')}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 0.5,
            borderBottomColor: '#f0f0f0',
          }}
        >
          <View style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: '#E8F3FF',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="person-add" size={22} color="#0068FF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>
              {t('contacts.friendRequest')}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: '#6b7280' }}>(10)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 6,
            borderBottomColor: '#F3F4F6',
          }}
        >
          <View style={{
            width: 48, height: 48, borderRadius: 24,
            backgroundColor: '#FFF7E6',
            alignItems: 'center', justifyContent: 'center',
            marginRight: 12,
          }}>
            <Ionicons name="gift" size={22} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>
              {t('contacts.birthday')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f0f0f0',
      }}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            onPress={() => setActiveFilter(filter.key)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: activeFilter === filter.key ? '#E8F3FF' : '#F3F4F6',
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: '500',
              color: activeFilter === filter.key ? '#0068FF' : '#6b7280',
            }}>
              {filter.label} {filter.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contacts List + Alphabet */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <SectionList
          sections={sections}
          style={{ flex: 1 }}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          renderSectionHeader={({ section }) => (
            <View style={{ paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#F9FAFB' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280' }}>
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor: '#fff',
              }}
            >
              <Image
                source={{ uri: item.avatar }}
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', marginRight: 12 }}
              />
              <Text style={{ flex: 1, fontSize: 16, color: '#111827' }} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={{ padding: 4 }}>
                  <Ionicons name="call-outline" size={22} color="#0068FF" />
                </TouchableOpacity>
                <TouchableOpacity style={{ padding: 4 }}>
                  <Ionicons name="videocam-outline" size={22} color="#0068FF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Alphabet Sidebar */}
        <View style={{ justifyContent: 'center', paddingHorizontal: 4, paddingVertical: 4 }}>
          {ALPHABET.map((letter) => (
            <TouchableOpacity key={letter} style={{ paddingVertical: 1.5 }}>
              <Text style={{ fontSize: 10, fontWeight: '500', color: '#6b7280', textAlign: 'center' }}>
                {letter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
}
