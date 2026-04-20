import React, { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { HEADER } from '@/constants/theme'
import { useTheme } from '@/context'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAuthStore } from '@/store'
import {
  useApproveJoinRequest,
  useConversations,
  useJoinRequestsInfinite,
  useRejectJoinRequest,
  useUpdateGroupSettings
} from '@/features/message/queries'

export default function GroupApprovalScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isDark } = useTheme()
  const { conversationId, canManage } = useLocalSearchParams<{ conversationId: string; canManage?: string }>()
  const currentUserId = useAuthStore((s) => s.user?.id)

  const { data: convs = [], refetch: refetchConversations } = useConversations(0, 100, true)
  const conversation = convs.find((c) => c.id === conversationId)
  const myRole = String(conversation?.members?.find((m) => m.userId === currentUserId)?.role || 'MEMBER').toUpperCase()
  const canManageByRole = myRole === 'OWNER' || myRole === 'ADMIN'
  const canManageGroup = canManage === 'true' ? true : canManageByRole

  const [approvalEnabled, setApprovalEnabled] = useState(false)

  const { mutate: updateSettings } = useUpdateGroupSettings()
  const joinRequestsQ = useJoinRequestsInfinite(conversationId || '', !!conversationId)
  const approveJoin = useApproveJoinRequest()
  const rejectJoin = useRejectJoinRequest()

  useEffect(() => {
    const enabled = conversation?.settings?.membershipApprovalEnabled ?? false
    setApprovalEnabled(enabled)
  }, [conversation?.settings?.membershipApprovalEnabled])

  useFocusEffect(
    React.useCallback(() => {
      if (!conversationId) return
      refetchConversations()
      joinRequestsQ.refetch()
    }, [conversationId, refetchConversations, joinRequestsQ])
  )

  const requests = useMemo(
    () =>
      joinRequestsQ.data?.pages.flatMap((p: any) => {
        if (Array.isArray(p)) return p
        return p?.data || p?.content || []
      }) || [],
    [joinRequestsQ.data]
  )

  const palette = isDark
    ? {
        bg: '#0F141A',
        card: '#1A222D',
        section: '#161D25',
        text: '#EAF1FC',
        sub: '#9FB0C8',
        title: '#52A8FF',
        divider: 'rgba(255,255,255,0.08)',
        weakBtn: '#2B3441',
        weakBtnText: '#D4DEEC'
      }
    : {
        bg: '#F1F2F4',
        card: '#FFFFFF',
        section: '#ECEDEF',
        text: '#1D2433',
        sub: '#7F8B9B',
        title: '#2F89E1',
        divider: '#E8EBF0',
        weakBtn: '#EEF0F5',
        weakBtnText: '#5B6676'
      }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <LinearGradient colors={isDark ? HEADER.gradientColorsDark : HEADER.gradientColors}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 10 }}>
              <Ionicons name='chevron-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('message.groupApproval.title', { defaultValue: 'Duyệt thành viên' })}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 22 }}>
        <Text style={[styles.sectionTitle, { color: palette.title }]}>{t('message.groupApproval.settingsTitle', { defaultValue: 'Cài đặt' })}</Text>

        <View style={{ backgroundColor: palette.card }}>
          <View style={[styles.approvalSettingRow, { borderBottomColor: palette.divider }]}> 
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={{ fontSize: 17, color: palette.text, marginBottom: 2 }}>
                {t('message.groupApproval.toggleTitle', { defaultValue: 'Duyệt thành viên' })}
              </Text>
              <Text style={{ fontSize: 13, color: palette.sub, lineHeight: 18 }}>
                {t('message.groupApproval.toggleDesc', {
                  defaultValue: 'Khi bật, yêu cầu tham gia phải được duyệt bởi trưởng hoặc phó nhóm'
                })}
              </Text>
            </View>
            <Switch
              value={approvalEnabled}
              onValueChange={(next) => {
                setApprovalEnabled(next)
                if (!conversationId) return
                updateSettings({ conversationId, settings: { membershipApprovalEnabled: next } })
              }}
              trackColor={{ false: '#CBD5E1', true: '#2996F3' }}
              thumbColor='#fff'
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: palette.title }]}>{t('message.groupApproval.optionsTitle', { defaultValue: 'Tùy chọn xét duyệt' })}</Text>
        <View style={{ backgroundColor: palette.card, paddingHorizontal: 16, paddingVertical: 14 }}>
          <Text style={{ fontSize: 16, color: palette.text }}>{t('message.groupApproval.questionLabel', { defaultValue: 'Câu hỏi:' })}</Text>
          <Text style={{ marginTop: 6, fontSize: 17, color: palette.sub }}>
            {t('message.groupApproval.noQuestion', { defaultValue: 'Chưa có câu hỏi' })}
          </Text>
          <View style={{ marginTop: 10, height: StyleSheet.hairlineWidth, backgroundColor: palette.divider }} />
          <Text style={{ marginTop: 10, fontSize: 13, color: palette.sub }}>
            {t('message.groupApproval.questionHint', {
              defaultValue: 'Người yêu cầu tham gia nhóm này sẽ thấy câu hỏi'
            })}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: palette.title }]}>
          {t('message.groupApproval.requestsTitle', { defaultValue: 'Yêu cầu tham gia' })} ({requests.length})
        </Text>

        <View style={{ backgroundColor: palette.card }}>
          {joinRequestsQ.isLoading ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
              <Text style={{ color: palette.sub }}>{t('message.loading', { defaultValue: 'Đang tải...' })}</Text>
            </View>
          ) : joinRequestsQ.isError ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
              <Text style={{ color: palette.sub }}>
                {t('message.error', { defaultValue: 'Có lỗi xảy ra, vui lòng thử lại' })}
              </Text>
            </View>
          ) : requests.length === 0 ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
              <Text style={{ color: palette.sub }}>{t('message.groupApproval.emptyRequests', { defaultValue: 'Chưa có yêu cầu tham gia' })}</Text>
            </View>
          ) : (
            requests.map((req) => (
              <View key={req.id} style={[styles.requestRow, { borderBottomColor: palette.divider }]}> 
                <UserAvatar source={req.avatar || undefined} name={req.fullName} size='xl' />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: palette.text, fontSize: 16, fontWeight: '500' }}>{req.fullName}</Text>
                  <Text style={{ marginTop: 2, color: palette.sub, fontSize: 13 }}>
                    {req.joinAnswer || t('message.groupApproval.defaultRequestText', { defaultValue: 'Yêu cầu tham gia nhóm' })}
                  </Text>
                  <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.actionBtn, { backgroundColor: palette.weakBtn }]}
                      onPress={() =>
                        rejectJoin.mutate(
                          { conversationId: conversationId || '', requestId: req.id },
                          { onSuccess: () => joinRequestsQ.refetch() }
                        )
                      }
                    >
                      <Text style={{ fontSize: 18 / 1.2, color: palette.weakBtnText, fontWeight: '600' }}>
                        {t('message.groupMembers.reject')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.actionBtn, { backgroundColor: '#2996F3' }]}
                      onPress={() =>
                        approveJoin.mutate(
                          { conversationId: conversationId || '', requestId: req.id },
                          { onSuccess: () => joinRequestsQ.refetch() }
                        )
                      }
                    >
                      <Text style={{ fontSize: 18 / 1.2, color: '#fff', fontWeight: '600' }}>
                        {t('message.groupMembers.approve')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  approvalSettingRow: {
    minHeight: 92,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  requestRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  actionBtn: {
    flex: 1,
    minHeight: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
