import React, { useEffect, useMemo, useState } from 'react'
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native'
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
  useUpdateJoinQuestion,
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
  const [joinQuestionDraft, setJoinQuestionDraft] = useState('')
  const [questionModalOpen, setQuestionModalOpen] = useState(false)

  const { mutate: updateSettings } = useUpdateGroupSettings()
  const { mutate: updateJoinQuestion, isPending: isUpdatingQuestion } = useUpdateJoinQuestion()
  const joinRequestsQ = useJoinRequestsInfinite(conversationId || '', !!conversationId)
  const approveJoin = useApproveJoinRequest()
  const rejectJoin = useRejectJoinRequest()

  useEffect(() => {
    const enabled = conversation?.settings?.membershipApprovalEnabled ?? false
    setApprovalEnabled(enabled)
    setJoinQuestionDraft(conversation?.settings?.joinQuestion || '')
  }, [conversation?.settings?.membershipApprovalEnabled, conversation?.settings?.joinQuestion])

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
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, color: palette.text }}>{t('message.groupApproval.questionLabel', { defaultValue: 'Câu hỏi:' })}</Text>
            {approvalEnabled ? (
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => setQuestionModalOpen(true)}
                style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: isDark ? '#2A3340' : '#EEF2F8' }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#2996F3' }}>
                  {joinQuestionDraft.trim()
                    ? t('message.groupApproval.editQuestion', { defaultValue: 'Chỉnh sửa' })
                    : t('message.groupApproval.setupQuestion', { defaultValue: 'Thiết lập' })}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={{ marginTop: 6, fontSize: 17, color: palette.sub }}>
            {joinQuestionDraft.trim() || t('message.groupApproval.noQuestion', { defaultValue: 'Chưa có câu hỏi' })}
          </Text>
          <View style={{ marginTop: 10, height: StyleSheet.hairlineWidth, backgroundColor: palette.divider }} />
          <Text style={{ marginTop: 10, fontSize: 13, color: palette.sub }}>
            {t('message.groupApproval.questionHint', {
              defaultValue: 'Người yêu cầu tham gia nhóm này sẽ thấy câu hỏi'
            })}
          </Text>
        </View>

        <View style={[styles.requestsHeaderRow, { marginHorizontal: 12 }]}> 
          <Text style={[styles.sectionTitle, { color: palette.title, marginHorizontal: 0, marginTop: 14, marginBottom: 6 }]}>
            {t('message.groupApproval.requestsTitle', { defaultValue: 'Yêu cầu tham gia' })}
          </Text>
          {requests.length > 0 ? (
            <View style={styles.requestCountBadge}>
              <Text style={styles.requestCountText}>{requests.length}</Text>
            </View>
          ) : null}
        </View>

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
                  <View
                    style={{
                      marginTop: 6,
                      borderRadius: 10,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      backgroundColor: isDark ? '#222C3A' : '#F4F7FB'
                    }}
                  >
                    <Text style={{ color: palette.text, fontSize: 13, lineHeight: 18 }}>
                      {req.joinAnswer || t('message.groupApproval.defaultRequestText', { defaultValue: 'Yêu cầu tham gia nhóm' })}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
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
                      <Text style={{ fontSize: 13, color: palette.weakBtnText, fontWeight: '700' }}>
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
                      <Text style={{ fontSize: 13, color: '#fff', fontWeight: '700' }}>
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

      <Modal
        visible={questionModalOpen}
        transparent
        animationType='fade'
        statusBarTranslucent
        onRequestClose={() => setQuestionModalOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: 20 }}
          onPress={() => setQuestionModalOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              borderRadius: 16,
              backgroundColor: palette.card,
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 14,
              borderWidth: 1,
              borderColor: palette.divider
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '700', color: palette.text }}>
              {t('message.groupApproval.questionLabel', { defaultValue: 'Câu hỏi:' })}
            </Text>
            <Text style={{ marginTop: 8, fontSize: 13, color: palette.sub }}>
              {t('message.groupApproval.questionHint', {
                defaultValue: 'Người yêu cầu tham gia nhóm này sẽ thấy câu hỏi'
              })}
            </Text>

            <TextInput
              value={joinQuestionDraft}
              onChangeText={setJoinQuestionDraft}
              multiline
              maxLength={250}
              placeholder={t('message.groupApproval.questionPlaceholder', { defaultValue: 'Nhập câu hỏi duyệt vào nhóm...' })}
              placeholderTextColor={isDark ? '#8FA1BD' : '#9CA3AF'}
              style={{
                marginTop: 10,
                minHeight: 120,
                textAlignVertical: 'top',
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: isDark ? '#32435B' : '#D5DDE8',
                color: palette.text,
                backgroundColor: isDark ? '#172131' : '#F8FAFD'
              }}
            />

            <View style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() => setQuestionModalOpen(false)}
                style={{
                  minWidth: 90,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDark ? '#2A3340' : '#ECEFF3'
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#D2DCEC' : '#4B5563' }}>
                  {t('message.groupOptions.cancel', { defaultValue: 'Hủy' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                disabled={isUpdatingQuestion}
                onPress={() => {
                  if (!conversationId) return
                  updateJoinQuestion(
                    { conversationId, question: joinQuestionDraft.trim() },
                    {
                      onSuccess: async () => {
                        setQuestionModalOpen(false)
                        await refetchConversations()
                      },
                      onError: () => {
                        Alert.alert(
                          t('message.error', { defaultValue: 'Có lỗi xảy ra, vui lòng thử lại' })
                        )
                      }
                    }
                  )
                }}
                style={{
                  minWidth: 120,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#1E6ED8',
                  opacity: isUpdatingQuestion ? 0.6 : 1
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>
                  {t('message.groupOptions.renameSave', { defaultValue: 'Lưu' })}
                </Text>
              </TouchableOpacity>
            </View>
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
    marginHorizontal: 12
  },
  requestsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  requestCountBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginTop: 10
  },
  requestCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800'
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  actionBtn: {
    flex: 1,
    minHeight: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
