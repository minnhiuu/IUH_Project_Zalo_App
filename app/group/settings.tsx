import React, { useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import Toast from 'react-native-toast-message'

import { HEADER } from '@/constants/theme'
import { useTheme } from '@/context/theme-context'
import { Text } from '@/components/ui/text'
import { useConversations, useDisbandGroup, useUpdateGroupSettings } from '@/features/message/queries'
import { useAuthStore } from '@/store'

function Row({
  label,
  subLabel,
  onPress,
  rightNode,
  noMinHeight,
  palette
}: {
  label: string
  subLabel?: string
  onPress?: () => void
  rightNode?: React.ReactNode
  noMinHeight?: boolean
  palette: {
    card: string
    text: string
    subText: string
    divider: string
  }
}) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={[styles.row, noMinHeight && styles.rowNoMinHeight, { backgroundColor: palette.card, borderBottomColor: palette.divider }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: palette.text, fontSize: 17 }}>{label}</Text>
        {subLabel ? <Text style={{ marginTop: 2, color: palette.subText, fontSize: 13 }}>{subLabel}</Text> : null}
      </View>
      {rightNode ?? <Ionicons name='chevron-forward' size={17} color={palette.subText} />}
    </TouchableOpacity>
  )
}

function SwitchRow({
  label,
  value,
  onValueChange,
  palette
}: {
  label: string
  value: boolean
  onValueChange: (next: boolean) => void
  palette: {
    card: string
    text: string
    divider: string
  }
}) {
  return (
    <View style={[styles.switchRow, { backgroundColor: palette.card, borderBottomColor: palette.divider }]}>
      <Text style={{ color: palette.text, fontSize: 17, lineHeight: 24, flex: 1, paddingRight: 14 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#CBD5E1', true: '#2996F3' }} thumbColor='#fff' />
    </View>
  )
}

export default function GroupSettingsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { conversationId } = useLocalSearchParams<{ conversationId: string | string[]; name?: string }>()
  const resolvedConversationId = Array.isArray(conversationId) ? conversationId[0] : conversationId
  const { isDark } = useTheme()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const { data: conversations = [] } = useConversations(0, 100, true)
  const { mutate: updateSettings } = useUpdateGroupSettings()
  const { mutate: disbandGroup } = useDisbandGroup()

  const activeConversation = conversations.find((c) => c.id === resolvedConversationId)
  const roleValue = activeConversation?.members?.find((m) => m.userId === currentUserId)?.role
  const myRole = roleValue ? String(roleValue).toUpperCase() : null
  const isExplicitMember = myRole === 'MEMBER'
  const isOwner = myRole === 'OWNER'

  type PermissionKey =
    | 'memberCanChangeInfo'
    | 'memberCanCreateNotes'
    | 'memberCanCreatePolls'
    | 'memberCanPinMessages'
    | 'memberCanSendMessages'

  const [highlightOnlyAdmin, setHighlightOnlyAdmin] = useState(true)
  const [newMemberCanViewRecent, setNewMemberCanViewRecent] = useState(true)
  const [membershipApprovalEnabled, setMembershipApprovalEnabled] = useState(false)
  const [memberCanChangeInfo, setMemberCanChangeInfo] = useState(true)
  const [memberCanCreateNotes, setMemberCanCreateNotes] = useState(true)
  const [memberCanCreatePolls, setMemberCanCreatePolls] = useState(true)
  const [memberCanPinMessages, setMemberCanPinMessages] = useState(true)
  const [memberCanSendMessages, setMemberCanSendMessages] = useState(true)
  const [permissionSheetKey, setPermissionSheetKey] = useState<PermissionKey | null>(null)

  useEffect(() => {
    const s = activeConversation?.settings
    if (!s) return
    setHighlightOnlyAdmin(s.highlightAdminMessages ?? true)
    setNewMemberCanViewRecent(s.newMembersCanReadRecent ?? true)
    setMembershipApprovalEnabled(s.membershipApprovalEnabled ?? false)
    setMemberCanChangeInfo(s.memberCanChangeInfo ?? true)
    setMemberCanCreateNotes(s.memberCanCreateNotes ?? true)
    setMemberCanCreatePolls(s.memberCanCreatePolls ?? true)
    setMemberCanPinMessages(s.memberCanPinMessages ?? true)
    setMemberCanSendMessages(s.memberCanSendMessages ?? true)
  }, [activeConversation?.settings])

  const onUpdateSetting = (settings: Record<string, unknown>) => {
    if (isExplicitMember) return false
    if (!resolvedConversationId) return
    updateSettings({ conversationId: resolvedConversationId, settings })
    return true
  }

  const permissionLabel = useMemo(
    () => (allowed: boolean) =>
      allowed ? t('message.groupSettings.permissionAll') : t('message.groupSettings.permissionManagersOnly'),
    [t]
  )

  const permissionSheetTitle = useMemo(() => {
    switch (permissionSheetKey) {
      case 'memberCanChangeInfo':
        return t('message.groupSettings.permissionEditInfo')
      case 'memberCanCreateNotes':
        return t('message.groupSettings.permissionCreateNotes')
      case 'memberCanCreatePolls':
        return t('message.groupSettings.permissionCreatePolls')
      case 'memberCanPinMessages':
        return t('message.groupSettings.permissionPinMessages')
      case 'memberCanSendMessages':
        return t('message.groupSettings.permissionSendMessages')
      default:
        return ''
    }
  }, [permissionSheetKey, t])

  const permissionCurrentValue = useMemo(() => {
    switch (permissionSheetKey) {
      case 'memberCanChangeInfo':
        return memberCanChangeInfo
      case 'memberCanCreateNotes':
        return memberCanCreateNotes
      case 'memberCanCreatePolls':
        return memberCanCreatePolls
      case 'memberCanPinMessages':
        return memberCanPinMessages
      case 'memberCanSendMessages':
        return memberCanSendMessages
      default:
        return true
    }
  }, [permissionSheetKey, memberCanChangeInfo, memberCanCreateNotes, memberCanCreatePolls, memberCanPinMessages, memberCanSendMessages])

  const applyPermissionSelection = (allowAll: boolean) => {
    if (!permissionSheetKey) return

    if (permissionSheetKey === 'memberCanChangeInfo') setMemberCanChangeInfo(allowAll)
    if (permissionSheetKey === 'memberCanCreateNotes') setMemberCanCreateNotes(allowAll)
    if (permissionSheetKey === 'memberCanCreatePolls') setMemberCanCreatePolls(allowAll)
    if (permissionSheetKey === 'memberCanPinMessages') setMemberCanPinMessages(allowAll)
    if (permissionSheetKey === 'memberCanSendMessages') setMemberCanSendMessages(allowAll)

    onUpdateSetting({ [permissionSheetKey]: allowAll })
    setPermissionSheetKey(null)
  }

  const palette = isDark
    ? {
        bg: '#0F141A',
        sectionBg: '#161D25',
        card: '#1A222D',
        title: '#52A8FF',
        text: '#EAF1FC',
        subText: '#9FB0C8',
        divider: 'rgba(255,255,255,0.08)',
        danger: '#FF6B6B'
      }
    : {
        bg: '#F1F2F4',
        sectionBg: '#ECEDEF',
        card: '#FFFFFF',
        title: '#2F89E1',
        text: '#1D2433',
        subText: '#7F8B9B',
        divider: '#E8EBF0',
        danger: '#E14B4B'
      }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <LinearGradient colors={isDark ? HEADER.gradientColorsDark : HEADER.gradientColors}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 10 }}>
              <Ionicons name='chevron-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('message.groupOptions.groupSettings')}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {!isExplicitMember ? (
          <>
            <Text style={[styles.sectionTitle, { color: palette.title }]}>{t('message.groupSettings.messageSetup')}</Text>
            <View style={{ backgroundColor: palette.card }}>
              <SwitchRow
                label={t('message.groupSettings.highlightFromManagers')}
                value={highlightOnlyAdmin}
                onValueChange={(v) => {
                  setHighlightOnlyAdmin(v)
                  onUpdateSetting({ highlightAdminMessages: v })
                }}
                palette={palette}
              />
              <SwitchRow
                label={t('message.groupSettings.newMembersCanReadRecent')}
                value={newMemberCanViewRecent}
                onValueChange={(v) => {
                  setNewMemberCanViewRecent(v)
                  onUpdateSetting({ newMembersCanReadRecent: v })
                }}
                palette={palette}
              />
            </View>

            <Text style={[styles.sectionTitle, { color: palette.title }]}>{t('message.groupSettings.memberSection')}</Text>
            <View style={{ backgroundColor: palette.card }}>
              <Row
                label={t('message.groupSettings.manageMembers')}
                palette={palette}
                onPress={() => {
                  if (!resolvedConversationId) return
                  router.push({ pathname: '/group/members' as any, params: { conversationId: resolvedConversationId } })
                }}
              />
              <Row
                label={t('message.groupSettings.approveMembers')}
                subLabel={membershipApprovalEnabled ? t('message.groupSettings.approveStatusOn') : t('message.groupSettings.approveStatusOff')}
                palette={palette}
                onPress={() => {
                  const next = !membershipApprovalEnabled
                  setMembershipApprovalEnabled(next)
                  onUpdateSetting({ membershipApprovalEnabled: next })
                }}
              />
              {isOwner ? (
                <Row
                  label={t('message.groupSettings.transferOwnership')}
                  palette={palette}
                  onPress={() => {
                    if (!resolvedConversationId) return
                    const candidateCount = (activeConversation?.members || []).filter((m) => m.userId !== currentUserId).length
                    if (candidateCount <= 0) {
                      Toast.show({ type: 'info', text1: t('message.groupSettings.noTransferCandidate') })
                      return
                    }
                    router.push({
                      pathname: '/group/transfer-owner' as any,
                      params: {
                        conversationId: resolvedConversationId,
                        name: activeConversation?.name || ''
                      }
                    })
                  }}
                />
              ) : null}
            </View>

            <Text style={[styles.sectionTitle, { color: palette.title }]}>{t('message.groupSettings.memberPermissions')}</Text>
            <View style={{ backgroundColor: palette.card }}>
              <Row
                label={t('message.groupSettings.permissionEditInfo')}
                subLabel={permissionLabel(memberCanChangeInfo)}
                palette={palette}
                onPress={() => setPermissionSheetKey('memberCanChangeInfo')}
              />
              <Row
                label={t('message.groupSettings.permissionCreateNotes')}
                subLabel={permissionLabel(memberCanCreateNotes)}
                palette={palette}
                onPress={() => setPermissionSheetKey('memberCanCreateNotes')}
              />
              <Row
                label={t('message.groupSettings.permissionCreatePolls')}
                subLabel={permissionLabel(memberCanCreatePolls)}
                palette={palette}
                onPress={() => setPermissionSheetKey('memberCanCreatePolls')}
              />
              <Row
                label={t('message.groupSettings.permissionPinMessages')}
                subLabel={permissionLabel(memberCanPinMessages)}
                palette={palette}
                onPress={() => setPermissionSheetKey('memberCanPinMessages')}
              />
              <Row
                label={t('message.groupSettings.permissionSendMessages')}
                subLabel={permissionLabel(memberCanSendMessages)}
                palette={palette}
                onPress={() => setPermissionSheetKey('memberCanSendMessages')}
              />
            </View>

            {isOwner ? (
        <View style={{ backgroundColor: palette.card, marginTop: 12 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.row, { borderBottomWidth: 0, borderBottomColor: 'transparent' }]}
            onPress={() => {
              if (!resolvedConversationId) return
              disbandGroup(resolvedConversationId, {
                onSuccess: () => {
                  Toast.show({ type: 'success', text1: t('message.groupSettings.disbandSuccess') })
                  router.replace('/(tabs)' as any)
                }
              })
            }}
          >
            <Text style={{ color: palette.danger, fontSize: 17 }}>{t('message.groupSettings.disbandGroup')}</Text>
          </TouchableOpacity>
        </View>
            ) : null}
          </>
        ) : (
          <View style={{ marginTop: 12, marginHorizontal: 12, borderRadius: 10, padding: 14, backgroundColor: palette.card }}>
            <Text style={{ color: palette.subText, fontSize: 14 }}>{t('message.groupSettings.memberHiddenNotice')}</Text>
          </View>
        )}
      </ScrollView>

      <Modal transparent visible={!!permissionSheetKey} animationType='fade' onRequestClose={() => setPermissionSheetKey(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' }} onPress={() => setPermissionSheetKey(null)}>
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: palette.card,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              paddingTop: 8,
              paddingBottom: 20
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <View style={{ width: 44, height: 5, borderRadius: 999, backgroundColor: palette.subText + '55' }} />
            </View>
            <Text style={{ fontSize: 21 / 1.2, fontWeight: '700', color: palette.text, textAlign: 'center', marginBottom: 8 }}>
              {permissionSheetTitle}
            </Text>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => applyPermissionSelection(true)}
              style={{
                minHeight: 64,
                paddingHorizontal: 18,
                flexDirection: 'row',
                alignItems: 'center',
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: palette.divider
              }}
            >
              <Text style={{ flex: 1, color: palette.text, fontSize: 18 }}>{t('message.groupSettings.permissionAll')}</Text>
              {permissionCurrentValue ? <Ionicons name='checkmark' size={22} color='#2087F5' /> : null}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => applyPermissionSelection(false)}
              style={{
                minHeight: 64,
                paddingHorizontal: 18,
                flexDirection: 'row',
                alignItems: 'center',
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: palette.divider
              }}
            >
              <Text style={{ flex: 1, color: palette.text, fontSize: 18 }}>{t('message.groupSettings.permissionManagersOnly')}</Text>
              {!permissionCurrentValue ? <Ionicons name='checkmark' size={22} color='#2087F5' /> : null}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: palette.bg }} />
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
    marginHorizontal: 12
  },
  row: {
    minHeight: 66,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  rowNoMinHeight: {
    minHeight: 0,
    paddingVertical: 12,
    alignItems: 'flex-start'
  },
  switchRow: {
    minHeight: 66,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth
  }
})
