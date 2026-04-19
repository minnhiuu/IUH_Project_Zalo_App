// Helper để lấy fallback tiếng Việt cho từng giá trị time filter
function getTimeLabel(value: string, t: (k: string, d?: string) => string): string {
  switch (value) {
    case 'yesterday': return t('message.storage.yesterday', 'Yesterday')
    case 'lastWeek': return t('message.storage.lastWeek', 'Last week')
    case 'lastMonth': return t('message.storage.lastMonth', 'Last month')
    case 'custom': return t('message.storage.custom', 'Custom...')
    default: return t('message.storage.time', 'Time')
  }
}
import { useTranslation } from 'react-i18next'
import React, { useState, useMemo, useCallback } from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Linking,
  Modal,
  Pressable,
  FlatList,
  Share,
  Alert,
  Platform
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { File, Paths } from 'expo-file-system'
import { Image as ExpoImage } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { Video, ResizeMode } from 'expo-av'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Text } from '@/components/ui/text'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { HEADER } from '@/constants/theme'
import { useMediaMessages } from '@/features/message/queries/use-queries'
import { useQueryClient } from '@tanstack/react-query'
import { messageKeys } from '@/features/message/queries/keys'
import { MessageType, type MessageResponse, type ConversationResponse } from '@/features/message/schemas'
import * as WebBrowser from 'expo-web-browser'
import { normalizeDateTime } from '@/features/message/utils'
import { buildPreviewUrl } from './file-badge'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAuthStore } from '@/store'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CELL_GAP = 2
const GRID_COLS = 3
const CELL_SIZE = Math.floor((SCREEN_WIDTH - CELL_GAP * (GRID_COLS - 1)) / GRID_COLS)

type Tab = 'media' | 'files' | 'links'

type TimeFilter = 'yesterday' | 'lastWeek' | 'lastMonth' | 'custom' | null

interface FilterState {
  senderId: string | null
  timeFilter: TimeFilter
  customFrom: Date | null
  customTo: Date | null
}

function getTimeRange(tf: TimeFilter, customFrom: Date | null, customTo: Date | null): { from: Date; to: Date } | null {
  const now = new Date()
  if (tf === 'yesterday') {
    const from = new Date(now); from.setDate(from.getDate() - 1); from.setHours(0, 0, 0, 0)
    const to = new Date(from); to.setHours(23, 59, 59, 999)
    return { from, to }
  }
  if (tf === 'lastWeek') {
    const from = new Date(now); from.setDate(from.getDate() - 7); from.setHours(0, 0, 0, 0)
    return { from, to: now }
  }
  if (tf === 'lastMonth') {
    const from = new Date(now); from.setMonth(from.getMonth() - 1); from.setHours(0, 0, 0, 0)
    return { from, to: now }
  }
  if (tf === 'custom' && customFrom && customTo) {
    const to = new Date(customTo); to.setHours(23, 59, 59, 999)
    return { from: customFrom, to }
  }
  return null
}

function applyCommonFilters(messages: MessageResponse[], filter: FilterState): MessageResponse[] {
  let items = messages
  if (filter.senderId) {
    items = items.filter((m) => m.senderId === filter.senderId)
  }
  const range = getTimeRange(filter.timeFilter, filter.customFrom, filter.customTo)
  if (range) {
    items = items.filter((m) => {
      if (!m.createdAt) return false
      const d = new Date(normalizeDateTime(m.createdAt) || m.createdAt)
      return d >= range.from && d <= range.to
    })
  }
  return items
}

