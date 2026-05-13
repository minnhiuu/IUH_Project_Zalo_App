import { UserAvatar } from '@/components/common/user-avatar'
import { RecentSearchResponse } from '@/features/search/schemas/search-schema'
import { SearchType } from '@/constants/enum'
import { storage, STORAGE_KEYS } from '@/utils/storageUtils'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

interface RecentSearchListProps {
  searches: RecentSearchResponse[]
  onSelect: (item: RecentSearchResponse) => void
  onRemove: (id: string, type: SearchType) => void
  onClear: () => void
}

export function RecentSearchList({ searches, onSelect, onRemove, onClear }: RecentSearchListProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [showContacts, setShowContacts] = useState(true)
  const [showQueries, setShowQueries] = useState(true)

  useFocusEffect(
    useCallback(() => {
      loadSettings()
    }, [])
  )

  const loadSettings = async () => {
    const contacts = await storage.get<boolean>(STORAGE_KEYS.SEARCH_SAVE_CONTACTS)
    const queries = await storage.get<boolean>(STORAGE_KEYS.SEARCH_SAVE_QUERIES)

    if (contacts !== null) setShowContacts(contacts)
    if (queries !== null) setShowQueries(queries)
  }

  const contacts = searches.filter((item) => item.type === SearchType.User || item.type === SearchType.Group)
  const queries = searches.filter((item) => item.type === SearchType.Keyword)

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
                    onRemove(contact.id, contact.type)
                  }}
                >
                  <Ionicons name='close' size={12} color='gray' />
                </TouchableOpacity>

                <UserAvatar source={contact.avatar} name={contact.name} size='lg' />
                <Text className='text-xs text-center text-foreground mt-1' numberOfLines={2}>
                  {contact.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View className='h-px bg-border mx-0 mt-2' />
        </View>
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
                <Text className='text-foreground text-base'>{query.name}</Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation()
                  onRemove(query.id, query.type)
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
