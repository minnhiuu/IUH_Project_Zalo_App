import React from 'react'
import { View, Alert, ActivityIndicator } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { Box, VStack, HStack, Text, Divider, Pressable, Button } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { useMyDevices } from '@/features/device/queries/use-queries'
import { useDeleteDevice, useLogoutOtherDevices } from '@/features/device/queries/use-mutations'
import { format } from 'date-fns'
import { DeviceResponse, DeviceType } from '@/features/device/schemas/device.schema'

export default function DeviceManagementScreen() {
 const { t } = useTranslation()
 const { data: devices, isLoading } = useMyDevices()
 const deleteDeviceMutation = useDeleteDevice()
 const logoutOtherDevicesMutation = useLogoutOtherDevices()

 const handleDeleteDevice = (deviceId: string) => {
 Alert.alert(
 t('settings.deviceManagement.deleteConfirm'),
 '',
 [
 {
 text: t('common.cancel'),
 style: 'cancel'
 },
 {
 text: t('common.delete'),
 style: 'destructive',
 onPress: () => deleteDeviceMutation.mutate(deviceId)
 }
 ]
 )
 }

 const handleLogoutOtherDevices = () => {
 Alert.alert(
 t('settings.deviceManagement.logoutOthersConfirm'),
 '',
 [
 {
 text: t('common.cancel'),
 style: 'cancel'
 },
 {
 text: t('common.logout'),
 style: 'destructive',
 onPress: () => logoutOtherDevicesMutation.mutate()
 }
 ]
 )
 }

 const renderDeviceItem = (device: DeviceResponse) => {
 const isMobile = device.deviceType === DeviceType.MOBILE
 const isActive = device.isActive
 const isCurrent = device.isCurrentDevice

 return (
 <Box
 key={device.id}
 className={isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
 style={{ borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 }}
>
 <HStack className="items-start justify-between">
 <HStack className="items-center flex-1" space="md">
 <View style={{ 
 width: 40, 
 height: 40, 
 borderRadius: 20, 
 backgroundColor: isMobile ? '#E8F0FE' : '#F3E5F5',
 alignItems: 'center',
 justifyContent: 'center'
 }}>
 <Ionicons
 name={isMobile ? 'phone-portrait-outline' : 'desktop-outline'}
 size={20}
 color={isMobile ? '#0068FF' : '#9C27B0'}
 />
 </View>

 <VStack className="flex-1">
 <HStack className="flex-wrap items-center" space="xs">
 <Text size="sm" className="text-gray-900 font-bold">
 {device.deviceName || 'Unknown Device'}
 </Text>
 
 {isActive && (
 <Box className="bg-green-100" style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
 <HStack className="items-center" space="xs">
 <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' }} />
 <Text size="xs" className="text-green-700 font-medium">
 {t('settings.deviceManagement.activeStatus')}
 </Text>
 </HStack>
 </Box>
 )}
 
 {isCurrent && (
 <Box className="bg-blue-100" style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
 <Text size="xs" className="text-blue-700 font-medium">
 {t('settings.deviceManagement.currentDevice')}
 </Text>
 </Box>
 )}
 </HStack>

 <Text size="xs" className="text-gray-500 mt-1">
 {device.os || 'Unknown OS'} • {device.browser || 'Unknown Browser'}
 </Text>
 
 {device.lastActiveTime && (
 <Text size="xs" className="text-gray-400 mt-0.5">
 {format(new Date(device.lastActiveTime), 'Pp')}
 </Text>
 )}
 </VStack>
 </HStack>

 {!isCurrent && (
 <Pressable
 onPress={() => handleDeleteDevice(device.id)}
 disabled={deleteDeviceMutation.isPending}
 style={{ padding: 8 }}
>
 {deleteDeviceMutation.isPending ? (
 <ActivityIndicator size='small' />
 ) : (
 <Ionicons name='trash-outline' size={20} color='#EF4444' />
 )}
 </Pressable>
 )}
 </HStack>
 </Box>
 )
 }

 const activeDevices = devices?.filter(d => d.isActive) || []
 const inactiveDevices = devices?.filter(d => !d.isActive) || []

 return (
 <SettingsDetailScreen title={t('settings.deviceManagement.title')}>
 <Box className="p-4">
 <Text size="sm" className="text-gray-500 mb-4">
 {t('settings.deviceManagement.description')}
 </Text>

 {isLoading ? (
 <HStack className="justify-center items-center py-8" space="sm">
 <ActivityIndicator />
 <Text size="sm" className="text-gray-500">
 {t('settings.deviceManagement.loading')}
 </Text>
 </HStack>
 ) : devices && devices.length > 0 ? (
 <VStack space="xl">
 {/* Active Devices */}
 {activeDevices.length > 0 && (
 <VStack space="sm">
 <Text size="sm" className="text-gray-400 font-bold uppercase">
 {t('settings.deviceManagement.activeDevices')}
 </Text>
 {activeDevices.map(renderDeviceItem)}
 </VStack>
 )}

 {/* Inactive Devices */}
 {inactiveDevices.length > 0 && (
 <VStack space="sm">
 <Text size="sm" className="text-gray-400 font-bold uppercase">
 {t('settings.deviceManagement.inactiveDevices')}
 </Text>
 {inactiveDevices.map(renderDeviceItem)}
 </VStack>
 )}

 <Divider className="my-2" />

 <Button
 variant='outline'
 onPress={handleLogoutOtherDevices}
 disabled={logoutOtherDevicesMutation.isPending || (devices.length <= 1)}
>
 <HStack className="items-center" space="sm">
 {logoutOtherDevicesMutation.isPending && <ActivityIndicator size="small" />}
 <Ionicons name='log-out-outline' size={20} color='#EF4444' />
 <Text className="text-red-600">
 {t('settings.deviceManagement.logoutOthers')}
 </Text>
 </HStack>
 </Button>
 </VStack>
 ) : (
 <Box className="py-8">
 <Text size="sm" className="text-gray-500">
 {t('settings.deviceManagement.noDevices')}
 </Text>
 </Box>
 )}
 </Box>
 </SettingsDetailScreen>
 )
}
