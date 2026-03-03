import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format, fromUnixTime } from 'date-fns'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { DeviceResponse, DeviceType } from '@/features/device/schemas/device.schema'

interface DeviceDetailModalProps {
  device: DeviceResponse
  visible: boolean
  onClose: () => void
  deleteLabel: string
  isPendingDelete: boolean
  onDelete?: (id: string) => void
  logoutLabel: string
  isPendingLogout: boolean
  onLogoutDevice?: (sessionId: string) => void
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <View className='flex-row py-2 border-b border-gray-100'>
      <Text className='text-xs text-gray-500 w-36 flex-shrink-0'>{label}</Text>
      <Text className='text-xs text-gray-800 flex-1 flex-wrap' selectable>
        {value}
      </Text>
    </View>
  )
}

export function DeviceDetailModal({
  device,
  visible,
  onClose,
  deleteLabel,
  isPendingDelete,
  onDelete,
  logoutLabel,
  isPendingLogout,
  onLogoutDevice
}: DeviceDetailModalProps) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const isMobile = device.deviceType === DeviceType.MOBILE
  const isCurrent = device.isCurrentDevice

  const formatTimestamp = (ts: number | null | undefined) => (ts ? format(fromUnixTime(ts), 'Pp') : null)
  const formatDate = (d: string | null | undefined) => (d ? format(new Date(d), 'Pp') : null)

  return (
    <Modal visible={visible} transparent animationType='slide' onRequestClose={onClose}>
      <Pressable className='flex-1 bg-black/40 justify-end' onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className='bg-white rounded-t-2xl' style={{ maxHeight: '85%' }}>
            {/* Handle bar */}
            <View className='items-center pt-3 pb-1'>
              <View className='w-10 h-1 rounded-full bg-gray-300' />
            </View>

            {/* Header */}
            <View className='flex-row items-center px-4 py-3 border-b border-gray-100'>
              <View
                className='w-9 h-9 rounded-full items-center justify-center mr-3'
                style={{ backgroundColor: isMobile ? '#E8F0FE' : '#F3E5F5' }}
              >
                <Ionicons
                  name={isMobile ? 'phone-portrait-outline' : 'desktop-outline'}
                  size={18}
                  color={isMobile ? '#0068FF' : '#9C27B0'}
                />
              </View>
              <View className='flex-1'>
                <Text className='text-base font-bold text-gray-900'>{device.deviceName || 'Unknown Device'}</Text>
                <Text className='text-xs text-gray-500'>{device.deviceType}</Text>
              </View>
              <TouchableOpacity onPress={onClose} className='p-1'>
                <Ionicons name='close' size={22} color='#6B7280' />
              </TouchableOpacity>
            </View>

            {/* Details */}
            <ScrollView className='px-4 py-2' showsVerticalScrollIndicator={false}>
              <DetailRow label={t('settings.deviceManagement.detail.deviceId')} value={device.deviceId} />
              <DetailRow label={t('settings.deviceManagement.detail.sessionId')} value={device.sessionId} />
              <DetailRow label={t('settings.deviceManagement.detail.os')} value={device.os} />
              <DetailRow label={t('settings.deviceManagement.detail.browser')} value={device.browser} />
              <DetailRow label={t('settings.deviceManagement.detail.ipAddress')} value={device.ipAddress} />
              <DetailRow label={t('settings.deviceManagement.detail.accountId')} value={device.accountId} />
              <DetailRow
                label={t('settings.deviceManagement.detail.lastActiveTime')}
                value={formatDate(device.lastActiveTime)}
              />
              <DetailRow
                label={t('settings.deviceManagement.detail.issuedAt')}
                value={formatTimestamp(device.issuedAt)}
              />
              <DetailRow
                label={t('settings.deviceManagement.detail.expiresAt')}
                value={formatTimestamp(device.expiresAt)}
              />
              <DetailRow label={t('settings.deviceManagement.detail.createdAt')} value={formatDate(device.createdAt)} />
              <DetailRow
                label={t('settings.deviceManagement.detail.lastModifiedAt')}
                value={formatDate(device.lastModifiedAt)}
              />
              <DetailRow label={t('settings.deviceManagement.detail.createdBy')} value={device.createdBy} />
              <DetailRow label={t('settings.deviceManagement.detail.lastModifiedBy')} value={device.lastModifiedBy} />
            </ScrollView>

            {/* Actions */}
            {!isCurrent && (onLogoutDevice || onDelete) && (
              <View
                className='px-4 pt-3 gap-2 border-t border-gray-100'
                style={{ paddingBottom: Math.max(insets.bottom, 16) }}
              >
                {onLogoutDevice && (
                  <TouchableOpacity
                    onPress={() => {
                      onClose()
                      onLogoutDevice(device.sessionId)
                    }}
                    disabled={isPendingLogout}
                    className='flex-row items-center justify-center gap-2 border border-orange-200 bg-orange-50 rounded-lg py-3'
                  >
                    {isPendingLogout ? (
                      <ActivityIndicator size='small' color='#F97316' />
                    ) : (
                      <Ionicons name='log-out-outline' size={18} color='#F97316' />
                    )}
                    <Text className='text-orange-600 font-medium text-sm'>{logoutLabel}</Text>
                  </TouchableOpacity>
                )}
                {onDelete && (
                  <TouchableOpacity
                    onPress={() => {
                      onClose()
                      onDelete(device.id)
                    }}
                    disabled={isPendingDelete}
                    className='flex-row items-center justify-center gap-2 border border-red-200 bg-red-50 rounded-lg py-3'
                  >
                    {isPendingDelete ? (
                      <ActivityIndicator size='small' color='#EF4444' />
                    ) : (
                      <Ionicons name='trash-outline' size={18} color='#EF4444' />
                    )}
                    <Text className='text-red-600 font-medium text-sm'>{deleteLabel}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Safe area spacer when there are no action buttons */}
            {(isCurrent || (!onLogoutDevice && !onDelete)) && insets.bottom > 0 && (
              <View style={{ height: insets.bottom }} />
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
