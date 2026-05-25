import React, { useMemo, useRef, useState } from 'react'
import { Alert, Clipboard, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-native-qrcode-svg'
import Toast from 'react-native-toast-message'
import * as MediaLibrary from 'expo-media-library'
import { captureRef } from 'react-native-view-shot'

import { HEADER } from '@/constants/theme'
import { useTheme } from '@/context/theme-context'
import { Text } from '@/components/ui/text'
import { useConversations, useGenerateJoinLink, useRefreshJoinLink } from '@/features/message/queries'
import { ForwardMessageModal } from '@/features/message/components'
import { useChatWebSocket } from '@/features/message/hooks'
import { useAuthStore } from '@/store'
import { MessageStatus, MessageType, type MessageResponse } from '@/features/message/schemas'
import { buildGroupLinkUrl } from '@/features/message/utils'

export default function GroupLinkScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { conversationId, canManage } = useLocalSearchParams<{ conversationId?: string; canManage?: string }>()
  const { isDark } = useTheme()
  const qrCaptureRef = useRef<any>(null)
  const me = useAuthStore((s) => s.user)

  const { data: conversations = [], refetch: refetchConversations } = useConversations(0, 100, true)
  const conversation = conversations.find((c) => c.id === conversationId)
  const { sendMessage } = useChatWebSocket()

  const { mutate: generateJoinLink, isPending: isGenerating } = useGenerateJoinLink()
  const { mutate: refreshJoinLink, isPending: isRefreshing } = useRefreshJoinLink()

  const [showMenu, setShowMenu] = useState(false)
  const [showForwardModal, setShowForwardModal] = useState(false)

  const canManageLink = canManage !== 'false'
  const linkEnabled = conversation?.settings?.joinByLinkEnabled !== false
  const token = conversation?.joinLinkToken || ''
  const hasLink = !!token && linkEnabled
  const groupName = String(conversation?.name || '').trim() || 'Group'
  const linkUrl = useMemo(() => (token ? buildGroupLinkUrl(token) : ''), [token])

  const onCreateLink = () => {
    if (!conversationId) return
    generateJoinLink(conversationId, {
      onSuccess: async () => {
        await refetchConversations()
        Toast.show({ type: 'success', text1: t('message.groupLink.createdSuccess', { defaultValue: 'Tạo link thành công' }) })
      }
    })
  }

  const onRefreshLink = () => {
    if (!conversationId) return
    refreshJoinLink(conversationId, {
      onSuccess: async () => {
        await refetchConversations()
        Toast.show({ type: 'success', text1: t('message.groupLink.refreshedSuccess', { defaultValue: 'Đã làm mới link nhóm' }) })
      }
    })
  }

  const onCopyLink = () => {
    if (!linkUrl) return
    Clipboard.setString(linkUrl)
    Toast.show({ type: 'success', text1: t('message.groupLink.copied', { defaultValue: 'Đã sao chép link' }) })
  }

  const onShareLink = async () => {
    if (!linkUrl) return
    setShowForwardModal(true)
  }

  const forwardSourceMessage: MessageResponse | null = useMemo(() => {
    if (!hasLink || !me?.id) return null
    return {
      id: `group-link-${conversationId}`,
      conversationId: null,
      senderId: me.id,
      senderName: me.fullName ?? null,
      senderAvatar: me.avatar ?? null,
      content: linkUrl,
      clientMessageId: null,
      type: MessageType.CHAT,
      createdAt: new Date().toISOString(),
      lastModifiedAt: null,
      replyTo: null,
      isForwarded: true,
      status: MessageStatus.NORMAL
    }
  }, [hasLink, me?.id, me?.fullName, me?.avatar, linkUrl, conversationId])

  const handleSubmitForward = (conversationIds: string[], note: string) => {
    if (!forwardSourceMessage?.content) return
    conversationIds.forEach((convId) => {
      // Match web behavior: share group link as a normal link message.
      sendMessage(convId, forwardSourceMessage.content || '', null, false)
      if (note.trim()) sendMessage(convId, note.trim(), null, false)
    })
    setShowForwardModal(false)
  }

  const onSaveQr = async () => {
    if (!qrCaptureRef.current || !hasLink) return
    const permission = await MediaLibrary.requestPermissionsAsync()
    if (!permission.granted) {
      Alert.alert(
        t('message.groupLink.savePermissionTitle', { defaultValue: 'Quyền truy cập ảnh' }),
        t('message.groupLink.savePermissionDenied', { defaultValue: 'Cần cấp quyền ảnh để lưu mã QR' })
      )
      return
    }

    try {
      const imageUri = await captureRef(qrCaptureRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
        width: 1200,
        height: 1800
      })
      await MediaLibrary.createAssetAsync(imageUri)
      Toast.show({ type: 'success', text1: t('message.groupLink.savedQr', { defaultValue: 'Đã lưu mã QR' }) })
    } catch {
      Toast.show({ type: 'error', text1: t('message.groupLink.saveQrFailed', { defaultValue: 'Không thể lưu mã QR' }) })
    }
  }

  const palette = isDark
    ? {
        bg: '#0F141A',
        card: '#1A222D',
        text: '#EAF1FC',
        subText: '#A7B6CC',
        soft: '#273346',
        actionBg: '#242E3C',
        actionIcon: '#C8D6EC',
        toastBtn: '#181D26'
      }
    : {
        bg: '#F1F2F4',
        card: '#FFFFFF',
        text: '#1D2433',
        subText: '#7F8B9B',
        soft: '#EEF2F8',
        actionBg: '#E9EEF3',
        actionIcon: '#363D49',
        toastBtn: '#1E2127'
      }

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <LinearGradient colors={isDark ? HEADER.gradientColorsDark : HEADER.gradientColors}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={{ paddingRight: 10 }}>
              <Ionicons name='chevron-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('message.groupOptions.groupLink')}</Text>
            <TouchableOpacity onPress={() => setShowMenu((v) => !v)} disabled={!hasLink || !canManageLink}>
              <Ionicons name='ellipsis-horizontal' size={24} color={hasLink && canManageLink ? '#fff' : 'rgba(255,255,255,0.4)'} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 16, paddingTop: 2 }}>
        {hasLink ? (
          <>
            <View
              ref={qrCaptureRef}
              collapsable={false}
              style={{
                marginTop: 8,
                width: '100%',
                maxWidth: 420,
                borderRadius: 16,
                backgroundColor: palette.bg,
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingTop: 4,
                paddingBottom: 12
              }}
            >
              <View style={[styles.groupAvatar, { backgroundColor: palette.soft }]}>
                <Ionicons name='people' size={34} color='#98A1AE' />
              </View>
              <Text style={{ marginTop: 10, fontSize: 19 / 1.2, fontWeight: '700', color: palette.text }}>{groupName}</Text>
              <Text style={{ marginTop: 8, fontSize: 15 / 1.2, color: palette.subText, textAlign: 'center', lineHeight: 21 }}>
                {t('message.groupLink.inviteDescription', {
                  defaultValue: 'Mời mọi người tham gia nhóm bằng mã QR hoặc link dưới đây:'
                })}
              </Text>

              <View style={{ marginTop: 12, backgroundColor: '#fff', padding: 8, borderRadius: 12 }}>
                <QRCode value={linkUrl} size={250} color='#000' backgroundColor='#fff' ecl='H' />
              </View>

              <View style={{ marginTop: 8, backgroundColor: isDark ? '#223248' : '#E7EEF8', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ color: '#1E6ED8', fontSize: 14, fontWeight: '700' }}>{linkUrl}</Text>
              </View>
            </View>

            <View style={{ width: '100%', marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 }}>
              <ActionButton icon='copy-outline' label={t('message.groupLink.copyLink', { defaultValue: 'Sao chép link' })} onPress={onCopyLink} palette={palette} />
              <ActionButton icon='share-social-outline' label={t('message.groupLink.shareLink', { defaultValue: 'Chia sẻ link' })} onPress={onShareLink} palette={palette} />
              <ActionButton icon='download-outline' label={t('message.groupLink.saveQr', { defaultValue: 'Lưu mã QR' })} onPress={onSaveQr} palette={palette} />
            </View>

            <View style={{ flex: 1 }} />
            <View style={[styles.bottomToast, { backgroundColor: palette.toastBtn }]}> 
              <Text style={{ color: '#fff', fontSize: 14 }}>{t('message.groupLink.createdSuccess', { defaultValue: 'Tạo link thành công' })}</Text>
            </View>
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: palette.bg }} />
          </>
        ) : canManageLink ? (
          <View style={{ width: '100%', alignItems: 'center', marginTop: 74, paddingHorizontal: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <View style={[styles.emptyCircle, { backgroundColor: palette.soft }]}>
                <Ionicons name='qr-code-outline' size={34} color='#9AB2D7' />
              </View>
              <View style={[styles.emptyCircle, { backgroundColor: palette.soft, marginLeft: -10 }]}>
                <Ionicons name='link-outline' size={34} color='#9AB2D7' />
              </View>
            </View>

            <Text style={{ color: palette.subText, textAlign: 'center', fontSize: 18 / 1.2, lineHeight: 25, marginBottom: 28 }}>
              {t('message.groupLink.description')}
            </Text>

            <LinearGradient colors={['#1D86ED', '#22A8F3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtn}>
              <TouchableOpacity style={styles.ctaBtnInner} activeOpacity={0.85} onPress={onCreateLink} disabled={isGenerating}>
                <Text style={styles.ctaText}>
                  {isGenerating
                    ? t('message.groupLink.generating', { defaultValue: 'Đang tạo...' })
                    : t('message.groupLink.createNow')}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <View style={{ marginTop: 56, alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: palette.subText, fontSize: 16 }}>{t('message.groupLink.onlyManagersCanCreate')}</Text>
          </View>
        )}
      </View>

      {showMenu ? (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        >
          <View
            style={{
              position: 'absolute',
              right: 10,
              top: 98,
              width: 184,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: isDark ? '#222A34' : '#fff',
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: isDark ? '#3C4B60' : '#E5EAF1'
            }}
          >
            <TouchableOpacity
              activeOpacity={0.78}
              style={styles.menuItem}
              disabled={isRefreshing}
              onPress={() => {
                setShowMenu(false)
                onRefreshLink()
              }}
            >
              <Ionicons name='refresh-outline' size={18} color={isDark ? '#D6E2F3' : '#1F2937'} />
              <Text style={{ marginLeft: 8, color: isDark ? '#D6E2F3' : '#1F2937', fontSize: 14 }}>
                {isRefreshing
                  ? t('message.groupLink.refreshing', { defaultValue: 'Đang làm mới...' })
                  : t('message.groupLink.refreshLink', { defaultValue: 'Làm mới link nhóm' })}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ) : null}

      <ForwardMessageModal
        visible={showForwardModal}
        sourceMessage={forwardSourceMessage}
        conversations={conversations}
        onClose={() => setShowForwardModal(false)}
        onSubmit={handleSubmitForward}
      />
    </View>
  )
}

function ActionButton({
  icon,
  label,
  onPress,
  palette
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  palette: { actionBg: string; actionIcon: string; subText: string }
}) {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={{ alignItems: 'center', width: '31%' }}>
      <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: palette.actionBg, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={24} color={palette.actionIcon} />
      </View>
      <Text style={{ marginTop: 7, color: palette.subText, fontSize: 13, textAlign: 'center' }}>{label}</Text>
    </TouchableOpacity>
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
  groupAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaBtn: {
    width: '100%',
    borderRadius: 999,
    maxWidth: 560
  },
  ctaBtnInner: {
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaText: {
    color: '#fff',
    fontSize: 21 / 1.2,
    fontWeight: '700'
  },
  bottomToast: {
    marginBottom: 8,
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuItem: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12
  }
})