function useSenderOptions(conversationId: string): { label: string; name: string; value: string; avatar?: string | null; isMe?: boolean }[] {
  const queryClient = useQueryClient()
  const me = useAuthStore((s) => s.user)
  return useMemo(() => {
    const allCached = queryClient.getQueriesData<ConversationResponse[]>({ queryKey: messageKeys.conversations() })
    let conv: ConversationResponse | undefined
    for (const [, data] of allCached) {
      if (Array.isArray(data)) {
        conv = data.find((c) => c.id === conversationId)
        if (conv) break
      }
    }
    const others = (conv?.members ?? [])
      .filter((m) => m.userId !== me?.id)
      .map((m) => ({ label: m.fullName || m.userId, name: m.fullName || m.userId, value: m.userId, avatar: m.avatar, isMe: false }))
    if (!me) return others
    return [{ label: `${me.fullName} (Bạn)`, name: me.fullName, value: me.id, avatar: me.avatar ?? null, isMe: true }, ...others]
  }, [conversationId, queryClient, me])
}

const TIME_OPTIONS: { label: string; value: TimeFilter }[] = [
  { label: 'message.storage.yesterday', value: 'yesterday' },
  { label: 'message.storage.lastWeek', value: 'lastWeek' },
  { label: 'message.storage.lastMonth', value: 'lastMonth' },
  { label: 'message.storage.custom', value: 'custom' }
]

