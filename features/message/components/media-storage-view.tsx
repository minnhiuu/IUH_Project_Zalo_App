import React, { useState } from 'react'
import {
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
  Linking
} from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { useTranslation } from 'react-i18next'
import { useMediaMessages } from '../queries'
import { MessageType, type MessageResponse, type AttachmentInfo } from '../schemas'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const GRID_COLUMNS = 3
const GRID_ITEM_SIZE = SCREEN_WIDTH / GRID_COLUMNS

interface MediaStorageViewProps {
  conversationId: string
}

type Tab = 'media' | 'files' | 'links'

export function MediaStorageView({ conversationId }: MediaStorageViewProps) {
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'

  const [activeTab, setActiveTab] = useState<Tab>('media')
  const [lightboxUri, setLightboxUri] = useState<string | null>(null)
  const [lightboxIsVideo, setLightboxIsVideo] = useState(false)

  const { data: mediaMessages = [], isLoading: loadingMedia } = useMediaMessages(
    conversationId,
    ['IMAGE', 'VIDEO'],
    0,
    100,
    activeTab === 'media'
  )

  const { data: fileMessages = [], isLoading: loadingFiles } = useMediaMessages(
    conversationId,
    ['FILE'],
    0,
    100,
    activeTab === 'files'
  )

  const { data: linkMessages = [], isLoading: loadingLinks } = useMediaMessages(
    conversationId,
    ['LINK'],
    0,
    100,
    activeTab === 'links'
  )

  // Flatten attachments from messages
  const mediaAttachments: Array<{ att: AttachmentInfo; type: MessageType }> = mediaMessages.flatMap((msg) =>
    (msg.attachments || []).map((att) => ({ att, type: msg.type }))
  )

  const fileAttachments: Array<AttachmentInfo> = fileMessages.flatMap((msg) => msg.attachments || [])

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'media', label: t('message.storage.tabMedia', { defaultValue: 'Ảnh/Video' }) },
    { key: 'files', label: t('message.storage.tabFiles', { defaultValue: 'Tệp' }) },
    { key: 'links', label: t('message.storage.tabLinks', { defaultValue: 'Liên kết' }) }
  ]

  const openLightbox = (uri: string, isVideo: boolean) => {
    setLightboxUri(uri)
    setLightboxIsVideo(isVideo)
  }

  const getFileBadgeColor = (fileName: string) => {
    const ext = (fileName.split('.').pop() || '').toLowerCase()
    if (['doc', 'docx'].includes(ext)) return '#2563EB'
    if (['xls', 'xlsx'].includes(ext)) return '#16A34A'
    if (['ppt', 'pptx'].includes(ext)) return '#EA580C'
    if (ext === 'pdf') return '#DC2626'
    return '#6B7280'
  }

  const getFileBadgeLabel = (fileName: string) => {
    const ext = (fileName.split('.').pop() || '').toUpperCase()
    if (!ext) return 'FILE'
    const map: Record<string, string> = { DOC: 'WORD', DOCX: 'WORD', XLS: 'EXCEL', XLSX: 'EXCEL', PPT: 'PPT', PPTX: 'PPT' }
    return map[ext] || ext
  }

  const renderMediaItem = ({ item }: { item: { att: AttachmentInfo; type: MessageType } }) => {
    const isVideo = item.type === MessageType.VIDEO
    return (
      <TouchableOpacity
        onPress={() => openLightbox(item.att.url, isVideo)}
        activeOpacity={0.8}
        style={{ width: GRID_ITEM_SIZE, height: GRID_ITEM_SIZE }}
      >
        <Image
          source={{ uri: item.att.url }}
          style={{ width: '100%', height: '100%' }}
          resizeMode='cover'
        />
        {isVideo && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}
          >
            <Ionicons name='play-circle' size={36} color='#fff' />
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const renderFileItem = ({ item }: { item: AttachmentInfo }) => {
    const fileName = item.originalFileName || item.fileName || 'file'
    const sizeMB = item.size ? (item.size / 1024 / 1024).toFixed(2) + ' MB' : ''
    const badgeColor = getFileBadgeColor(fileName)
    const badgeLabel = getFileBadgeLabel(fileName)

    return (
      <TouchableOpacity
        onPress={() => item.url && Linking.openURL(item.url)}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
          gap: 12
        }}
      >
        <View
          style={{
            width: 44,
            height: 48,
            borderRadius: 6,
            backgroundColor: badgeColor,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{badgeLabel}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 14, fontWeight: '500', color: colors.text }}
            numberOfLines={2}
          >
            {fileName}
          </Text>
          {!!sizeMB && (
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{sizeMB}</Text>
          )}
        </View>
        <Ionicons name='download-outline' size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    )
  }

  const renderLinkItem = ({ item: msg }: { item: MessageResponse }) => {
    return (
      <TouchableOpacity
        onPress={() => msg.content && Linking.openURL(msg.content)}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border,
          gap: 12
        }}
      >
        <Ionicons name='link-outline' size={22} color='#2563EB' />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, color: '#2563EB' }} numberOfLines={2}>
            {msg.content}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  const isLoading = activeTab === 'media' ? loadingMedia : activeTab === 'files' ? loadingFiles : loadingLinks

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0D1117' : '#F3F4F6' }}>
      {/* Tab bar */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: isDark ? '#15181D' : '#fff',
          borderBottomWidth: 0.5,
          borderBottomColor: colors.border
        }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.key ? '#0068FF' : 'transparent'
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: activeTab === tab.key ? '600' : '400',
                color: activeTab === tab.key ? '#0068FF' : colors.textSecondary
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size='large' color='#0068FF' />
        </View>
      ) : activeTab === 'media' ? (
        mediaAttachments.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='images-outline' size={48} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
              {t('message.storage.noMedia', { defaultValue: 'Chưa có ảnh/video' })}
            </Text>
          </View>
        ) : (
          <FlatList
            data={mediaAttachments}
            keyExtractor={(item, i) => item.att.key || String(i)}
            renderItem={renderMediaItem}
            numColumns={GRID_COLUMNS}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : activeTab === 'files' ? (
        fileAttachments.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='document-outline' size={48} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
              {t('message.storage.noFiles', { defaultValue: 'Chưa có tệp nào' })}
            </Text>
          </View>
        ) : (
          <FlatList
            data={fileAttachments}
            keyExtractor={(item, i) => item.key || String(i)}
            renderItem={renderFileItem}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: isDark ? '#15181D' : '#fff' }}
          />
        )
      ) : (
        // Links tab
        linkMessages.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='link-outline' size={48} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
              {t('message.storage.noLinks', { defaultValue: 'Chưa có liên kết nào' })}
            </Text>
          </View>
        ) : (
          <FlatList
            data={linkMessages}
            keyExtractor={(item, i) => item.id || String(i)}
            renderItem={renderLinkItem}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: isDark ? '#15181D' : '#fff' }}
          />
        )
      )}

      {/* Lightbox modal */}
      <Modal
        visible={!!lightboxUri}
        transparent
        statusBarTranslucent
        animationType='fade'
        onRequestClose={() => setLightboxUri(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity
            onPress={() => setLightboxUri(null)}
            style={{ position: 'absolute', top: 48, right: 16, zIndex: 10, padding: 8 }}
          >
            <Ionicons name='close' size={28} color='#fff' />
          </TouchableOpacity>
          {lightboxIsVideo ? (
            <Video
              source={{ uri: lightboxUri! }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.75 }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
            />
          ) : (
            <Image
              source={{ uri: lightboxUri! }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              resizeMode='contain'
            />
          )}
        </View>
      </Modal>
    </View>
  )
}
