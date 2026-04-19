import React, { useMemo, useRef, useState } from 'react'
import { View, TouchableOpacity, TextInput, Alert, Linking, ScrollView, Image, Modal, FlatList, Switch, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, BRAND } from '@/constants/theme'
import { useTranslation } from 'react-i18next'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { MessageType, type MessageResponse } from '../schemas'
import { UserAvatar } from '@/components/common/user-avatar'
import { useMyFriends } from '@/features/friend/queries'

export type FileAsset = { uri: string; mimeType: string; fileName: string }
export type BusinessCardAsset = {
  userId: string
  name: string
  phone?: string
  avatar?: string | null
  includePhone?: boolean
}
type FriendListRow =
  | { type: 'header'; key: string; letter: string }
  | { type: 'friend'; key: string; friend: any }

const pickFirstText = (...values: any[]): string => {
  for (const value of values) {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) return trimmed
    }
  }
  return ''
}

const getFriendId = (friend: any): string =>
  pickFirstText(friend?.userId, friend?.id, friend?.user?.id, friend?.targetUserId)

const getFriendName = (friend: any): string =>
  pickFirstText(friend?.userName, friend?.fullName, friend?.displayName, friend?.name, friend?.user?.userName, friend?.user?.fullName)

const getFriendPhone = (friend: any): string =>
  pickFirstText(
    friend?.userPhone,
    friend?.phoneNumber,
    friend?.phone,
    friend?.mobile,
    friend?.user?.userPhone,
    friend?.user?.phoneNumber,
    friend?.user?.phone,
    friend?.userInfo?.phone,
    friend?.profile?.phone
  )

const getFriendAvatar = (friend: any): string | null =>
  pickFirstText(friend?.userAvatar, friend?.avatar, friend?.user?.avatar, friend?.profile?.avatar) || null