// ── DatePickerModal ──────────────────────────────────────────────
function DatePickerModal({
  visible,
  value,
  title,
  onConfirm,
  onCancel,
  minimumDate,
  maximumDate
}: {
  visible: boolean
  value: Date | null
  title: string
  onConfirm: (d: Date) => void
  onCancel: () => void
  minimumDate?: Date
  maximumDate?: Date
}) {
  const [temp, setTemp] = useState(value || new Date())

  const { t } = useTranslation()

  React.useEffect(() => {
    if (visible) setTemp(value || new Date())
  }, [visible])

  if (!visible) return null

  return (
    <Modal transparent animationType='fade' visible={visible} onRequestClose={onCancel}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={onCancel}>
        <Pressable style={{ backgroundColor: '#1C1F24', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#2A3340' }}>
            <TouchableOpacity onPress={onCancel} style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: '#8899A6' }}>{t('common.close', 'Đóng')}</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#DFE2E7' }}>{title}</Text>
            <TouchableOpacity onPress={() => onConfirm(temp)} style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 15, color: '#0068FF', fontWeight: '600' }}>{t('common.select', 'Chọn')}</Text>
            </TouchableOpacity>
          </View>
          {/* Picker */}
          <DateTimePicker
            value={temp}
            mode='date'
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            locale='vi-VN'
            minimumDate={minimumDate}
            maximumDate={maximumDate || new Date()}
            onChange={(_, d) => { if (d) setTemp(d) }}
            style={{ backgroundColor: '#1C1F24', height: 200 }}
            textColor='#DFE2E7'
          />
          <View style={{ height: 24 }} />
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function SharedFilterBar({
  conversationId,
  filter,
  setFilter,
  isDark
}: {
  conversationId: string
  filter: FilterState
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>
  isDark: boolean
}) {
  const senderOptions = useSenderOptions(conversationId)
  const [senderOpen, setSenderOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)
  // Chỉ dùng 1 modal, xác định loại bằng state
  const [datePickerType, setDatePickerType] = useState<'from' | 'to' | null>(null)

  const borderColor = isDark ? '#2A3340' : '#E2E8F0'
  const cardBg = isDark ? '#1C1F24' : '#fff'
  const chipActive = '#0068FF'
  const chipBg = isDark ? '#1E2732' : '#F1F5F9'

  const { t } = useTranslation()
  const activeSender = senderOptions.find((s) => s.value === filter.senderId)
  const activeTime = TIME_OPTIONS.find((t) => t.value === filter.timeFilter)

  const clearFilter = (key: keyof FilterState) =>
    setFilter((prev) => ({ ...prev, [key]: null, ...(key === 'timeFilter' ? { customFrom: null, customTo: null } : {}) }))

  return (
    <View style={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
      {/* Filter chips row */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {/* Sender chip */}
        {senderOptions.length > 0 && (
          <TouchableOpacity
            onPress={() => { setSenderOpen((v) => !v); setTimeOpen(false) }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: filter.senderId ? chipActive : chipBg, borderWidth: filter.senderId ? 0 : 1, borderColor }}
          >
            <Ionicons name='person-outline' size={13} color={filter.senderId ? '#fff' : (isDark ? '#B0B8C1' : '#374151')} />
            <Text style={{ fontSize: 13, color: filter.senderId ? '#fff' : (isDark ? '#B0B8C1' : '#374151') }}>
              {activeSender ? (activeSender.isMe ? t('common.me', 'Me') : activeSender.label) : t('message.storage.sender', 'Sender')}
            </Text>
            {filter.senderId
              ? <TouchableOpacity onPress={() => clearFilter('senderId')} hitSlop={8}><Ionicons name='close' size={13} color='#fff' /></TouchableOpacity>
              : <Ionicons name='chevron-down' size={12} color={isDark ? '#666' : '#94A3B8'} />}
          </TouchableOpacity>
        )}

        {/* Time chip */}
        <TouchableOpacity
          onPress={() => { setTimeOpen((v) => !v); setSenderOpen(false) }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: filter.timeFilter ? chipActive : chipBg, borderWidth: filter.timeFilter ? 0 : 1, borderColor }}
        >
          <Ionicons name='calendar-outline' size={13} color={filter.timeFilter ? '#fff' : (isDark ? '#B0B8C1' : '#374151')} />
            <Text style={{ fontSize: 13, color: filter.timeFilter ? '#fff' : (isDark ? '#B0B8C1' : '#374151') }}>
              {activeTime ? String(t(activeTime.label, getTimeLabel(activeTime.value, t))) : t('message.storage.time', 'Time')}
            </Text>
          {filter.timeFilter
            ? <TouchableOpacity onPress={() => clearFilter('timeFilter')} hitSlop={8}><Ionicons name='close' size={13} color='#fff' /></TouchableOpacity>
            : <Ionicons name='chevron-down' size={12} color={isDark ? '#666' : '#94A3B8'} />}
        </TouchableOpacity>
      </View>

      {/* Sender dropdown */}
      {senderOpen && (
        <View style={{ backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor, overflow: 'hidden' }}>
          {senderOptions.map((s) => (
            <TouchableOpacity
              key={s.value}
              onPress={() => { setFilter((prev) => ({ ...prev, senderId: s.value })); setSenderOpen(false) }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 0.5, borderBottomColor: borderColor }}
            >
              <UserAvatar source={s.avatar} name={s.name} size='sm' />
              <Text style={{ flex: 1, fontSize: 14, color: filter.senderId === s.value ? chipActive : (isDark ? '#DFE2E7' : '#111827') }}>{s.label}</Text>
              {filter.senderId === s.value && <Ionicons name='checkmark' size={16} color={chipActive} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Time dropdown */}
      {timeOpen && (
        <View style={{ backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor, overflow: 'hidden' }}>
          {TIME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                setFilter((prev) => ({ ...prev, timeFilter: opt.value, customFrom: prev.customFrom, customTo: prev.customTo }))
                if (opt.value !== 'custom') setTimeOpen(false)
              }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 0.5, borderBottomColor: borderColor }}
            >
              <Text style={{ flex: 1, fontSize: 14, color: filter.timeFilter === opt.value ? chipActive : (isDark ? '#DFE2E7' : '#111827') }}>{String(t(opt.label, getTimeLabel(opt.value, t)))}</Text>
              {filter.timeFilter === opt.value && opt.value !== 'custom' && <Ionicons name='checkmark' size={16} color={chipActive} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Custom date range */}
      {filter.timeFilter === 'custom' && (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setDatePickerType('from')}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: chipBg, borderRadius: 10, borderWidth: 1, borderColor }}
          >
            <Ionicons name='calendar-outline' size={14} color={isDark ? '#B0B8C1' : '#374151'} />
            <Text style={{ fontSize: 13, color: filter.customFrom ? (isDark ? '#DFE2E7' : '#111827') : (isDark ? '#555' : '#94A3B8') }}>
              {filter.customFrom ? filter.customFrom.toLocaleDateString('vi-VN') : t('message.storage.fromDate', 'Từ ngày')}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: isDark ? '#666' : '#94A3B8' }}>→</Text>
          <TouchableOpacity
            onPress={() => setDatePickerType('to')}
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: chipBg, borderRadius: 10, borderWidth: 1, borderColor }}
          >
            <Ionicons name='calendar-outline' size={14} color={isDark ? '#B0B8C1' : '#374151'} />
            <Text style={{ fontSize: 13, color: filter.customTo ? (isDark ? '#DFE2E7' : '#111827') : (isDark ? '#555' : '#94A3B8') }}>
              {filter.customTo ? filter.customTo.toLocaleDateString('vi-VN') : t('message.storage.toDate', 'Đến ngày')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Only one DatePickerModal rendered at a time */}
      <DatePickerModal
        visible={!!datePickerType}
        value={datePickerType === 'from' ? filter.customFrom : filter.customTo}
        title={datePickerType === 'from' ? t('message.storage.pickFrom', 'Chọn ngày bắt đầu') : t('message.storage.pickTo', 'Chọn ngày kết thúc')}
        minimumDate={datePickerType === 'to' ? filter.customFrom || undefined : undefined}
        maximumDate={datePickerType === 'from' ? filter.customTo || new Date() : new Date()}
        onConfirm={(d) => {
          if (datePickerType === 'from') setFilter((prev) => ({ ...prev, customFrom: d }))
          else if (datePickerType === 'to') setFilter((prev) => ({ ...prev, customTo: d }))
          setDatePickerType(null)
        }}
        onCancel={() => setDatePickerType(null)}
      />
    </View>
  )
}

