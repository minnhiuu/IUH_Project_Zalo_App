import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'

import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useTheme } from '@/context'
import { GroupMemberPickerItem } from '@/features/message/components/group'
import type { SearchMemberResponse } from '@/features/message/schemas'
import {
  useConversations,
  useCreateGroupConversation,
  useFriendsDirectory,
  useSearchMembersInfinite,
  useUpdateGroupAvatar
} from '@/features/message/queries'

const TABS = ['recent', 'contacts'] as const

type MemberTab = (typeof TABS)[number]

export default function CreateGroupScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { colors, isDark } = useTheme()

  const palette = isDark
    ? {
        bg: '#171B22',
        panel: '#171B22',
        text: '#F1F5F9',
        subText: '#9AA5B5',
        border: '#2B313B',
        searchBg: '#242A34',
        searchText: '#DDE3EC',
        tabActive: '#E8EDF4',
        tabInactive: '#8E99A8',
        primary: '#2A7FFF',
        primaryDisabled: '#4C647F',
        bottomBar: '#1A1F28',
        avatarBg: '#2B313C'
      }
    : {
        bg: '#FFFFFF',
        panel: '#FFFFFF',
        text: '#111827',
        subText: '#6B7280',
        border: '#E5E7EB',
        searchBg: '#F3F4F7',
        searchText: '#111827',
        tabActive: '#1F2937',
        tabInactive: '#7B8794',
        primary: '#1977F3',
        primaryDisabled: '#9FC4F8',
        bottomBar: '#FFFFFF',
        avatarBg: '#E6EBEF'
      }

  const [groupName, setGroupName] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<MemberTab>('recent')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [avatarAsset, setAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null)

  const { data: directory = {}, isLoading: loadingDirectory } = useFriendsDirectory(null, true)
  const { data: conversations = [] } = useConversations(0, 40, true)
  const { data: searchData, isLoading: loadingSearch } = useSearchMembersInfinite(search.trim(), null, !!search.trim())

  const createGroupMutation = useCreateGroupConversation()
  const updateGroupAvatarMutation = useUpdateGroupAvatar()

  const flatDirectory = useMemo(() => {
    return Object.values(directory).flat() as SearchMemberResponse[]
  }, [directory])

  const recentMemberIds = useMemo(() => {
    const ids = new Set<string>()
    conversations.forEach((conv) => {
      conv.members?.forEach((member) => {
        if (member.userId) ids.add(member.userId)
      })
    })
    return ids
  }, [conversations])

  const recentMembers = useMemo(() => {
    const base = flatDirectory.filter((m) => recentMemberIds.has(m.userId))
    return base.length > 0 ? base : flatDirectory
  }, [flatDirectory, recentMemberIds])

  const searchedMembers = useMemo(() => {
    if (!searchData?.pages) return [] as SearchMemberResponse[]
    return searchData.pages.flatMap((page) => page?.data ?? [])
  }, [searchData])

  const displayMembers = useMemo(() => {
    if (search.trim()) return searchedMembers
    if (activeTab === 'recent') return recentMembers
    return flatDirectory
  }, [search, searchedMembers, activeTab, recentMembers, flatDirectory])

  const uniqueMembers = useMemo(() => {
    const map = new Map<string, SearchMemberResponse>()
    displayMembers.forEach((member) => {
      if (!map.has(member.userId)) map.set(member.userId, member)
    })
    return Array.from(map.values())
  }, [displayMembers])

  const toggleMember = (memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

  const onPickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Toast.show({ type: 'error', text1: t('message.groupCreate.permissionDenied') })
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
      aspect: [1, 1]
    })

    if (!result.canceled && result.assets?.length) {
      setAvatarAsset(result.assets[0])
    }
  }

  const onSubmit = async () => {
    if (selectedIds.length < 2 || createGroupMutation.isPending) return

    let createdConversationId = ''
    let createdConversationName = ''
    let createdConversationAvatar = ''

    try {
      const created = await createGroupMutation.mutateAsync({
        name: groupName.trim() || ' ',
        isGroup: true,
        memberIds: selectedIds,
        avatar: null
      })

      const conversation = created.data.data
      createdConversationId = conversation.id
      createdConversationName = conversation.name || groupName || t('message.groupCreate.defaultGroupName')
      createdConversationAvatar = conversation.avatar || ''

      Toast.show({ type: 'success', text1: t('message.groupCreate.success') })
      router.replace({
        pathname: '/chat/[id]' as any,
        params: {
          id: createdConversationId,
          conversationId: createdConversationId,
          name: createdConversationName,
          avatar: createdConversationAvatar
        }
      })

      if (avatarAsset?.uri && createdConversationId) {
        updateGroupAvatarMutation
          .mutateAsync({
            conversationId: createdConversationId,
            uri: avatarAsset.uri,
            mimeType: avatarAsset.mimeType || 'image/jpeg',
            fileName: avatarAsset.fileName || `group-${Date.now()}.jpg`
          })
          .catch(() => {
            Toast.show({ type: 'info', text1: t('message.groupCreate.avatarUpdateFailed') })
          })
      }
    } catch {
      Toast.show({ type: 'error', text1: t('message.groupCreate.failed') })
    }
  }

  const renderMember = ({ item }: { item: SearchMemberResponse }) => {
    const subtitle = activeTab === 'recent' ? t('message.groupCreate.recentlyActive') : t('message.groupCreate.contact')
    return (
      <GroupMemberPickerItem
        member={item}
        subtitle={subtitle}
        selected={selectedIds.includes(item.userId)}
        onPress={() => toggleMember(item.userId)}
      />
    )
  }

  const isBusy = createGroupMutation.isPending || updateGroupAvatarMutation.isPending
  const isSubmitDisabled = selectedIds.length < 2 || isBusy

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}> 
      <View style={[styles.header, { borderBottomColor: palette.border }]}> 
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name='close' size={34} color={palette.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: palette.text }]}>{t('message.groupCreate.title')}</Text>
          <Text style={[styles.headerSub, { color: palette.subText }]}>{t('message.groupCreate.selectedCount', { count: selectedIds.length })}</Text>
        </View>
      </View>

      <View style={styles.groupInfoRow}>
        <Pressable style={[styles.avatarPlaceholder, { backgroundColor: palette.avatarBg }]} onPress={onPickAvatar}>
          {avatarAsset?.uri ? (
            <UserAvatar source={avatarAsset.uri} name={groupName || 'Group'} size='4xl' />
          ) : (
            <Ionicons name='camera' size={33} color='#969FA9' />
          )}
        </Pressable>

        <TextInput
          value={groupName}
          onChangeText={setGroupName}
          placeholder={t('message.groupCreate.groupNamePlaceholder')}
          placeholderTextColor='#9CA3AF'
          style={[styles.groupNameInput, { color: palette.text }]}
          maxLength={60}
        />
      </View>

      <View style={[styles.searchRow, { backgroundColor: palette.searchBg }]}> 
        <Ionicons name='search' size={24} color='#9CA3AF' />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('message.groupCreate.searchPlaceholder')}
          placeholderTextColor='#9CA3AF'
          style={[styles.searchInput, { color: palette.searchText }]}
        />
        <Ionicons name='keypad-outline' size={24} color='#9CA3AF' />
      </View>

      {!search.trim() && (
        <View style={[styles.tabRow, { borderBottomColor: palette.border }]}> 
          {TABS.map((tab) => {
            const active = activeTab === tab
            return (
              <Pressable key={tab} style={styles.tabButton} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, { color: active ? palette.tabActive : palette.tabInactive }]}>
                  {tab === 'recent' ? t('message.groupCreate.tabs.recent') : t('message.groupCreate.tabs.contacts')}
                </Text>
                {active && <View style={[styles.tabUnderline, { backgroundColor: palette.primary }]} />}
              </Pressable>
            )
          })}
        </View>
      )}

      {loadingDirectory || loadingSearch ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color='#1977F3' />
        </View>
      ) : (
        <FlatList
          data={uniqueMembers}
          keyExtractor={(item) => item.userId}
          renderItem={renderMember}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: palette.subText }]}>{t('message.groupCreate.empty')}</Text>
            </View>
          }
        />
      )}

      <View style={[styles.bottomBar, { backgroundColor: palette.bottomBar, borderTopColor: palette.border }]}> 
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSubmit}
          disabled={isSubmitDisabled}
          style={[
            styles.submitButton,
            { backgroundColor: isSubmitDisabled ? palette.primaryDisabled : palette.primary },
            isSubmitDisabled && styles.submitButtonDisabled
          ]}
        >
          {isBusy ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.submitText}>{t('message.groupCreate.createButton')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 70,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 2
  },
  closeBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitleWrap: {
    marginLeft: 4
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700'
  },
  headerSub: {
    fontSize: 15,
    marginTop: 1
  },
  groupInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6EBEF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  groupNameInput: {
    flex: 1,
    height: 48,
    fontSize: 18
  },
  searchRow: {
    marginHorizontal: 16,
    marginBottom: 4,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#111827'
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DCE2E8'
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10,
    position: 'relative'
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500'
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '85%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  listContent: {
    paddingBottom: 120
  },
  emptyWrap: {
    paddingTop: 60,
    alignItems: 'center'
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 18
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1977F3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButtonDisabled: {
    backgroundColor: '#9FC4F8'
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
})
