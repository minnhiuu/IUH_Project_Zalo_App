import { UserAvatar } from '@/components/common/user-avatar'
import { RecentSearch } from '@/features/search/schemas/search-schema'
import { storage, STORAGE_KEYS } from '@/utils/storageUtils'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutAnimation, Platform, ScrollView, Switch, Text, TouchableOpacity, UIManager, View } from 'react-native'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export function EditHistory() {
  const router = useRouter()
  const { t } = useTranslation()
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [showQuickAccess, setShowQuickAccess] = useState(true)
  const [saveContacts, setSaveContacts] = useState(true)
  const [saveQueries, setSaveQueries] = useState(true)

  useEffect(() => {
    loadSettings()
    loadRecentSearches()
  }, [])

  const loadSettings = async () => {
    const quick = await storage.get<boolean>(STORAGE_KEYS.SEARCH_SHOW_QUICK_ACCESS)
    const contacts = await storage.get<boolean>(STORAGE_KEYS.SEARCH_SAVE_CONTACTS)
    const queries = await storage.get<boolean>(STORAGE_KEYS.SEARCH_SAVE_QUERIES)

    if (quick !== null) setShowQuickAccess(quick)
    if (contacts !== null) setSaveContacts(contacts)
    if (queries !== null) setSaveQueries(queries)
  }

  const loadRecentSearches = async () => {
    const saved = await storage.get<RecentSearch[]>(STORAGE_KEYS.RECENT_SEARCHES)
    if (saved) {
      setRecentSearches(saved)
    }
  }

  const saveRecentSearches = async (updated: RecentSearch[]) => {
    setRecentSearches(updated)
    await storage.set(STORAGE_KEYS.RECENT_SEARCHES, updated)
  }

  const handleRemove = async (id: string) => {
    const updated = recentSearches.filter((s) => s.id !== id)
    await saveRecentSearches(updated)
  }

  const toggleQuickAccess = async (val: boolean) => {
    setShowQuickAccess(val)
    await storage.set(STORAGE_KEYS.SEARCH_SHOW_QUICK_ACCESS, val)
  }

  const toggleSaveContacts = async (val: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
    setSaveContacts(val)
    await storage.set(STORAGE_KEYS.SEARCH_SAVE_CONTACTS, val)
  }

  const toggleSaveQueries = async (val: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring)
    setSaveQueries(val)
    await storage.set(STORAGE_KEYS.SEARCH_SAVE_QUERIES, val)
  }

  const contacts = recentSearches.filter((s) => s.type === 'user')
  const queries = recentSearches.filter((s) => s.type === 'keyword')

  return (
    <View>
      <Stack.Screen options={{ headerShown: false }} />

      <View className='flex-row items-center p-4 border-b border-gray-100 bg-white'>
        <TouchableOpacity onPress={() => router.back()} className='mr-4'>
          <Ionicons name='arrow-back' size={24} color='black' />
        </TouchableOpacity>
        <Text className='text-lg font-bold text-black'>{t('search.editHistory.title')}</Text>
      </View>

      <ScrollView className='flex-1 bg-white'>
        <View className='flex-row items-center justify-between px-4 py-4 bg-white'>
          <Text className='text-base text-gray-900'>{t('search.editHistory.showQuickAccess')}</Text>
          <Switch
            value={showQuickAccess}
            onValueChange={toggleQuickAccess}
            trackColor={{ false: '#767577', true: '#3B82F6' }}
            thumbColor={'#f4f3f4'}
            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
          />
        </View>

        <View className='h-2 bg-gray-100' />

        <View className='px-4 py-3'>
          <Text className='font-bold text-gray-500 mb-1 uppercase text-sm'>
            {t('search.editHistory.searchHistory')}
          </Text>
        </View>

        <View className='bg-white'>
          <View className='flex-row items-center justify-between px-4 py-3'>
            <Text className='text-base text-gray-900'>{t('search.editHistory.saveContacts')}</Text>
            <Switch
              value={saveContacts}
              onValueChange={toggleSaveContacts}
              trackColor={{ false: '#767577', true: '#3B82F6' }}
              thumbColor={'#f4f3f4'}
              style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
            />
          </View>

          {saveContacts &&
            contacts.map((contact) => (
              <View key={contact.id} className='flex-row items-center justify-between px-4 py-3 pl-8'>
                <View className='flex-row items-center flex-1'>
                  <UserAvatar source={contact.avatar} name={contact.displayName} size='md' className='mr-3' />
                  <Text className='text-base text-gray-900 flex-1' numberOfLines={1}>
                    {contact.displayName}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemove(contact.id)} className='p-2'>
                  <Ionicons name='close' size={20} color='#6B7280' />
                </TouchableOpacity>
              </View>
            ))}

          <View className='flex-row items-center justify-between px-4 py-3 mt-2'>
            <Text className='text-base text-gray-900'>{t('search.editHistory.saveQueries')}</Text>
            <Switch
              value={saveQueries}
              onValueChange={toggleSaveQueries}
              trackColor={{ false: '#767577', true: '#3B82F6' }}
              thumbColor={'#f4f3f4'}
              style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
            />
          </View>

          {saveQueries &&
            queries.map((query) => (
              <View key={query.id} className='flex-row items-center justify-between px-4 py-3 pl-8'>
                <View className='flex-row items-center flex-1'>
                  <Ionicons name='search-outline' size={24} color='#6B7280' />
                  <Text className='text-base text-gray-900 ml-4 flex-1' numberOfLines={1}>
                    {query.displayName}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemove(query.id)} className='p-2'>
                  <Ionicons name='close' size={20} color='#6B7280' />
                </TouchableOpacity>
              </View>
            ))}
        </View>

        <View className='h-20' />
      </ScrollView>
    </View>
  )
}
