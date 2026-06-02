import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'

import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useTheme } from '@/context'
import { useContactSuggestions } from '@/features/friend/queries'
import { GroupMemberPickerItem } from '@/features/message/components/group'
import type { SearchMemberResponse } from '@/features/message/schemas'
import {
  useConversations,
  useCreateGroupConversation,
  useFriendsDirectory,
  useGenerateJoinLink,
  useSendMessage,
  useSearchMembersInfinite,
  useUpdateGroupAvatar
} from '@/features/message/queries'
import { messageApi } from '@/features/message/api/message.api'
import { buildGroupLinkUrl } from '@/features/message/utils'

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
  const [memberRegistry, setMemberRegistry] = useState<Map<string, SearchMemberResponse>>(new Map())

  const { data: directory = {}, isLoading: loadingDirectory } = useFriendsDirectory(null, true)
  const { data: contacts = [], isLoading: loadingContacts } = useContactSuggestions(0, 100, true)
  const { data: conversations = [] } = useConversations(0, 40, true)
  const { data: searchData, isLoading: loadingSearch } = useSearchMembersInfinite(search.trim(), null, !!search.trim())

  const createGroupMutation = useCreateGroupConversation()
  const updateGroupAvatarMutation = useUpdateGroupAvatar()
  const generateJoinLinkMutation = useGenerateJoinLink()
  const sendMessageMutation = useSendMessage()

  const flatDirectory = useMemo(() => {
    return Object.values(directory).flat() as SearchMemberResponse[]
  }, [directory])

  const mappedContacts = useMemo(() => {
    return contacts.map(c => ({
      userId: c.userId,
      fullName: c.fullName,
      avatar: c.avatar,
      phoneNumber: c.phoneNumber
    })) as SearchMemberResponse[]
  }, [contacts])

  const searchedMembers = useMemo(() => {
    if (!searchData?.pages) return [] as SearchMemberResponse[]
    return searchData.pages.flatMap((page) => page?.data ?? [])
  }, [searchData])

  // Update member registry whenever new members are loaded
  useMemo(() => {
    const newRegistry = new Map(memberRegistry)
    let changed = false

    const addBatch = (list: SearchMemberResponse[]) => {
      list.forEach(m => {
        if (!newRegistry.has(m.userId)) {
          newRegistry.set(m.userId, m)
          changed = true
        }
      })
    }

    addBatch(flatDirectory)
    addBatch(mappedContacts)
    addBatch(searchedMembers)

    if (changed) {
      setMemberRegistry(newRegistry)
    }
  }, [flatDirectory, mappedContacts, searchedMembers])

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

  const displayMembers = useMemo(() => {
    if (search.trim()) return searchedMembers
    if (activeTab === 'recent') return recentMembers
    return mappedContacts
  }, [search, searchedMembers, activeTab, recentMembers, mappedContacts])

  const uniqueMembers = useMemo(() => {
    const map = new Map<string, SearchMemberResponse>()
    displayMembers.forEach((member) => {
      if (!map.has(member.userId)) map.set(member.userId, member)
    })
    return Array.from(map.values())
  }, [displayMembers])

  const toggleMember = (memberId: string) => {
    setSelectedIds((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
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
    if (selectedIds.length < 1 || createGroupMutation.isPending) return

    let createdConversationId = ''
    let createdConversationName = ''
    let createdConversationAvatar = ''

    try {
      // Determine which selected users are strangers (not in friend directory)
      const strangerIds = selectedIds.filter(id => !flatDirectory.some(m => m.userId === id))
      // For group creation, we try to add everyone. 
      // But the user wants to ALSO send a link to strangers in a 1-1 chat.

      const defaultName = selectedUsers.slice(0, 3).map(u => u.fullName.split(' ').pop() || u.fullName).join(', ') + (selectedUsers.length > 3 ? '...' : '')
      const created = await createGroupMutation.mutateAsync({
        name: groupName.trim() || defaultName,
        isGroup: true,
        memberIds: selectedIds,
        avatar: null
      })

      const conversation = created.data.data
      createdConversationId = conversation.id
      createdConversationName = conversation.name || groupName.trim() || defaultName
      createdConversationAvatar = conversation.avatar || ''

      // If there are strangers, generate a link and send it to them via 1-1 chat
      if (strangerIds.length > 0) {
        try {
          const linkRes = await generateJoinLinkMutation.mutateAsync(createdConversationId)
          const joinLinkToken = linkRes.data.data
          const joinLinkUrl = buildGroupLinkUrl(joinLinkToken)

          for (const strangerId of strangerIds) {
            try {
              // Get or create 1-1 conversation with stranger
              const convRes = await messageApi.getOrCreateConversation(strangerId)
              const strangerConvId = convRes.data.data.id

              await sendMessageMutation.mutateAsync({
                conversationId: strangerConvId,
                // Send canonical plain URL so both app and web classify it as join link.
                content: joinLinkUrl,
                isForwarded: false
              })
            } catch (err) {
              console.error(`Failed to invite stranger ${strangerId}:`, err)
            }
          }
        } catch (err) {
          console.error('Failed to generate join link or send invites:', err)
        }
      }

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
  const isSubmitDisabled = selectedIds.length < 1 || isBusy

  const selectedUsers = useMemo(() => {
    return selectedIds
      .map(id => memberRegistry.get(id))
      .filter((u): u is SearchMemberResponse => !!u)
  }, [selectedIds, memberRegistry])

  const renderSelectedUser = ({ item }: { item: SearchMemberResponse }) => (
    <View style={styles.selectedItem}>
      <UserAvatar source={item.avatar || undefined} name={item.fullName} size='lg' />
      <TouchableOpacity
        style={styles.removeSelectedBtn}
        onPress={() => toggleMember(item.userId)}
      >
        <Ionicons name='close-circle' size={20} color='rgba(0,0,0,0.3)' />
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.header, { borderBottomColor: palette.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name='close' size={28} color={palette.text} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: palette.text }]}>{t('message.groupCreate.title')}</Text>
            <Text style={[styles.headerSub, { color: palette.subText }]}>
              {t('message.groupCreate.selectedCount', { count: selectedIds.length })}
            </Text>
          </View>
        </View>

        <View style={styles.groupInfoRow}>
          <Pressable style={[styles.avatarPlaceholder, { backgroundColor: palette.avatarBg }]} onPress={onPickAvatar}>
            {avatarAsset?.uri ? (
              <UserAvatar source={avatarAsset.uri} name={groupName || 'Group'} size='2xl' />
            ) : (
              <Ionicons name='camera' size={24} color='#969FA9' />
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
          <Ionicons name='search' size={20} color='#9CA3AF' />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('message.groupCreate.searchPlaceholder')}
            placeholderTextColor='#9CA3AF'
            style={[styles.searchInput, { color: palette.searchText }]}
          />
          <Ionicons name='keypad-outline' size={20} color='#9CA3AF' />
        </View>

        {!search.trim() && (
          <View style={[styles.tabRow, { borderBottomColor: palette.border }]}>
            {TABS.map((tab) => {
              const active = activeTab === tab
              return (
                <Pressable key={tab} style={styles.tabButton} onPress={() => setActiveTab(tab)}>
                  <Text style={[styles.tabText, { color: active ? palette.primary : palette.tabInactive }]}>
                    {tab === 'recent' ? t('message.groupCreate.tabs.recent') : t('message.groupCreate.tabs.contacts')}
                  </Text>
                  {active && <View style={[styles.tabUnderline, { backgroundColor: palette.primary }]} />}
                </Pressable>
              )
            })}
          </View>
        )}

        <View style={{ flex: 1 }}>
          {(loadingDirectory || loadingSearch || loadingContacts) ? (
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
        </View>

        <View style={[styles.footer, { backgroundColor: palette.bg }]}>
          <View style={styles.selectedRow}>
            <FlatList
              horizontal
              data={selectedUsers}
              renderItem={renderSelectedUser}
              keyExtractor={item => item.userId}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedListContent}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onSubmit}
              disabled={isSubmitDisabled}
              style={[
                styles.submitFab,
                { backgroundColor: isSubmitDisabled ? palette.primaryDisabled : palette.primary }
              ]}
            >
              {isBusy ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <Ionicons name='send' size={24} color='#fff' />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    fontSize: 18,
    fontWeight: '700'
  },
  headerSub: {
    fontSize: 13,
    marginTop: 1
  },
  groupInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E6EBEF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  groupNameInput: {
    flex: 1,
    height: 40,
    fontSize: 16
  },
  searchRow: {
    marginHorizontal: 16,
    marginBottom: 4,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
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
    paddingBottom: 20
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 12,
    paddingHorizontal: 16
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectedListContent: {
    paddingRight: 16,
    gap: 12
  },
  selectedItem: {
    position: 'relative'
  },
  removeSelectedBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 10
  },
  submitFab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center'
  }
})
