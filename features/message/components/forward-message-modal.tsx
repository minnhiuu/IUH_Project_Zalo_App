import React, { useMemo, useState } from 'react'
import { Modal, View, TouchableOpacity, TextInput, SectionList, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import type { ConversationResponse, MessageResponse } from '../schemas'
import { parseBusinessCardContent } from '../utils'

interface ForwardMessageModalProps {
  visible: boolean
  sourceMessage: MessageResponse | null
  conversations: ConversationResponse[]
  onClose: () => void
  onSubmit: (conversationIds: string[], note: string) => void
}

export function ForwardMessageModal({
  visible,
  sourceMessage,
  conversations,
  onClose,
  onSubmit
}: ForwardMessageModalProps) {
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()

  const [query, setQuery] = useState('')
  const [note, setNote] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filteredConversations = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return conversations
    return conversations.filter((c) => (c.name || '').toLowerCase().includes(keyword))
  }, [conversations, query])

  const directConversations = useMemo(() => filteredConversations.filter((c) => !c.isGroup), [filteredConversations])

  const groupConversations = useMemo(() => filteredConversations.filter((c) => c.isGroup), [filteredConversations])

  const sections = useMemo(
    () =>
      [
        {
          title: t('message.forward.recentChats', { defaultValue: 'Trò chuyện gần đây' }),
          data: directConversations.slice(0, 8)
        },
        { title: t('message.forward.groups', { defaultValue: 'Nhóm' }), data: groupConversations.slice(0, 10) }
      ].filter((s) => s.data.length > 0),
    [directConversations, groupConversations, t]
  )

  const toggleSelect = (conversationId: string) => {
    setSelectedIds((prev) =>
      prev.includes(conversationId) ? prev.filter((id) => id !== conversationId) : [...prev, conversationId]
    )
  }

  const handleClose = () => {
    setQuery('')
    setNote('')
    setSelectedIds([])
    onClose()
  }

  const handleSubmit = () => {
    if (!selectedIds.length) return
    onSubmit(selectedIds, note.trim())
    handleClose()
  }

  const sourcePreview = useMemo(() => {
    const raw = sourceMessage?.content || ''
    const card = parseBusinessCardContent(raw)
    if (card) {
      return `${t('message.quickActions.businessCard', { defaultValue: 'Danh thiếp' })}: ${card.name}`
    }
    return raw || t('message.forward.notePlaceholder', { defaultValue: 'Nhập tin nhắn' })
  }, [sourceMessage?.content, t])

  return (
    <Modal
      visible={visible}
      animationType='slide'
      onRequestClose={handleClose}
      presentationStyle='fullScreen'
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: isDark ? '#0A0D12' : '#FFFFFF' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 4,
              paddingBottom: 10,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={handleClose} style={{ paddingRight: 10 }}>
                <Ionicons name='close' size={26} color={isDark ? '#EDEFF3' : '#111827'} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 40 / 2, fontWeight: '700', color: isDark ? '#EDEFF3' : '#111827' }}>
                  {t('message.forward.title', { defaultValue: 'Chia sẻ' })}
                </Text>
                <Text style={{ fontSize: 16 * 0.95, color: colors.textSecondary, marginTop: 1 }}>
                  {t('message.forward.selectedCount', {
                    defaultValue: 'Đã chọn: {{count}}',
                    count: selectedIds.length
                  })}
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 10,
                backgroundColor: isDark ? '#171B21' : '#F3F4F6',
                borderRadius: 12,
                height: 44,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12
              }}
            >
              <Ionicons name='search-outline' size={21} color={colors.textSecondary} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('message.forward.search', { defaultValue: 'Tìm kiếm' })}
                placeholderTextColor={colors.textSecondary}
                style={{ flex: 1, marginLeft: 8, color: colors.text, fontSize: 17 }}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
              contentContainerStyle={{ paddingBottom: 12 }}
              ListHeaderComponent={
                <View>
                  <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
                    <Text style={{ fontSize: 37 / 2, fontWeight: '700', color: isDark ? '#EDEFF3' : '#111827' }}>
                      {t('message.forward.sendTo', { defaultValue: 'Gửi tới' })}
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 16, marginBottom: 10 }}>
                      {[
                        {
                          key: 'newGroup',
                          icon: 'people-outline',
                          label: t('message.forward.newGroup', { defaultValue: 'Nhóm mới' })
                        },
                        {
                          key: 'journal',
                          icon: 'time-outline',
                          label: t('message.forward.journal', { defaultValue: 'Nhật ký' })
                        },
                        {
                          key: 'otherApps',
                          icon: 'share-social-outline',
                          label: t('message.forward.otherApps', { defaultValue: 'App khác' })
                        }
                      ].map((item) => (
                        <View key={item.key} style={{ width: 110, alignItems: 'center' }}>
                          <View
                            style={{
                              width: 58,
                              height: 58,
                              borderRadius: 29,
                              backgroundColor: isDark ? '#1A2029' : '#EEF1F5',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Ionicons name={item.icon as any} size={27} color={isDark ? '#D6DBE3' : '#4B5563'} />
                          </View>
                          <Text
                            style={{ marginTop: 9, fontSize: 13, color: isDark ? '#C7CDD8' : colors.textSecondary }}
                          >
                            {item.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={{ height: 10, backgroundColor: isDark ? '#06090E' : '#F3F4F6' }} />
                </View>
              }
              renderSectionHeader={({ section }) => (
                <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
                  <Text style={{ fontSize: 17, fontWeight: '700', color: isDark ? '#EDEFF3' : '#111827' }}>
                    {section.title}
                  </Text>
                </View>
              )}
              renderItem={({ item }) => {
                const selected = selectedIds.includes(item.id)
                return (
                  <TouchableOpacity
                    activeOpacity={0.72}
                    onPress={() => toggleSelect(item.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 16,
                      paddingVertical: 11
                    }}
                  >
                    <View style={{ width: 28, alignItems: 'center', marginRight: 10 }}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: selected ? '#2A7FFF' : isDark ? '#D1D5DB' : '#9CA3AF',
                          backgroundColor: selected ? '#2A7FFF' : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {selected ? <Ionicons name='checkmark' size={13} color='#fff' /> : null}
                      </View>
                    </View>

                    <UserAvatar source={item.avatar} name={item.name || ''} size='lg' />

                    <Text
                      style={{ marginLeft: 12, flex: 1, fontSize: 16, color: isDark ? '#F3F4F6' : '#111827' }}
                      numberOfLines={1}
                    >
                      {item.name || t('message.user', { defaultValue: 'Người dùng' })}
                    </Text>
                  </TouchableOpacity>
                )
              }}
              ListFooterComponent={
                directConversations.length > 8 ? (
                  <TouchableOpacity activeOpacity={0.8} style={{ alignItems: 'center', paddingVertical: 14 }}>
                    <Text
                      style={{
                        color: isDark ? '#D1D5DB' : '#374151',
                        fontSize: 15,
                        fontWeight: '600',
                        letterSpacing: 0.3
                      }}
                    >
                      {t('message.forward.showMore', { defaultValue: 'XEM THÊM' })}
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          </View>

          <View
            style={{
              paddingHorizontal: 12,
              paddingTop: 9,
              paddingBottom: 8,
              borderTopWidth: 1,
              borderTopColor: isDark ? 'rgba(255,255,255,0.11)' : '#E5E7EB',
              backgroundColor: isDark ? '#0F1115' : '#FFFFFF'
            }}
          >
            <View
              style={{
                height: 44,
                borderRadius: 10,
                backgroundColor: isDark ? '#4A4A4A' : '#E5E7EB',
                justifyContent: 'center',
                paddingHorizontal: 12,
                marginBottom: 8
              }}
            >
              <Text style={{ color: isDark ? '#F9FAFB' : '#111827', fontSize: 13 }} numberOfLines={1}>
                {sourcePreview}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48 }}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('message.forward.notePlaceholder', { defaultValue: 'Nhập tin nhắn' })}
                placeholderTextColor={colors.textSecondary}
                style={{
                  flex: 1,
                  height: 42,
                  borderRadius: 8,
                  backgroundColor: 'transparent',
                  paddingHorizontal: 8,
                  color: colors.text,
                  fontSize: 16
                }}
              />

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!selectedIds.length}
                style={{
                  marginLeft: 10,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selectedIds.length ? '#2A7FFF' : isDark ? '#2B2F36' : '#E5E7EB'
                }}
              >
                <Ionicons name='send-sharp' size={19} color={selectedIds.length ? '#fff' : colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