interface ChatInputBarProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  onSendFile?: (assets: FileAsset[]) => void
  placeholder?: string
  replyTo?: MessageResponse | null
  onCancelReply?: () => void
  onSendFileImmediate?: (assets: FileAsset[]) => void
  selectedAttachments?: FileAsset[]
  onRemoveAttachment?: (index: number) => void
  onClearAttachments?: () => void
  isUploading?: boolean
  onSendBusinessCards?: (cards: BusinessCardAsset[]) => void
}

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  onSendFile,
  placeholder = 'Tin nhắn',
  replyTo,
  onCancelReply,
  onSendFileImmediate,
  selectedAttachments = [],
  onRemoveAttachment,
  onClearAttachments,
  isUploading = false,
  onSendBusinessCards
}: ChatInputBarProps) {
  const { t } = useTranslation()
  const hasText = value.trim().length > 0
  const hasAttachments = selectedAttachments.length > 0
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const [showMoreActions, setShowMoreActions] = useState(false)
  const [showBusinessCardModal, setShowBusinessCardModal] = useState(false)
  const [businessCardQuery, setBusinessCardQuery] = useState('')
  const [selectedBusinessCardIds, setSelectedBusinessCardIds] = useState<string[]>([])
  const [includePhone, setIncludePhone] = useState(true)
  const { data: friends = [] } = useMyFriends(0, 300, showBusinessCardModal)
  const friendListRef = useRef<FlatList<any>>(null)

  const ensureMediaLibraryPermission = async () => {
    const currentPermission = await ImagePicker.getMediaLibraryPermissionsAsync()
    const hasCurrentAccess = currentPermission.granted || currentPermission.accessPrivileges === 'limited'

    if (hasCurrentAccess) {
      return true
    }

    if (currentPermission.canAskAgain) {
      const requestedPermission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      const hasRequestedAccess = requestedPermission.granted || requestedPermission.accessPrivileges === 'limited'
      if (hasRequestedAccess) {
        return true
      }
    }

    Alert.alert(
      t('message.attachment.permissionTitle', { defaultValue: 'Quyền truy cập ảnh' }),
      t('message.attachment.permissionDenied', { defaultValue: 'Cần quyền truy cập thư viện ảnh/video' }),
      [
        {
          text: t('message.actions.cancel', { defaultValue: 'Hủy' }),
          style: 'cancel'
        },
        {
          text: t('message.attachment.openSettings', { defaultValue: 'Mở cài đặt' }),
          onPress: () => Linking.openSettings()
        }
      ]
    )

    return false
  }

  const handlePickImage = async () => {
    const hasPermission = await ensureMediaLibraryPermission()
    if (!hasPermission) {
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.85
    })

    if (!result.canceled && result.assets.length > 0) {
      const assets: FileAsset[] = result.assets.map((a) => ({
        uri: a.uri,
        mimeType: a.mimeType || (a.type === 'video' ? 'video/mp4' : 'image/jpeg'),
        fileName: a.fileName || `media_${Date.now()}`
      }))
      onSendFile?.(assets)
      setShowMoreActions(false)
    }
  }

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true
      })
      if (!result.canceled && result.assets.length > 0) {
        const assets: FileAsset[] = result.assets.map((a) => ({
          uri: a.uri,
          mimeType: a.mimeType || 'application/octet-stream',
          fileName: a.name || `file_${Date.now()}`
        }))
        onSendFileImmediate?.(assets)
        setShowMoreActions(false)
      }
    } catch {
      // user cancelled
    }
  }

  const quickActions = useMemo(
    () => [
      {
        key: 'location',
        icon: 'location-outline',
        label: t('message.quickActions.location', { defaultValue: 'Vị trí' }),
        color: '#F97373'
      },
      {
        key: 'file',
        icon: 'document-attach-outline',
        label: t('message.quickActions.file', { defaultValue: 'Tài liệu' }),
        color: '#2563EB'
      },
      {
        key: 'reminder',
        icon: 'alarm-outline',
        label: t('message.quickActions.reminder', { defaultValue: 'Nhắc hẹn' }),
        color: '#E11D48'
      },
      {
        key: 'quick-message',
        icon: 'flash-outline',
        label: t('message.quickActions.quickMessage', { defaultValue: 'Tin nhắn nhanh' }),
        color: '#2563EB'
      },
      {
        key: 'transfer',
        icon: 'cash-outline',
        label: t('message.quickActions.transfer', { defaultValue: 'Chuyển khoản' }),
        color: '#22C55E'
      },
      {
        key: 'card',
        icon: 'card-outline',
        label: t('message.quickActions.businessCard', { defaultValue: 'Danh thiếp' }),
        color: '#0EA5E9'
      },
      {
        key: 'docs',
        icon: 'folder-open-outline',
        label: t('message.quickActions.myDocuments', { defaultValue: 'My Documents' }),
        color: '#3B82F6'
      },
      {
        key: 'account',
        icon: 'card-outline',
        label: t('message.quickActions.sendAccount', { defaultValue: 'Gửi số tài khoản' }),
        color: '#7C3AED'
      },
      {
        key: 'gif',
        icon: 'images-outline',
        label: t('message.quickActions.gif', { defaultValue: '@GIF' }),
        color: '#22C55E'
      },
      {
        key: 'draw',
        icon: 'brush-outline',
        label: t('message.quickActions.draw', { defaultValue: 'Vẽ hình' }),
        color: '#D946EF'
      },
      {
        key: 'font',
        icon: 'text-outline',
        label: t('message.quickActions.font', { defaultValue: 'Kiểu chữ' }),
        color: '#EAB308'
      }
    ],
    [t]
  )

  const filteredFriends = useMemo(() => {
    const keyword = businessCardQuery.trim().toLowerCase()
    const sorted = [...friends].sort((a: any, b: any) => {
      const nameA = getFriendName(a).toLowerCase()
      const nameB = getFriendName(b).toLowerCase()
      return nameA.localeCompare(nameB, 'vi')
    })
    if (!keyword) return sorted

    return sorted.filter((friend: any) => {
      const name = getFriendName(friend).toLowerCase()
      const phone = getFriendPhone(friend).toLowerCase()
      return name.includes(keyword) || phone.includes(keyword)
    })
  }, [friends, businessCardQuery])

  const friendListRows = useMemo(() => {
    const rows: FriendListRow[] = []
    let lastLetter = ''

    filteredFriends.forEach((friend: any) => {
      const displayName = getFriendName(friend) || 'User'
      const firstChar = displayName.charAt(0).toUpperCase()
      const letter = /[A-Z]/.test(firstChar) ? firstChar : '#'

      if (letter !== lastLetter) {
        rows.push({ type: 'header', key: `header-${letter}`, letter })
        lastLetter = letter
      }

      rows.push({ type: 'friend', key: `friend-${getFriendId(friend) || Math.random()}`, friend })
    })

    return rows
  }, [filteredFriends])

  const sideLetters = useMemo(() => {
    const set = new Set<string>()
    friendListRows.forEach((row) => {
      if (row.type === 'header') set.add(row.letter)
    })
    return Array.from(set)
  }, [friendListRows])

  const headerRowIndexByLetter = useMemo(() => {
    const mapping: Record<string, number> = {}
    friendListRows.forEach((row, idx) => {
      if (row.type === 'header' && mapping[row.letter] === undefined) {
        mapping[row.letter] = idx
      }
    })
    return mapping
  }, [friendListRows])

  const selectedFriends = useMemo(
    () =>
      friends.filter((friend: any) => selectedBusinessCardIds.includes(getFriendId(friend))),
    [friends, selectedBusinessCardIds]
  )

  const resetBusinessCardModal = () => {
    setShowBusinessCardModal(false)
    setBusinessCardQuery('')
    setSelectedBusinessCardIds([])
    setIncludePhone(true)
  }

  const toggleBusinessCardSelect = (userId: string) => {
    setSelectedBusinessCardIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleSendBusinessCards = () => {
    if (!selectedBusinessCardIds.length || !onSendBusinessCards) return

    const selectedMap = new Set(selectedBusinessCardIds)
    const cards: BusinessCardAsset[] = friends
      .filter((friend: any) => selectedMap.has(getFriendId(friend)))
      .map((friend: any) => ({
        userId: getFriendId(friend),
        name: getFriendName(friend) || 'User',
        phone: includePhone ? getFriendPhone(friend) : '',
        avatar: getFriendAvatar(friend),
        includePhone
      }))
      .filter((card) => !!card.userId)

    if (!cards.length) return

    onSendBusinessCards(cards)
    resetBusinessCardModal()
  }

  const getReplyPreviewText = (message: MessageResponse) => {
    if (message.type === MessageType.IMAGE) {
      return t('message.messageType.image', { defaultValue: '[Hình ảnh]' })
    }

    if (message.type === MessageType.FILE) {
      const firstAttachment = message.attachments?.[0]
      const fileName =
        firstAttachment?.originalFileName ||
        firstAttachment?.fileName ||
        (typeof message.content === 'string' ? message.content : '')

      if (fileName && fileName.trim()) {
        return `${t('message.messageType.file', { defaultValue: '[File]' })} ${fileName}`
      }
      return t('message.messageType.file', { defaultValue: '[File]' })
    }

    return message.content || ''
  }

  const cardModalBg = isDark ? '#111317' : '#F3F4F6'
  const cardModalPanel = isDark ? '#1A1D23' : '#FFFFFF'
  const cardModalSearchBg = isDark ? '#262B34' : '#F0F2F5'
  const cardModalBorder = isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'
  const cardModalText = isDark ? '#F3F4F6' : '#111827'
  const cardModalSubText = isDark ? '#9AA3AF' : '#6B7280'

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: isDark ? '#15181D' : '#fff' }}>
      {/* Reply preview bar */}
      {replyTo && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#1C2630' : '#F3F4F6',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderTopWidth: 0.5,
            borderTopColor: colors.border
          }}
        >
          <View
            style={{
              flex: 1,
              borderLeftWidth: 3,
              borderLeftColor: BRAND.blue,
              paddingLeft: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8
            }}
          >
            {(replyTo.type === 'IMAGE' || replyTo.type === 'VIDEO') && replyTo.attachments?.[0]?.url ? (
              <View style={{ position: 'relative', width: 44, height: 44, borderRadius: 6, overflow: 'hidden', backgroundColor: '#111', flexShrink: 0 }}>
                <Image source={{ uri: replyTo.attachments[0].url }} style={{ width: '100%', height: '100%' }} resizeMode='cover' />
                {replyTo.type === 'VIDEO' && (
                  <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' } as any}>
                    <Ionicons name='play-circle' size={22} color='rgba(255,255,255,0.9)' />
                  </View>
                )}
              </View>
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: BRAND.blue }} numberOfLines={1}>
                {replyTo.senderName || 'User'}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }} numberOfLines={1}>
                {replyTo.type === 'IMAGE' ? '📷 Hình ảnh' : replyTo.type === 'VIDEO' ? '🎬 Video' : replyTo.content}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={{ padding: 6 }}>
            <Ionicons name='close' size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {hasAttachments && (
        <View
          style={{
            backgroundColor: isDark ? '#15181D' : '#fff',
            paddingTop: 8,
            paddingBottom: 6,
            borderTopWidth: replyTo ? 0 : 0.5,
            borderTopColor: colors.border
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              {t('message.attachment.selectedCount', { defaultValue: '{{count}} tệp đã chọn', count: selectedAttachments.length })}
            </Text>
            <TouchableOpacity onPress={onClearAttachments} hitSlop={8}>
              <Text style={{ fontSize: 13, color: BRAND.blue, fontWeight: '600' }}>
                {t('message.actions.cancel', { defaultValue: 'Hủy' })}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
            {selectedAttachments.map((attachment, index) => {
              const isImage = attachment.mimeType.startsWith('image/')
              const isVideo = attachment.mimeType.startsWith('video/')

              return (
                <View
                  key={`${attachment.uri}-${index}`}
                  style={{
                    width: isImage || isVideo ? 64 : 150,
                    height: 64,
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: isDark ? '#232833' : '#F3F4F6',
                    position: 'relative',
                    borderWidth: 1,
                    borderColor: isDark ? '#313846' : '#E5E7EB'
                  }}
                >
                  {isImage || isVideo ? (
                    <>
                      <Image source={{ uri: attachment.uri }} style={{ width: '100%', height: '100%' }} resizeMode='cover' />
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
                          <Ionicons name='play-circle' size={24} color='#fff' />
                        </View>
                      )}
                    </>
                  ) : (
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 8 }}>
                      <Ionicons name='document-attach-outline' size={22} color={BRAND.blue} />
                      <Text style={{ flex: 1, fontSize: 12, color: colors.text }} numberOfLines={2}>
                        {attachment.fileName}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => onRemoveAttachment?.(index)}
                    hitSlop={8}
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: 'rgba(0,0,0,0.55)',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Ionicons name='close' size={12} color='#fff' />
                  </TouchableOpacity>
                </View>
              )
            })}
          </ScrollView>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          paddingHorizontal: 6,
          paddingTop: 6,
          paddingBottom: 4,
          backgroundColor: isDark ? '#15181D' : '#fff',
          borderTopWidth: replyTo ? 0 : 0.5,
          borderTopColor: colors.border
        }}
      >
        {/* Sticker button */}
        <TouchableOpacity style={{ padding: 6, marginBottom: 2 }}>
          <Ionicons name='happy-outline' size={26} color={colors.icon} />
        </TouchableOpacity>

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#666' : '#9ca3af'}
          multiline
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.text,
            maxHeight: 100,
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: isDark ? '#2A2F36' : '#F3F4F6',
            borderRadius: 20,
            marginHorizontal: 4
          }}
        />

        {hasText || hasAttachments ? (
          <TouchableOpacity onPress={onSend} style={{ padding: 6, marginBottom: 2 }}>
            <Ionicons name='send' size={24} color={isUploading ? colors.textSecondary : BRAND.blue} />
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ padding: 6, marginBottom: 2 }} onPress={() => setShowMoreActions((v) => !v)}>
              <Ionicons name='ellipsis-horizontal' size={22} color={showMoreActions ? BRAND.blue : colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 6, marginBottom: 2 }} onPress={handlePickFile}>
              <Ionicons name='document-attach-outline' size={24} color={colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 6, marginBottom: 2 }} onPress={handlePickImage} disabled={isUploading}>
              <Ionicons name='image-outline' size={24} color={isUploading ? colors.textSecondary : colors.icon} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={!hasText && showMoreActions}
        transparent
        animationType='fade'
        statusBarTranslucent
        onRequestClose={() => setShowMoreActions(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowMoreActions(false)} />
          <View
            style={{
              backgroundColor: isDark ? '#15181D' : '#FFFFFF',
              borderTopWidth: 0.5,
              borderTopColor: colors.border,
              paddingTop: 10,
              paddingBottom: Math.max(insets.bottom, 10),
              paddingHorizontal: 10
            }}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.key}
                  activeOpacity={0.7}
                  onPress={
                    action.key === 'file'
                      ? handlePickFile
                      : action.key === 'card'
                        ? () => {
                            setShowMoreActions(false)
                            setShowBusinessCardModal(true)
                          }
                        : () => setShowMoreActions(false)
                  }
                  style={{
                    width: '25%',
                    alignItems: 'center',
                    paddingVertical: 10
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: isDark ? '#232833' : '#F3F4F6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8
                    }}
                  >
                    <Ionicons name={action.icon as any} size={28} color={action.color} />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.text,
                      textAlign: 'center'
                    }}
                    numberOfLines={2}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBusinessCardModal}
        animationType='slide'
        onRequestClose={resetBusinessCardModal}
        presentationStyle='fullScreen'
        statusBarTranslucent
      >
        <SafeAreaView edges={['left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: cardModalBg }}>
          <View style={{ height: Math.max(insets.top, 10), backgroundColor: cardModalPanel }} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingTop: 6,
              paddingBottom: 8,
              backgroundColor: cardModalPanel
            }}
          >
            <TouchableOpacity onPress={resetBusinessCardModal} style={{ paddingRight: 10 }}>
              <Ionicons name='chevron-back' size={24} color={cardModalText} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 32 / 2, fontWeight: '700', color: cardModalText }}>
                {t('message.businessCard.title', { defaultValue: 'Gửi danh thiếp' })}
              </Text>
              <Text style={{ fontSize: 13, color: cardModalSubText, marginTop: 2 }}>
                {t('message.businessCard.selectedCount', {
                  defaultValue: 'Đã chọn: {{count}}',
                  count: selectedBusinessCardIds.length
                })}
              </Text>
            </View>
          </View>

          <View style={{ padding: 12, backgroundColor: cardModalPanel }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: cardModalSearchBg,
                borderRadius: 10,
                paddingHorizontal: 10,
                height: 44
              }}
            >
              <Ionicons name='search-outline' size={20} color={cardModalSubText} />
              <TextInput
                value={businessCardQuery}
                onChangeText={setBusinessCardQuery}
                placeholder={t('message.businessCard.search', { defaultValue: 'Tìm liên hệ trong danh bạ máy và Zalo' })}
                placeholderTextColor={isDark ? '#7E8793' : '#9CA3AF'}
                style={{ flex: 1, marginLeft: 8, fontSize: 16, color: cardModalText }}
              />
            </View>
          </View>

          <FlatList
            ref={friendListRef}
            data={friendListRows}
            keyExtractor={(item: FriendListRow) => item.key}
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{ paddingBottom: 140, backgroundColor: cardModalPanel }}
            renderItem={({ item }: { item: FriendListRow }) => {
              if (item.type === 'header') {
                return (
                  <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
                    <Text style={{ fontSize: 18, fontWeight: '500', color: cardModalSubText }}>{item.letter}</Text>
                  </View>
                )
              }

              const friend = item.friend
              const userId = getFriendId(friend)
              const selected = selectedBusinessCardIds.includes(userId)
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleBusinessCardSelect(userId)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 10
                  }}
                >
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      borderWidth: 1.8,
                      borderColor: selected ? '#1677E6' : isDark ? '#4B5563' : '#D1D5DB',
                      backgroundColor: selected ? '#1677E6' : cardModalPanel,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10
                    }}
                  >
                    {selected ? <Ionicons name='checkmark' size={14} color='#fff' /> : null}
                  </View>
                  <UserAvatar source={getFriendAvatar(friend)} name={getFriendName(friend) || 'User'} size='lg' />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontSize: 17, color: cardModalText, fontWeight: '500' }} numberOfLines={1}>
                      {getFriendName(friend) || 'User'}
                    </Text>
                    {!!getFriendPhone(friend) && (
                      <Text style={{ fontSize: 14, color: cardModalSubText, marginTop: 1 }} numberOfLines={1}>
                        {getFriendPhone(friend)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )
            }}
            ListEmptyComponent={
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: cardModalSubText }}>
                  {t('message.businessCard.empty', { defaultValue: 'Không tìm thấy liên hệ' })}
                </Text>
              </View>
            }
          />

          {sideLetters.length > 0 && (
            <View
              pointerEvents='box-none'
              style={{ position: 'absolute', right: 6, top: 160, bottom: 160, justifyContent: 'center' }}
            >
              {sideLetters.map((letter) => (
                <TouchableOpacity
                  key={`side-${letter}`}
                  activeOpacity={0.6}
                  onPress={() => {
                    const targetIndex = headerRowIndexByLetter[letter]
                    if (targetIndex !== undefined) {
                      friendListRef.current?.scrollToIndex({ index: targetIndex, animated: true })
                    }
                  }}
                  style={{ paddingVertical: 1, paddingHorizontal: 4 }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: cardModalSubText }}>{letter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: cardModalPanel,
              borderTopWidth: 1,
              borderTopColor: cardModalBorder,
              paddingHorizontal: 12,
              paddingTop: 8,
              paddingBottom: Math.max(insets.bottom, 10)
            }}
          >
            {selectedFriends.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
                {selectedFriends.map((friend: any) => {
                  const userId = String(friend?.userId || '')
                  return (
                    <View key={userId} style={{ position: 'relative' }}>
                      <UserAvatar source={friend?.userAvatar || null} name={friend?.userName || 'User'} size='md' />
                      <TouchableOpacity
                        onPress={() => toggleBusinessCardSelect(userId)}
                        style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          backgroundColor: isDark ? '#374151' : '#E5E7EB',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Ionicons name='close' size={12} color={isDark ? '#E5E7EB' : '#374151'} />
                      </TouchableOpacity>
                    </View>
                  )
                })}
              </ScrollView>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, color: cardModalText }}>
                {t('message.businessCard.includePhone', { defaultValue: 'Gửi kèm số điện thoại' })}
              </Text>
              <Switch
                value={includePhone}
                onValueChange={setIncludePhone}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor='#fff'
              />
            </View>

            <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity
                onPress={handleSendBusinessCards}
                disabled={!selectedBusinessCardIds.length}
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selectedBusinessCardIds.length ? '#1D9BF0' : isDark ? '#4B5563' : '#D1D5DB'
                }}
              >
                <Ionicons name='send' size={24} color='#FFFFFF' />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}
