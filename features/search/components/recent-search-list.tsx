import { UserAvatar } from '@/components/common/user-avatar'
import { RecentSearch } from '@/features/search/schemas/search-schema'
import { storage, STORAGE_KEYS } from '@/utils/storageUtils'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

interface RecentSearchListProps {
  searches: RecentSearch[]
  onSelect: (item: RecentSearch) => void
  onRemove: (id: string) => void
  onClear: () => void
}

const MOCK_QUICK_ACCESS = [
  { id: '1', name: 'QR Wallet', icon: 'qr-code-outline', color: '#60A5FA' },
  { id: '2', name: 'Zalo Video', icon: 'play-circle-outline', color: '#A78BFA' },
  { id: '3', name: 'Add', icon: 'add', color: '#E5E7EB', isAdd: true }
]

export function RecentSearchList({ searches, onSelect, onRemove, onClear }: RecentSearchListProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [showQuickAccess, setShowQuickAccess] = useState(true)
  const [showContacts, setShowContacts] = useState(true)
  const [showQueries, setShowQueries] = useState(true)

  useFocusEffect(
    useCallback(() => {
      loadSettings()
    }, [])
  )

  const loadSettings = async () => {
    const quick = await storage.get<boolean>(STORAGE_KEYS.SEARCH_SHOW_QUICK_ACCESS)
    const contacts = await storage.get<boolean>(STORAGE_KEYS.SEARCH_SAVE_CONTACTS)
    const queries = await storage.get<boolean>(STORAGE_KEYS.SEARCH_SAVE_QUERIES)

    if (quick !== null) setShowQuickAccess(quick)
    if (contacts !== null) setShowContacts(contacts)
    if (queries !== null) setShowQueries(queries)
  }

  const contacts = searches.filter((item) => item.type === 'user')
  const queries = searches.filter((item) => item.type === 'keyword')

  return (
    <ScrollView
      className='flex-1 bg-background'
      keyboardShouldPersistTaps='handled'
      showsVerticalScrollIndicator={false}
    >
      {showContacts && contacts.length > 0 && (
        <View className='mt-5'>
          <View className='flex-row items-center justify-between px-4 mb-3'>
            <Text className='font-bold text-foreground'>{t('search.recent.contacts')}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className='pl-4 pb-4'>
            {contacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                className='mr-4 items-center w-20 relative'
                onPress={() => onSelect(contact)}
              >
                <TouchableOpacity
                  className='absolute top-0 right-1 z-10 bg-muted rounded-full p-0.5'
                  onPress={(e) => {
                    e.stopPropagation()
                    onRemove(contact.id)
                  }}
                >
                  <Ionicons name='close' size={12} color='gray' />
                </TouchableOpacity>

                <UserAvatar source={contact.avatar} name={contact.displayName} size='lg' />
                <Text className='text-xs text-center text-foreground mt-1' numberOfLines={2}>
                  {contact.displayName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className='h-2 bg-background-secondary my-2' />
        </View>
      )}

      {showQuickAccess && (
        <>
          <View className='mt-2'>
            <Text className='font-bold text-foreground px-4 mb-3'>{t('search.recent.quickAccess')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className='pl-4 pb-2'>
              {MOCK_QUICK_ACCESS.map((item) => (
                <TouchableOpacity key={item.id} className='mr-6 items-center w-16'>
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center mb-1 ${item.isAdd ? 'bg-muted' : 'bg-background'}`}
                    style={!item.isAdd ? { backgroundColor: item.color + '20' } : {}}
                  >
                    <Ionicons name={item.icon as any} size={24} color={item.isAdd ? '#9FACBC' : item.color} />
                  </View>
                  <Text className='text-xs text-center text-muted-foreground' numberOfLines={2}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className='h-2 bg-background-secondary my-2' />
        </>
      )}

      {showQueries && queries.length > 0 && (
        <View className='mt-2 pb-10'>
          <View className='flex-row items-center justify-between px-4 mb-2'>
            <Text className='font-bold text-foreground'>{t('search.recent.queries')}</Text>
          </View>
          {queries.map((query) => (
            <TouchableOpacity
              key={query.id}
              className='flex-row items-center px-4 py-3 active:bg-muted'
              onPress={() => onSelect(query)}
            >
              <Ionicons name='search-outline' size={24} color='#9FACBC' />
              <View className='flex-1 ml-4'>
                <Text className='text-foreground text-base'>{query.displayName}</Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  onRemove(query.id)
                }}
                className='p-1'
              >
                <Ionicons name='close' size={16} color='#9FACBC' />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        className='flex-row items-center px-4 pt-2 pb-4 mb-8'
        onPress={() => router.push('/search/edit-history')}
      >
        <Text className='text-primary font-medium text-base mr-1'>{t('search.recent.editHistory')}</Text>
        <Ionicons name='chevron-forward' size={16} color='#0068FF' />
      </TouchableOpacity>
    </ScrollView>
  )
}
