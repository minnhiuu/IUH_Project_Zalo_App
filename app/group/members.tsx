import React, { useMemo, useState } from 'react'
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { HEADER } from '@/constants/theme'
import { useTheme } from '@/context'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAuthStore } from '@/store'
import {
  useApproveJoinRequest,
  useBlockMemberFromGroup,
  useConversations,
  useDemoteFromAdmin,
  useGroupMembersInfinite,
  useJoinRequestsInfinite,
  usePromoteToAdmin,
  useRejectJoinRequest,
  useRemoveMemberFromGroup,
} from '@/features/message/queries'

type TabKey = 'all' | 'admins' | 'blocked'

export default function GroupMembersScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isDark } = useTheme()
  const { conversationId, name } = useLocalSearchParams<{ conversationId: string; name?: string }>()
  const currentUserId = useAuthStore((s) => s.user?.id)

  const { data: convs = [] } = useConversations(0, 100, true)
  const conversation = convs.find((c) => c.id === conversationId)

  const myRole = conversation?.members?.find((m) => m.userId === currentUserId)?.role?.toUpperCase() || 'MEMBER'
  const isAdmin = myRole === 'OWNER' || myRole === 'ADMIN'

  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [selectedMember, setSelectedMember] = useState<any | null>(null)
  const [memberInfoOpen, setMemberInfoOpen] = useState(false)
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false)
  const [blockOnRemove, setBlockOnRemove] = useState(false)

  const groupMembersQ = useGroupMembersInfinite(conversationId || '', '', !!conversationId)
  const joinRequestsQ = useJoinRequestsInfinite(conversationId || '', !!conversationId && isAdmin)
  const approveJoin = useApproveJoinRequest()
  const rejectJoin = useRejectJoinRequest()
  const promoteToAdmin = usePromoteToAdmin()
  const demoteFromAdmin = useDemoteFromAdmin()
  const removeMember = useRemoveMemberFromGroup()
  const blockMember = useBlockMemberFromGroup()

  const allMembers = useMemo(
    () => groupMembersQ.data?.pages.flatMap((p) => p?.data || []) || [],
    [groupMembersQ.data]
  )

  const pendingRequests = useMemo(
    () =>
      joinRequestsQ.data?.pages.flatMap((p: any) => {
        if (Array.isArray(p)) return p
        return p?.data || p?.content || []
      }) || [],
    [joinRequestsQ.data]
  )

  const displayedMembers = useMemo(() => {
    if (activeTab === 'admins') {
      return allMembers.filter((m) => String(m.role || '').toUpperCase() === 'OWNER' || String(m.role || '').toUpperCase() === 'ADMIN')
    }
    if (activeTab === 'blocked') return []
    return allMembers
  }, [allMembers, activeTab])

  const canManageMember = (member: any) => {
    const targetRole = String(member?.role || '').toUpperCase()
    if (!member || member.userId === currentUserId) return false
    if (myRole === 'OWNER') return targetRole !== 'OWNER'
    if (myRole === 'ADMIN') return targetRole === 'MEMBER'
    return false
  }

  const openMemberInfo = (member: any) => {
    setSelectedMember(member)
    setMemberInfoOpen(true)
  }

  const closeMemberInfo = () => {
    setMemberInfoOpen(false)
    setTimeout(() => setSelectedMember(null), 120)
  }

  const closeRemoveConfirm = () => {
    setRemoveConfirmOpen(false)
    setBlockOnRemove(false)
  }

  const selectedRole = String(selectedMember?.role || '').toUpperCase()
  const canPromote = myRole === 'OWNER' && selectedMember?.userId !== currentUserId && selectedRole === 'MEMBER'
  const canDemote = myRole === 'OWNER' && selectedMember?.userId !== currentUserId && selectedRole === 'ADMIN'
  const canRemove = selectedMember ? canManageMember(selectedMember) : false
  const canBlock = selectedMember ? canManageMember(selectedMember) : false

  const handlePromote = () => {
    if (!selectedMember?.userId) return
    promoteToAdmin.mutate({ conversationId: conversationId || '', targetUserId: selectedMember.userId })
    closeMemberInfo()
  }

  const handleDemote = () => {
    if (!selectedMember?.userId) return
    demoteFromAdmin.mutate({ conversationId: conversationId || '', targetUserId: selectedMember.userId })
    closeMemberInfo()
  }

  const handleRemoveMember = () => {
    if (!selectedMember?.userId) return
    setMemberInfoOpen(false)
    setRemoveConfirmOpen(true)
  }

  const confirmRemoveMember = () => {
    if (!selectedMember?.userId) return
    removeMember.mutate({
      conversationId: conversationId || '',
      targetUserId: selectedMember.userId,
      blockFromGroup: blockOnRemove
    })
    closeRemoveConfirm()
    setTimeout(() => setSelectedMember(null), 120)
  }

  const handleBlockMember = () => {
    if (!selectedMember?.userId) return
    blockMember.mutate({ conversationId: conversationId || '', targetUserId: selectedMember.userId })
    closeMemberInfo()
  }

  const palette = isDark
    ? {
        bg: '#11151C',
        card: '#171D26',
        text: '#ECF2FB',
        subText: '#AAB6C8',
        line: '#293241',
        primary: '#3D8BFF'
      }
    : {
        bg: '#F4F5F7',
        card: '#FFFFFF',
        text: '#151D2F',
        subText: '#7A869A',
        line: '#E6EAF0',
        primary: '#2C7BE5'
      }

  const title = isAdmin ? t('message.groupMembers.manageTitle') : t('message.groupMembers.title')

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'all', label: t('message.groupMembers.tabs.all') },
    { key: 'admins', label: t('message.groupMembers.tabs.admins') },
    { key: 'blocked', label: t('message.groupMembers.tabs.blocked') }
  ]

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <LinearGradient colors={isDark ? HEADER.gradientColorsDark : HEADER.gradientColors}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 10 }}>
              <Ionicons name='chevron-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={styles.headerIcons}>
              <Ionicons name='person-add-outline' size={24} color='#fff' />
              <Ionicons name='search-outline' size={24} color='#fff' />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {isAdmin ? (
        <>
          <View style={[styles.tabsRow, { backgroundColor: palette.card, borderBottomColor: palette.line }]}> 
            {tabs.map((tab) => {
              const active = tab.key === activeTab
              return (
                <Pressable key={tab.key} style={styles.tabBtn} onPress={() => setActiveTab(tab.key)}>
                  <Text style={{ color: active ? palette.text : palette.subText, fontSize: 14, fontWeight: active ? '700' : '600' }}>
                    {tab.label}
                  </Text>
                  {active && <View style={[styles.tabUnderline, { backgroundColor: palette.text }]} />}
                </Pressable>
              )
            })}
          </View>

          {activeTab === 'all' && (
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => {
                if (!conversationId) return
                router.push({ pathname: '/group/approval' as any, params: { conversationId, name: String(name || ''), canManage: 'true' } })
              }}
              style={[styles.approveRow, { backgroundColor: palette.card, borderBottomColor: palette.line }]}
            >
              <View style={[styles.approveIcon, { backgroundColor: isDark ? '#273244' : '#F2F5F9' }]}>
                <Ionicons name='person-add-outline' size={20} color={palette.text} />
              </View>
              <Text style={{ fontSize: 15, color: palette.text, flex: 1 }}>{t('message.groupMembers.approveMembers')}</Text>
              <Text style={{ color: palette.subText, fontSize: 14 }}>
                {pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={[styles.simpleTitleRow, { backgroundColor: palette.card, borderBottomColor: palette.line }]}>
          <Text style={{ color: palette.primary, fontSize: 15, fontWeight: '600' }}>
            {t('message.groupMembers.membersTitle', { count: displayedMembers.length })}
          </Text>
          <Ionicons name='ellipsis-vertical' size={18} color={palette.subText} />
        </View>
      )}

      <ScrollView style={{ flex: 1 }}>
        {isAdmin && (
          <View style={[styles.membersHeaderRow, { backgroundColor: palette.card, borderTopColor: palette.line }]}> 
            <Text style={{ color: palette.primary, fontSize: 15, fontWeight: '600' }}>
              {t('message.groupMembers.membersTitle', { count: displayedMembers.length })}
            </Text>
            <Ionicons name='ellipsis-vertical' size={18} color={palette.subText} />
          </View>
        )}

        <FlatList
          data={displayedMembers}
          scrollEnabled={false}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => {
            const isOwner = String(item.role || '').toUpperCase() === 'OWNER'
            const isAdminRole = String(item.role || '').toUpperCase() === 'ADMIN'
            const subtitle = isOwner
              ? t('message.groupMembers.owner')
              : isAdminRole
                ? t('message.groupMembers.admin')
                : currentUserId === item.userId
                  ? t('message.groupMembers.addedByYou')
                  : t('message.groupMembers.addedByName', { name: conversation?.members?.find((m) => m.userId === currentUserId)?.fullName || t('message.you') })

            return (
              <Pressable style={[styles.memberRow, { backgroundColor: palette.card }]} onLongPress={() => openMemberInfo(item)} delayLongPress={220}>
                <View style={{ position: 'relative' }}>
                  <UserAvatar source={item.avatar || undefined} name={item.fullName} size='xl' />
                  {isOwner && (
                    <View style={styles.ownerBadge}>
                      <Ionicons name='key-outline' size={12} color='#FACC15' />
                    </View>
                  )}
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={{ fontSize: 15, color: palette.text, fontWeight: '500' }}>
                    {currentUserId === item.userId ? t('message.you') : item.fullName}
                  </Text>
                  <Text style={{ marginTop: 1, color: palette.subText, fontSize: 12 }}>{subtitle}</Text>
                </View>
              </Pressable>
            )
          }}
        />

        {isAdmin && activeTab === 'all' && pendingRequests.length > 0 && (
          <View style={{ backgroundColor: palette.card, marginTop: 8, paddingHorizontal: 16, paddingVertical: 12 }}>
            {pendingRequests.map((req) => (
              <View key={req.id} style={[styles.requestRow, { borderBottomColor: palette.line }]}>
                <UserAvatar source={req.avatar || undefined} name={req.fullName} size='lg' />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: palette.text, fontSize: 14, fontWeight: '600' }}>{req.fullName}</Text>
                  {!!req.joinAnswer && <Text style={{ color: palette.subText, marginTop: 2 }}>{req.joinAnswer}</Text>}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: isDark ? '#2A3442' : '#EFF3F8' }]}
                      onPress={() => rejectJoin.mutate({ conversationId: conversationId || '', requestId: req.id })}
                    >
                      <Text style={{ color: palette.text, fontWeight: '700' }}>{t('message.groupMembers.reject')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#2E86FF' }]}
                      onPress={() => approveJoin.mutate({ conversationId: conversationId || '', requestId: req.id })}
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>{t('message.groupMembers.approve')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal transparent visible={memberInfoOpen} animationType='fade' onRequestClose={closeMemberInfo}>
        <Pressable style={styles.sheetOverlay} onPress={closeMemberInfo}>
          <Pressable style={[styles.memberSheet, { backgroundColor: palette.card }]} onPress={() => {}}>
            <View style={[styles.memberSheetHeader, { borderBottomColor: palette.line }]}> 
              <Text style={{ fontSize: 16, fontWeight: '700', color: palette.text }}>
                {t('message.groupMembers.memberInfoTitle', { defaultValue: 'Thông tin thành viên' })}
              </Text>
              <TouchableOpacity onPress={closeMemberInfo}>
                <Ionicons name='close' size={24} color={palette.subText} />
              </TouchableOpacity>
            </View>

            <View style={styles.memberSheetProfileRow}>
              <UserAvatar source={selectedMember?.avatar || undefined} name={selectedMember?.fullName || 'User'} size='xl' />
              <Text style={{ marginLeft: 14, flex: 1, fontSize: 15, fontWeight: '700', color: palette.text }}>
                {selectedMember?.fullName || t('message.user')}
              </Text>
              <View style={styles.memberSheetQuickActions}>
                <View style={[styles.memberSheetQuickIcon, { backgroundColor: isDark ? '#2A3442' : '#F2F4F7' }]}>
                  <Ionicons name='call-outline' size={20} color={palette.subText} />
                </View>
                <View style={[styles.memberSheetQuickIcon, { backgroundColor: isDark ? '#2A3442' : '#F2F4F7' }]}>
                  <Ionicons name='chatbubble-ellipses-outline' size={19} color={palette.subText} />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.sheetActionItem}
              activeOpacity={0.8}
              onPress={() => {
                closeMemberInfo()
                if (selectedMember?.userId) router.push(`/user-profile/${selectedMember.userId}` as any)
              }}
            >
              <Text style={{ fontSize: 14, color: palette.text }}>{t('message.groupMembers.viewProfile', { defaultValue: 'Xem trang cá nhân' })}</Text>
            </TouchableOpacity>

            {canPromote && (
              <TouchableOpacity style={styles.sheetActionItem} activeOpacity={0.8} onPress={handlePromote}>
                <Text style={{ fontSize: 14, color: palette.text }}>
                  {t('message.groupMembers.appointAdmin', { defaultValue: 'Bổ nhiệm làm phó nhóm' })}
                </Text>
              </TouchableOpacity>
            )}

            {canDemote && (
              <TouchableOpacity style={styles.sheetActionItem} activeOpacity={0.8} onPress={handleDemote}>
                <Text style={{ fontSize: 14, color: palette.text }}>
                  {t('message.groupMembers.removeAdmin', { defaultValue: 'Thu hồi phó nhóm' })}
                </Text>
              </TouchableOpacity>
            )}

            {canBlock && (
              <TouchableOpacity style={styles.sheetActionItem} activeOpacity={0.8} onPress={handleBlockMember}>
                <Text style={{ fontSize: 14, color: palette.text }}>
                  {t('message.groupMembers.blockMember', { defaultValue: 'Chặn thành viên' })}
                </Text>
              </TouchableOpacity>
            )}

            {canRemove && (
              <TouchableOpacity style={styles.sheetActionItem} activeOpacity={0.8} onPress={handleRemoveMember}>
                <Text style={{ fontSize: 14, color: '#EF4444' }}>
                  {t('message.groupMembers.removeFromGroup', { defaultValue: 'Xóa khỏi nhóm' })}
                </Text>
              </TouchableOpacity>
            )}

            <SafeAreaView edges={['bottom']} style={{ backgroundColor: palette.card }} />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={removeConfirmOpen} animationType='fade' onRequestClose={closeRemoveConfirm}>
        <Pressable style={styles.dialogOverlay} onPress={closeRemoveConfirm}>
          <Pressable style={[styles.removeDialog, { backgroundColor: isDark ? '#2B2F36' : '#FDFDFE' }]} onPress={() => {}}>
            <Text style={{ textAlign: 'center', fontSize: 20 / 1.2, fontWeight: '700', color: palette.text, paddingHorizontal: 14 }}>
              {t('message.groupMembers.removeMemberQuestion', {
                defaultValue: 'Xóa {{name}} khỏi nhóm?',
                name: selectedMember?.fullName || ''
              })}
            </Text>

            <TouchableOpacity
              style={[styles.blockCheckboxRow, { borderBottomColor: palette.line }]}
              activeOpacity={0.8}
              onPress={() => setBlockOnRemove((v) => !v)}
            >
              <Ionicons
                name={blockOnRemove ? 'checkbox-outline' : 'square-outline'}
                size={26}
                color={blockOnRemove ? '#1E7BE9' : (isDark ? '#8B96A8' : '#B0B7C3')}
                style={{ marginRight: 10 }}
              />
              <Text style={{ flex: 1, fontSize: 14, color: palette.subText }}>
                {t('message.groupMembers.blockAfterRemove', { defaultValue: 'Chặn khỏi nhóm (không thể tham gia lại)' })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dialogActionRow, { borderBottomColor: palette.line }]} activeOpacity={0.8} onPress={closeRemoveConfirm}>
              <Text style={{ fontSize: 21 / 1.2, color: '#2A8AF7', fontWeight: '500' }}>{t('message.actions.cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dialogActionRow} activeOpacity={0.8} onPress={confirmRemoveMember}>
              <Text style={{ fontSize: 21 / 1.2, color: '#EF4444', fontWeight: '500' }}>
                {t('message.groupMembers.removeFromGroup', { defaultValue: 'Xóa khỏi nhóm' })}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  headerRow: {
    height: HEADER.height,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  tabBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    width: 56
  },
  approveRow: {
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  approveIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  membersHeaderRow: {
    marginTop: 8,
    height: 46,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth
  },
  simpleTitleRow: {
    height: 46,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginTop: 8
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  ownerBadge: {
    position: 'absolute',
    right: -3,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#64748B',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  requestRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  actionBtn: {
    height: 30,
    paddingHorizontal: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'flex-end'
  },
  memberSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden'
  },
  memberSheetHeader: {
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  memberSheetProfileRow: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center'
  },
  memberSheetQuickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  memberSheetQuickIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sheetActionItem: {
    minHeight: 54,
    paddingHorizontal: 18,
    justifyContent: 'center'
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26
  },
  removeDialog: {
    width: '100%',
    borderRadius: 18,
    paddingTop: 20,
    overflow: 'hidden'
  },
  blockCheckboxRow: {
    marginTop: 14,
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  dialogActionRow: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth
  }
})
