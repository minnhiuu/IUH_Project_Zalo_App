import { Ionicons } from '@expo/vector-icons'
import { View, ScrollView, Pressable } from 'react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Header, Avatar, Text } from '@/components/ui'

interface Contact {
  id: string
  name: string
  avatar: string
  initial: string
}

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Ba',
    avatar: 'https://i.pravatar.cc/150?img=1',
    initial: 'B'
  },
  {
    id: '2',
    name: 'Bèo Photocopy - Printing',
    avatar: 'https://i.pravatar.cc/150?img=2',
    initial: 'B'
  },
  {
    id: '3',
    name: 'Boconganh',
    avatar: 'https://i.pravatar.cc/150?img=3',
    initial: 'B'
  },
  {
    id: '4',
    name: 'Bong',
    avatar: 'https://i.pravatar.cc/150?img=4',
    initial: 'B'
  },
  {
    id: '5',
    name: 'Bùi Thu Thảo',
    avatar: 'https://i.pravatar.cc/150?img=5',
    initial: 'B'
  }
]

export default function ContactsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'friends' | 'groups' | 'oa'>('friends')

  const handleAddFriend = () => {
    // Navigate to add friend screen
    console.log('Add friend')
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header with Add Friend button */}
      <Header
        showSearch
        searchPlaceholder={t('contacts.search')}
        showAddButton
        onAddPress={handleAddFriend}
      />

      {/* Tabs */}
      <View className="flex-row border-b border-border bg-white">
        <Pressable
          onPress={() => setActiveTab('friends')}
          className={`flex-1 py-3 items-center ${
            activeTab === 'friends' ? 'border-b-2 border-primary' : ''
          }`}
        >
          <Text
            weight="medium"
            variant={activeTab === 'friends' ? 'primary' : 'muted'}
          >
            {t('contacts.tabs.friends')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('groups')}
          className={`flex-1 py-3 items-center ${
            activeTab === 'groups' ? 'border-b-2 border-primary' : ''
          }`}
        >
          <Text
            weight="medium"
            variant={activeTab === 'groups' ? 'primary' : 'muted'}
          >
            {t('contacts.tabs.groups')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('oa')}
          className={`flex-1 py-3 items-center ${
            activeTab === 'oa' ? 'border-b-2 border-primary' : ''
          }`}
        >
          <Text
            weight="medium"
            variant={activeTab === 'oa' ? 'primary' : 'muted'}
          >
            {t('contacts.tabs.oa')}
          </Text>
        </Pressable>
      </View>

      {/* Quick Actions */}
      <View className="bg-white">
        <Pressable 
          className="flex-row items-center px-4 py-3 active:bg-gray-100"
          onPress={() => router.push('/friend-requests')}
        >
          <View className="w-12 h-12 bg-primary rounded-full items-center justify-center mr-3">
            <Ionicons name="person-add" size={24} color="#ffffff" />
          </View>
          <Text size="base" weight="medium">
            {t('contacts.friendRequest')} <Text variant="muted">(10)</Text>
          </Text>
        </Pressable>

        <Pressable className="flex-row items-center px-4 py-3 active:bg-gray-100">
          <View className="w-12 h-12 bg-primary rounded-full items-center justify-center mr-3">
            <Ionicons name="gift" size={24} color="#ffffff" />
          </View>
          <Text size="base" weight="medium">
            {t('contacts.birthday')}
          </Text>
        </Pressable>
      </View>

      {/* Filters - Fixed width to prevent overflow */}
      <View className="bg-white px-4 py-3 border-b border-border">
        <View className="flex-row gap-2">
          <Pressable className="flex-1 py-2 rounded-full bg-muted active:bg-gray-300 items-center">
            <Text size="sm" weight="medium" numberOfLines={1}>
              {t('contacts.filters.all')} 135
            </Text>
          </Pressable>
          <Pressable className="flex-1 py-2 rounded-full border border-border active:bg-gray-100 items-center">
            <Text size="sm" variant="muted" numberOfLines={1}>
              {t('contacts.filters.new')} 1
            </Text>
          </Pressable>
          <Pressable className="flex-1 py-2 rounded-full border border-border active:bg-gray-100 items-center">
            <Text size="sm" variant="muted" numberOfLines={1}>
              {t('contacts.filters.recent')} 8
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Contacts List with Alphabetical Index */}
      <View className="flex-1 flex-row">
        <ScrollView className="flex-1">
          {/* Section Header */}
          <View className="px-4 py-2 bg-muted">
            <Text weight="bold" variant="muted">
              B
            </Text>
          </View>

          {/* Contacts */}
          {MOCK_CONTACTS.map((contact) => (
            <Pressable
              key={contact.id}
              className="flex-row items-center px-4 py-3 active:bg-gray-100"
            >
              <Avatar
                size="md"
                source={{ uri: contact.avatar }}
                fallback={
                  <View className="bg-primary items-center justify-center w-full h-full">
                    <Text className="text-white font-bold">
                      {contact.name[0]}
                    </Text>
                  </View>
                }
              />
              <Text size="base" weight="medium" className="flex-1 ml-3">
                {contact.name}
              </Text>
              <Pressable className="p-2">
                <Ionicons name="call-outline" size={24} color="#0068FF" />
              </Pressable>
              <Pressable className="p-2">
                <Ionicons name="videocam-outline" size={24} color="#0068FF" />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>

        {/* Alphabetical Index */}
        <View className="justify-center items-center px-2 py-4">
          {['B', 'C', 'D', 'Đ', 'F', 'H', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'T', 'V', 'X', 'Y', 'Z'].map((letter) => (
            <Pressable key={letter} className="py-0.5">
              <Text size="xs" variant={letter === 'B' ? 'primary' : 'muted'} weight="medium">
                {letter}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  )
}
