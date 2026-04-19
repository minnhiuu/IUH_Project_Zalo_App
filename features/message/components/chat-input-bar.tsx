import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, TextInput, Alert, Linking, Image, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, BRAND } from '@/constants/theme'
import { useTranslation } from 'react-i18next'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import type { MessageResponse } from '../schemas'

export type FileAsset = { uri: string; mimeType: string; fileName: string }

interface ChatInputBarProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  placeholder?: string
  replyTo?: MessageResponse | null
  onCancelReply?: () => void
  onSendFile?: (assets: FileAsset[]) => void
  onSendFileImmediate?: (assets: FileAsset[]) => void
  selectedAttachments?: FileAsset[]
  onRemoveAttachment?: (index: number) => void
  onClearAttachments?: () => void
  isUploading?: boolean
}

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  placeholder = 'Tin nhắn',
  replyTo,
  onCancelReply,
  onSendFile,
  onSendFileImmediate,
  selectedAttachments = [],
  onRemoveAttachment,
  onClearAttachments,
  isUploading = false
}: ChatInputBarProps) {
  const { t } = useTranslation()
  const hasText = value.trim().length > 0
  const hasAttachments = selectedAttachments.length > 0
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'
  const [showMoreActions, setShowMoreActions] = useState(false)

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
            <TouchableOpacity style={{ padding: 6, marginBottom: 2 }}>
              <Ionicons name='mic-outline' size={24} color={colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 6, marginBottom: 2 }} onPress={handlePickImage} disabled={isUploading}>
              <Ionicons name='image-outline' size={24} color={isUploading ? colors.textSecondary : colors.icon} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!hasText && showMoreActions && (
        <View
          style={{
            backgroundColor: isDark ? '#15181D' : '#FFFFFF',
            borderTopWidth: 0.5,
            borderTopColor: colors.border,
            paddingTop: 10,
            paddingBottom: 10,
            paddingHorizontal: 10
          }}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                activeOpacity={0.7}
                onPress={action.key === 'file' ? handlePickFile : undefined}
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
      )}
    </SafeAreaView>
  )
}
