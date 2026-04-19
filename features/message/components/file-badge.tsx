import React, { useState, useCallback } from 'react'
import { View, TouchableOpacity, Alert, Share } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { File, Paths } from 'expo-file-system'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import type { AttachmentInfo } from '../schemas'

export function getFileInfo(fileName: string): { badgeColor: string; label: string } {
  const ext = (fileName.split('.').pop() || '').toLowerCase()
  if (['doc', 'docx'].includes(ext)) return { badgeColor: '#2563EB', label: 'WORD' }
  if (['xls', 'xlsx'].includes(ext)) return { badgeColor: '#16A34A', label: 'EXCEL' }
  if (['ppt', 'pptx'].includes(ext)) return { badgeColor: '#EA580C', label: 'PPT' }
  if (ext === 'pdf') return { badgeColor: '#DC2626', label: 'PDF' }
  if (['zip', 'rar', '7z'].includes(ext)) return { badgeColor: '#7C3AED', label: ext.toUpperCase() }
  return { badgeColor: '#6B7280', label: ext.toUpperCase() || 'FILE' }
}

export function FileBadge({ attachment, isDark }: { attachment: AttachmentInfo; isDark: boolean }) {
  const fileName = attachment.originalFileName || attachment.fileName || 'file'
  const ext = (fileName.split('.').pop() || '').toLowerCase()
  const [isHandlingFile, setIsHandlingFile] = useState(false)

  const { badgeColor, label } = getFileInfo(fileName)

  const sizeMB = attachment.size ? formatFileSize(attachment.size) : ''

  const openAttachment = useCallback(async () => {
    if (!attachment.url) return
    try {
      await WebBrowser.openBrowserAsync(buildPreviewUrl(attachment.url, ext))
    } catch {
      Alert.alert('Không thể mở tệp', 'Thiết bị không mở được tệp này.')
    }
  }, [attachment.url, ext])

  const saveAttachment = useCallback(async () => {
    if (!attachment.url || isHandlingFile) return
    try {
      setIsHandlingFile(true)
      const safeFileName = fileName.replace(/[\\/:*?"<>|]/g, '_')
      const destination = new File(Paths.cache, `${Date.now()}-${safeFileName}`)
      const downloadedFile = await File.downloadFileAsync(attachment.url, destination, { idempotent: true })
      await Share.share({
        url: downloadedFile.uri,
        title: safeFileName,
        message: safeFileName
      })
    } catch {
      Alert.alert('Không thể lưu tệp', 'Vui lòng thử lại sau.')
    } finally {
      setIsHandlingFile(false)
    }
  }, [attachment.url, fileName, isHandlingFile])

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={openAttachment}
      disabled={!attachment.url || isHandlingFile}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 6,
        minWidth: 180
      }}
    >
      <View
        style={{
          width: 40,
          height: 44,
          borderRadius: 6,
          backgroundColor: badgeColor,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{label}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ fontSize: 13, fontWeight: '500', color: isDark ? '#E8EAED' : '#111827' }}
          numberOfLines={2}
        >
          {fileName}
        </Text>
        {!!sizeMB && (
          <Text style={{ fontSize: 11, color: isDark ? '#888' : '#6B7280', marginTop: 2 }}>{sizeMB}</Text>
        )}
      </View>
      <TouchableOpacity
        onPress={saveAttachment}
        disabled={isHandlingFile}
        hitSlop={8}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? '#2A3340' : '#EFF6FF'
        }}
      >
        <Ionicons name={isHandlingFile ? 'sync' : 'download-outline'} size={18} color='#2563EB' />
      </TouchableOpacity>
    </TouchableOpacity>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function buildPreviewUrl(url: string, ext: string) {
  const previewableExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
  if (previewableExtensions.includes(ext)) {
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`
  }
  return url
}
