import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, BRAND } from '@/constants/theme'
import { useTranslation } from 'react-i18next'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { MessageType, type MessageResponse } from '../schemas'

interface ChatInputBarProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  onSendImage?: (images: { uri: string; fileName: string; mimeType: string }[]) => void
  onSendFile?: (uri: string, fileName: string, mimeType: string) => void
  placeholder?: string
  replyTo?: MessageResponse | null
  onCancelReply?: () => void
  isSendingFile?: boolean
}

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  onSendImage,
  onSendFile,
  placeholder = 'Tin nhắn',
  replyTo,
  onCancelReply,
  isSendingFile = false
}: ChatInputBarProps) {
  const { t } = useTranslation()
  const hasText = value.trim().length > 0
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'
  const [showMoreActions, setShowMoreActions] = useState(false)

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

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 10
    })
    if (!result.canceled && result.assets.length > 0) {
      const images = result.assets.map((asset) => ({
        uri: asset.uri,
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg'
      }))
      onSendImage?.(images)
    }
  }

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      onSendFile?.(asset.uri, asset.name, asset.mimeType || 'application/octet-stream')
    }
  }

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
              paddingLeft: 8
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: BRAND.blue }} numberOfLines={1}>
              {replyTo.senderName || 'User'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              {replyTo.type === MessageType.IMAGE && replyTo.attachments?.[0]?.url ? (
                <Image
                  source={{ uri: replyTo.attachments[0].url }}
                  style={{ width: 24, height: 24, borderRadius: 4, marginRight: 6 }}
                  resizeMode='cover'
                />
              ) : replyTo.type === MessageType.FILE ? (
                <Ionicons name='document-attach-outline' size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
              ) : null}
              <Text style={{ fontSize: 13, color: colors.textSecondary, flex: 1 }} numberOfLines={1}>
                {getReplyPreviewText(replyTo)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onCancelReply} style={{ padding: 6 }}>
            <Ionicons name='close' size={18} color={colors.textSecondary} />
          </TouchableOpacity>
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

        {isSendingFile ? (
          <View style={{ padding: 6, marginBottom: 2 }}>
            <ActivityIndicator size='small' color={BRAND.blue} />
          </View>
        ) : hasText ? (
          <TouchableOpacity onPress={onSend} style={{ padding: 6, marginBottom: 2 }}>
            <Ionicons name='send' size={24} color={BRAND.blue} />
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ padding: 6, marginBottom: 2 }} onPress={() => setShowMoreActions((v) => !v)}>
              <Ionicons name='ellipsis-horizontal' size={22} color={showMoreActions ? BRAND.blue : colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 6, marginBottom: 2 }} onPress={handlePickFile}>
              <Ionicons name='document-attach-outline' size={24} color={colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 6, marginBottom: 2 }} onPress={handlePickImage}>
              <Ionicons name='image-outline' size={24} color={colors.icon} />
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
