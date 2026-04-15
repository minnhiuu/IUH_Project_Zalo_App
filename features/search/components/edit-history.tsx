import { UserAvatar } from '@/components/common/user-avatar'
import { RecentSearchResponse } from '@/features/search/schemas/search-schema'
import { useRecentSearchItems, useRecentSearchQueries, useRemoveRecentSearch } from '@/features/search/queries'
import { storage, STORAGE_KEYS } from '@/utils/storageUtils'
import { useTheme } from '@/context/theme-context'
import { HEADER } from '@/constants/theme'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Stack, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

export function EditHistory() {
  const router = useRouter()
  const { t } = useTranslation()
  const { isDark } = useTheme()

  const [showQuickAccess, setShowQuickAccess] = useState(true)
  const [saveContacts, setSaveContacts] = useState(true)
  const [saveQueries, setSaveQueries] = useState(true)

  const { data: contacts = [], refetch: refetchItems } = useRecentSearchItems()
  const { data: queries = [], refetch: refetchQueries } = useRecentSearchQueries()
  const removeRecentSearch = useRemoveRecentSearch()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const quick = await storage.get<boolean>(STORAGE_KEYS.SEARCH_SHOW_QUICK_ACCESS)
    const contactsPref = await storage.get<boolean>(STORAGE_KEYS.SEARCH_SAVE_CONTACTS)
    const queriesPref = await storage.get<boolean>(STORAGE_KEYS.SEARCH_SAVE_QUERIES)

    if (quick !== null) setShowQuickAccess(quick)
    if (contactsPref !== null) setSaveContacts(contactsPref)
    if (queriesPref !== null) setSaveQueries(queriesPref)
  }

  const handleRemove = (item: RecentSearchResponse) => {
    removeRecentSearch.mutate(
      { id: item.id, type: item.type },
      {
        onSuccess: () => {
          refetchItems()
          refetchQueries()
        }
      }
    )
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

  const bg = isDark ? '#1a1d21' : '#ffffff'
  const headerGradient = isDark ? HEADER.gradientColorsDark : HEADER.gradientColors
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const textMain = isDark ? '#e8eaed' : '#081B3A'
  const textMuted = isDark ? '#8a9bb0' : '#5A6981'
  const iconClose = isDark ? '#6b7a8d' : '#9CA3AF'
  const switchTrackOff = isDark ? '#3e444a' : '#d1d5db'

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={headerGradient}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name='chevron-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('search.editHistory.title')}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={{ flex: 1, backgroundColor: bg }} showsVerticalScrollIndicator={false}>
        <View style={[styles.row, { backgroundColor: bg }]}>
          <Text style={[styles.rowText, { color: textMain }]}>{t('search.editHistory.showQuickAccess')}</Text>
          <Switch
            value={showQuickAccess}
            onValueChange={toggleQuickAccess}
            trackColor={{ false: switchTrackOff, true: '#3B82F6' }}
            thumbColor='#ffffff'
            ios_backgroundColor={switchTrackOff}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <View style={[styles.sectionLabel, { backgroundColor: bg }]}>
          <Text style={[styles.sectionLabelText, { color: textMain }]}>{t('search.editHistory.searchHistory')}</Text>
        </View>

        <View style={[styles.row, { backgroundColor: bg }]}>
          <Text style={[styles.rowText, { color: textMain }]}>{t('search.editHistory.saveContacts')}</Text>
          <Switch
            value={saveContacts}
            onValueChange={toggleSaveContacts}
            trackColor={{ false: switchTrackOff, true: '#3B82F6' }}
            thumbColor='#ffffff'
            ios_backgroundColor={switchTrackOff}
          />
        </View>

        {saveContacts &&
          contacts.map((contact) => (
            <View key={contact.id} style={[styles.item, { backgroundColor: bg }]}>
              <UserAvatar source={contact.avatar} name={contact.name} size='sm' />
              <Text style={[styles.itemText, { color: textMain }]} numberOfLines={1}>
                {contact.name}
              </Text>
              <TouchableOpacity onPress={() => handleRemove(contact)} style={styles.closeBtn}>
                <Ionicons name='close' size={18} color={iconClose} />
              </TouchableOpacity>
            </View>
          ))}

        <View style={[styles.divider, { backgroundColor: dividerColor }]} />

        <View style={[styles.row, { backgroundColor: bg }]}>
          <Text style={[styles.rowText, { color: textMain }]}>{t('search.editHistory.saveQueries')}</Text>
          <Switch
            value={saveQueries}
            onValueChange={toggleSaveQueries}
            trackColor={{ false: switchTrackOff, true: '#3B82F6' }}
            thumbColor='#ffffff'
            ios_backgroundColor={switchTrackOff}
          />
        </View>

        {saveQueries &&
          queries.map((query) => (
            <View key={query.id} style={[styles.item, { backgroundColor: bg }]}>
              <Ionicons name='search-outline' size={20} color={textMuted} style={styles.searchIcon} />
              <Text style={[styles.itemText, { color: textMain }]} numberOfLines={1}>
                {query.name}
              </Text>
              <TouchableOpacity onPress={() => handleRemove(query)} style={styles.closeBtn}>
                <Ionicons name='close' size={18} color={iconClose} />
              </TouchableOpacity>
            </View>
          ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEADER.paddingHorizontal,
    height: HEADER.height
  },
  backBtn: {
    paddingRight: 10
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#fff'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  rowText: {
    fontSize: 15,
    flex: 1,
    marginRight: 12
  },
  divider: {
    height: 1
  },
  sectionLabel: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4
  },
  sectionLabelText: {
    fontSize: 15,
    fontWeight: '700'
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11
  },
  itemText: {
    fontSize: 15,
    flex: 1,
    marginLeft: 12
  },
  closeBtn: {
    padding: 6
  },
  searchIcon: {
    width: 32,
    textAlign: 'center'
  }
})