const FILE_TYPE_FILTERS = [
  { label: 'PDF', ext: ['PDF'] },
  { label: 'Word', ext: ['DOC', 'DOCX'] },
  { label: 'PowerPoint', ext: ['PPT', 'PPTX'] },
  { label: 'Excel', ext: ['XLS', 'XLSX'] },
  { label: 'ZIP/RAR', ext: ['ZIP', 'RAR', '7Z'] }
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function groupByDate(messages: MessageResponse[]): { dateLabel: string; items: MessageResponse[] }[] {
  const map = new Map<string, MessageResponse[]>()
  for (const m of messages) {
    if (!m.createdAt) continue
    const normalized = normalizeDateTime(m.createdAt)
    if (!normalized) continue
    const d = new Date(normalized)
    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    const label = `Ngày ${day} tháng ${month}, ${year}`
    if (!map.has(label)) map.set(label, [])
    map.get(label)!.push(m)
  }
  return [...map.entries()].map(([dateLabel, items]) => ({ dateLabel, items }))
}

function getExtColor(ext: string): string {
  if (ext === 'PDF') return '#EF4444'
  if (['DOC', 'DOCX'].includes(ext)) return '#2563EB'
  if (['XLS', 'XLSX'].includes(ext)) return '#16A34A'
  if (['PPT', 'PPTX'].includes(ext)) return '#F97316'
  if (['ZIP', 'RAR', '7Z'].includes(ext)) return '#7C3AED'
  if (['MP4', 'MOV', 'AVI', 'MKV'].includes(ext)) return '#4F46E5'
  if (['MP3', 'M4A', 'WAV'].includes(ext)) return '#7C3AED'
  return '#0068FF'
}

function getExtLabel(ext: string): string {
  if (ext === 'PDF') return 'PDF'
  if (['DOC', 'DOCX'].includes(ext)) return 'WORD'
  if (['XLS', 'XLSX'].includes(ext)) return 'EXCEL'
  if (['PPT', 'PPTX'].includes(ext)) return 'PPT'
  return ext.slice(0, 4) || '?'
}

// ── Lightbox Modal ───────────────────────────────────────────────
function LightboxModal({
  items,
  index,
  onClose
}: {
  items: { url: string; isVideo: boolean }[]
  index: number | null
  onClose: () => void
}) {
  const [idx, setIdx] = useState(index ?? 0)
  React.useEffect(() => {
    if (index !== null) setIdx(index)
  }, [index])

  if (index === null) return null
  const item = items[idx]
  if (!item) return null

  return (
    <Modal visible transparent animationType='none' onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Close */}
        <Pressable style={{ position: 'absolute', top: 52, right: 16, zIndex: 10, padding: 8 }} onPress={onClose}>
          <Ionicons name='close' size={28} color='#fff' />
        </Pressable>

        {/* Prev */}
        {idx > 0 && (
          <Pressable style={{ position: 'absolute', left: 8, top: '50%', zIndex: 10, padding: 12 }} onPress={() => setIdx((i) => i - 1)}>
            <Ionicons name='chevron-back' size={32} color='rgba(255,255,255,0.8)' />
          </Pressable>
        )}

        {/* Content */}
        {item.isVideo ? (
          <Video
            source={{ uri: item.url }}
            style={{ flex: 1 }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            useNativeControls
          />
        ) : (
          <ExpoImage source={{ uri: item.url }} style={{ flex: 1 }} contentFit='contain' cachePolicy='memory-disk' />
        )}

        {/* Next */}
        {idx < items.length - 1 && (
          <Pressable style={{ position: 'absolute', right: 8, top: '50%', zIndex: 10, padding: 12 }} onPress={() => setIdx((i) => i + 1)}>
            <Ionicons name='chevron-forward' size={32} color='rgba(255,255,255,0.8)' />
          </Pressable>
        )}

        <Text style={{ position: 'absolute', bottom: 32, alignSelf: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          {idx + 1} / {items.length}
        </Text>
      </View>
    </Modal>
  )
}

// ── MediaTab ─────────────────────────────────────────────────────
function MediaTab({
  conversationId,
  isDark
}: {
  conversationId: string
  isDark: boolean
}) {
  const { data, isLoading } = useMediaMessages(conversationId, ['IMAGE', 'VIDEO'], 0, 100)
  const messages = data ?? []
  const [filter, setFilter] = useState<FilterState>({ senderId: null, timeFilter: null, customFrom: null, customTo: null })
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  const filtered = useMemo(() => applyCommonFilters(messages, filter), [messages, filter])
  const grouped = useMemo(() => groupByDate(filtered), [filtered])

  // Both images and videos go into lightbox
  const allItems = useMemo(() => {
    const result: { url: string; isVideo: boolean }[] = []
    for (const { items } of grouped) {
      for (const m of items) {
        const att = m.attachments?.[0]
        const isVideo = m.type === MessageType.VIDEO || att?.contentType?.startsWith('video/')
        if (att?.url) result.push({ url: att.url, isVideo: !!isVideo })
      }
    }
    return result
  }, [grouped])

  const urlToImageIdx = useMemo(() => {
    const map = new Map<string, number>()
    allItems.forEach((item, i) => map.set(item.url, i))
    return map
  }, [allItems])

  // Prefetch all images so lightbox opens instantly
  React.useEffect(() => {
    const urls = allItems.filter((item) => !item.isVideo).map((item) => item.url)
    if (urls.length > 0) ExpoImage.prefetch(urls)
  }, [allItems])

  const { t } = useTranslation()
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
        <ActivityIndicator color='#0068FF' />
      </View>
    )
  }

  return (
    <>
      <SharedFilterBar conversationId={conversationId} filter={filter} setFilter={setFilter} isDark={isDark} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {grouped.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Ionicons name='images-outline' size={48} color={isDark ? '#444' : '#CBD5E1'} />
            <Text style={{ color: isDark ? '#666' : '#94A3B8', marginTop: 12, fontSize: 15 }}>{t('message.storage.emptyMedia', 'Chưa có ảnh hoặc video')}</Text>
          </View>
        ) : (
          grouped.map(({ dateLabel, items }) => (
            <View key={dateLabel} style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#8899A6' : '#64748B', marginHorizontal: 12, marginBottom: 4, marginTop: 12 }}>
                {dateLabel}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {items.map((m, i) => {
                  const att = m.attachments?.[0]
                  const isVideo = m.type === MessageType.VIDEO || att?.contentType?.startsWith('video/')
                  const url = att?.url || ''
                  return (
                    <TouchableOpacity
                      key={`${m.id}-${i}`}
                      activeOpacity={0.85}
                      onPress={() => {
                        if (!url) return
                        const idx = urlToImageIdx.get(url)
                        if (idx !== undefined) setLightboxIdx(idx)
                      }}
                      style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        marginRight: (i + 1) % GRID_COLS === 0 ? 0 : CELL_GAP,
                        marginBottom: CELL_GAP
                      }}
                    >
                      {isVideo ? (
                        <View style={{ width: '100%', height: '100%', backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name='play-circle' size={40} color='rgba(255,255,255,0.85)' />
                        </View>
                      ) : (
                        <ExpoImage source={{ uri: url }} style={{ width: '100%', height: '100%' }} contentFit='cover' cachePolicy='memory-disk' />
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <LightboxModal items={allItems} index={lightboxIdx} onClose={() => setLightboxIdx(null)} />
    </>
  )
}

// ── FilesTab ─────────────────────────────────────────────────────
function FilesTab({
  conversationId,
  isDark
}: {
  conversationId: string
  isDark: boolean
}) {
  const { data, isLoading } = useMediaMessages(conversationId, ['FILE'], 0, 100)
  const messages = data ?? []

  const [fileSearch, setFileSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [typeMenuOpen, setTypeMenuOpen] = useState(false)
  const [filter, setFilter] = useState<FilterState>({ senderId: null, timeFilter: null, customFrom: null, customTo: null })

  const filtered = useMemo(() => {
    let items = applyCommonFilters(messages, filter)
    if (typeFilter) {
      items = items.filter((m) => {
        const att = m.attachments?.[0]
        const ext = (att?.originalFileName || att?.fileName || '').split('.').pop()?.toUpperCase() || ''
        return FILE_TYPE_FILTERS.find((f) => f.label === typeFilter)?.ext.includes(ext)
      })
    }
    if (fileSearch.trim()) {
      const q = fileSearch.toLowerCase()
      items = items.filter((m) => {
        const att = m.attachments?.[0]
        return (att?.originalFileName || att?.fileName || '').toLowerCase().includes(q)
      })
    }
    return items
  }, [messages, filter, typeFilter, fileSearch])

  const grouped = useMemo(() => groupByDate(filtered), [filtered])

  const inputBg = isDark ? '#1E2732' : '#F1F5F9'
  const cardBg = isDark ? '#1C1F24' : '#fff'
  const borderColor = isDark ? '#2A3340' : '#E2E8F0'

  const { t } = useTranslation()
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
        <ActivityIndicator color='#0068FF' />
      </View>
    )
  }

  return (
    <>
      <SharedFilterBar conversationId={conversationId} filter={filter} setFilter={setFilter} isDark={isDark} />
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
      {/* Search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: inputBg, borderRadius: 10, paddingHorizontal: 10, marginBottom: 10 }}>
        <Ionicons name='search-outline' size={16} color={isDark ? '#666' : '#94A3B8'} />
        <TextInput
          value={fileSearch}
          onChangeText={setFileSearch}
          placeholder={t('message.mediaStorage.searchFile', 'Tìm kiếm file...')}
          placeholderTextColor={isDark ? '#555' : '#94A3B8'}
          style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: isDark ? '#E8EAED' : '#111827' }}
        />
      </View>

      {/* Type filter */}
      <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
        <TouchableOpacity
          onPress={() => setTypeMenuOpen((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor }}
        >
          <Text style={{ fontSize: 13, color: isDark ? '#B0B8C1' : '#374151' }}>{typeFilter || t('message.mediaStorage.typeFile', 'Loại file')}</Text>
          <Ionicons name='chevron-down' size={13} color={isDark ? '#666' : '#94A3B8'} />
        </TouchableOpacity>
        {typeFilter && (
          <TouchableOpacity
            onPress={() => setTypeFilter(null)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#0068FF20' }}
          >
            <Text style={{ fontSize: 13, color: '#0068FF' }}>{typeFilter}</Text>
            <Ionicons name='close' size={13} color='#0068FF' />
          </TouchableOpacity>
        )}
      </View>

      {/* Type dropdown */}
      {typeMenuOpen && (
        <View style={{ backgroundColor: cardBg, borderRadius: 12, borderWidth: 1, borderColor, marginBottom: 12, overflow: 'hidden' }}>
          {FILE_TYPE_FILTERS.map(({ label }) => (
            <TouchableOpacity
              key={label}
              onPress={() => { setTypeFilter(typeFilter === label ? null : label); setTypeMenuOpen(false) }}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: borderColor }}
            >
              <Text style={{ flex: 1, fontSize: 14, color: typeFilter === label ? '#0068FF' : (isDark ? '#DFE2E7' : '#111827') }}>
                {label}
              </Text>
              {typeFilter === label && <Ionicons name='checkmark' size={16} color='#0068FF' />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {grouped.length === 0 ? (
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <Ionicons name='document-outline' size={48} color={isDark ? '#444' : '#CBD5E1'} />
          <Text style={{ color: isDark ? '#666' : '#94A3B8', marginTop: 12, fontSize: 15 }}>{t('message.storage.emptyFile', 'Chưa có file')}</Text>
        </View>
      ) : (
        grouped.map(({ dateLabel, items }) => (
          <View key={dateLabel} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: isDark ? '#8899A6' : '#64748B', marginBottom: 8 }}>
              {dateLabel}
            </Text>
            {items.map((m) => {
              const att = m.attachments?.[0]
              const fileName = att?.originalFileName || att?.fileName || 'File'
              const ext = fileName.split('.').pop()?.toUpperCase() || ''
              const extLower = ext.toLowerCase()
              const isArchive = ['zip', 'rar', '7z'].includes(extLower)
              const size = att?.size
              const url = att?.url || ''

              const handlePress = async () => {
                if (!url) return
                if (isArchive) {
                  try {
                    const safeFileName = fileName.replace(/[\\/:*?"<>|]/g, '_')
                    const destination = new File(Paths.cache, `${Date.now()}-${safeFileName}`)
                    const downloaded = await File.downloadFileAsync(url, destination, { idempotent: true })
                    await Share.share({ url: downloaded.uri, title: safeFileName, message: safeFileName })
                  } catch {
                    Alert.alert('Không thể tải file', 'Vui lòng thử lại sau.')
                  }
                } else {
                  WebBrowser.openBrowserAsync(buildPreviewUrl(url, extLower))
                }
              }

              return (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.7}
                  onPress={handlePress}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: cardBg, borderRadius: 10, marginBottom: 8 }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: getExtColor(ext), alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.5 }}>{getExtLabel(ext)}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '500', color: isDark ? '#DFE2E7' : '#111827' }}>
                      {fileName}
                    </Text>
                    <Text style={{ fontSize: 12, color: isDark ? '#666' : '#94A3B8', marginTop: 2 }}>
                      {size ? formatFileSize(size) : ''}{size && m.createdAt ? ' · ' : ''}{m.createdAt ? formatDate(normalizeDateTime(m.createdAt) || m.createdAt) : ''}
                    </Text>
                  </View>
                  <Ionicons name='download-outline' size={20} color={isDark ? '#666' : '#94A3B8'} />
                </TouchableOpacity>
              )
            })}
          </View>
        ))
      )}
    </ScrollView>
    </>
  )
}

// ── LinksTab ─────────────────────────────────────────────────────
function LinksTab({
  conversationId,
  isDark
}: {
  conversationId: string
  isDark: boolean
}) {
  const { data, isLoading } = useMediaMessages(conversationId, ['LINK'], 0, 100)
  const messages = data ?? []
  const [filter, setFilter] = useState<FilterState>({ senderId: null, timeFilter: null, customFrom: null, customTo: null })
  const filtered = useMemo(() => applyCommonFilters(messages, filter), [messages, filter])

  const cardBg = isDark ? '#1C1F24' : '#fff'
  const borderColor = isDark ? '#2A3340' : '#E2E8F0'

  const { t } = useTranslation()
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
        <ActivityIndicator color='#0068FF' />
      </View>
    )
  }

  return (
    <>
      <SharedFilterBar conversationId={conversationId} filter={filter} setFilter={setFilter} isDark={isDark} />
      {filtered.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
          <Ionicons name='link-outline' size={48} color={isDark ? '#444' : '#CBD5E1'} />
          <Text style={{ color: isDark ? '#666' : '#94A3B8', marginTop: 12, fontSize: 15 }}>{t('message.storage.emptyLink', 'Chưa có liên kết')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 24 }}>
          {filtered.map((m) => {
            const url = m.content || ''
            let domain = url
            try { domain = new URL(url).hostname } catch {}
            return (
              <TouchableOpacity
                key={m.id}
                activeOpacity={0.7}
                onPress={() => url && Linking.openURL(url)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 12, backgroundColor: cardBg, borderRadius: 10, marginBottom: 8, borderWidth: 0.5, borderColor }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: '#0068FF20', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name='link' size={20} color='#0068FF' />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, color: '#0068FF', fontWeight: '500' }}>{domain}</Text>
                  <Text numberOfLines={2} style={{ fontSize: 12, color: isDark ? '#8899A6' : '#64748B', marginTop: 2 }}>{url}</Text>
                </View>
                <Ionicons name='open-outline' size={18} color={isDark ? '#666' : '#94A3B8'} />
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}
    </>
  )
}

// ── Main Screen ──────────────────────────────────────────────────
const TABS: { key: Tab; label: string }[] = [
  { key: 'media', label: 'message.storage.tabMedia' },
  { key: 'files', label: 'message.storage.tabFiles' },
  { key: 'links', label: 'message.storage.tabLinks' }
]

export default function MediaStorageScreen() {
  const router = useRouter()
  const { conversationId, name } = useLocalSearchParams<{ conversationId: string; name?: string }>()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'
  const [tab, setTab] = useState<Tab>('media')
  const { t } = useTranslation()

  const headerGradient = isDark ? HEADER.gradientColorsDark : HEADER.gradientColors
  const tabBg = isDark ? '#151A20' : '#fff'
  const activeColor = '#0068FF'
  const inactiveColor = isDark ? '#6B7280' : '#9CA3AF'

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0D1117' : '#F3F4F6' }}>
      {/* Header */}
      <LinearGradient colors={headerGradient}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: HEADER.paddingHorizontal, height: HEADER.height }}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ paddingRight: 10 }}>
              <Ionicons name='chevron-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', color: '#fff' }} numberOfLines={1}>
              {t('message.storage.title', 'Kho lưu trữ')}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: tabBg, borderBottomWidth: 1, borderBottomColor: isDark ? '#1F2937' : '#E5E7EB' }}>
        {TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setTab(key)}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 13 }}
          >
            <Text style={{ fontSize: 14, fontWeight: tab === key ? '600' : '400', color: tab === key ? activeColor : inactiveColor }}>
              {t(label)}
            </Text>
            {tab === key && (
              <View style={{ position: 'absolute', bottom: 0, left: 12, right: 12, height: 2, backgroundColor: activeColor, borderRadius: 2 }} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {!conversationId ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: isDark ? '#666' : '#94A3B8' }}>{t('message.storage.notFound', 'Không tìm thấy cuộc trò chuyện')}</Text>
          </View>
        ) : tab === 'media' ? (
          <MediaTab conversationId={conversationId} isDark={isDark} />
        ) : tab === 'files' ? (
          <FilesTab conversationId={conversationId} isDark={isDark} />
        ) : (
          <LinksTab conversationId={conversationId} isDark={isDark} />
        )}
      </View>
    </View>
  )
}
