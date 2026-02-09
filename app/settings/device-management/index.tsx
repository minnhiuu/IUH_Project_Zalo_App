import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Divider,
  Icon,
  Pressable,
  Spinner,
  Button,
  ButtonText,
  ButtonIcon
} from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useMyDevices } from '@/features/device/queries/use-queries'
import { useDeleteDevice, useLogoutOtherDevices } from '@/features/device/queries/use-mutations'
import { format } from 'date-fns'
import { Alert } from 'react-native'
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
        bg={isCurrent ? '$primary50' : '$white'}
        borderColor={isCurrent ? '$primary200' : '$borderLight200'}
        borderWidth={1}
        borderRadius='$lg'
        p='$3'
        mb='$3'
      >
        <HStack justifyContent='space-between' alignItems='flex-start'>
          <HStack space='md' flex={1}>
            <Box
              w={40}
              h={40}
              borderRadius='$full'
              bg={isMobile ? '$blue100' : '$purple100'}
              alignItems='center'
              justifyContent='center'
            >
              <Ionicons
                name={isMobile ? 'phone-portrait-outline' : 'desktop-outline'}
                size={20}
                color={isMobile ? '#0068FF' : '#9C27B0'}
              />
            </Box>

            <VStack flex={1}>
              <HStack space='xs' alignItems='center' flexWrap='wrap'>
                <Text size='sm' fontWeight='$bold' color='$textLight900'>
                  {device.deviceName || 'Unknown Device'}
                </Text>
                
                {isActive && (
                  <Box bg='$success100' px='$2' py='$0.5' borderRadius='$full' flexDirection='row' alignItems='center'>
                    <Box w={6} h={6} borderRadius='$full' bg='$success500' mr='$1.5' />
                    <Text size='xs' color='$success700' fontWeight='$medium'>
                      {t('settings.deviceManagement.activeStatus')}
                    </Text>
                  </Box>
                )}
                
                {isCurrent && (
                  <Box bg='$primary100' px='$2' py='$0.5' borderRadius='$full'>
                    <Text size='xs' color='$primary700' fontWeight='$medium'>
                      {t('settings.deviceManagement.currentDevice')}
                    </Text>
                  </Box>
                )}
              </HStack>

              <Text size='xs' color='$textLight500' mt='$1'>
                {device.os || 'Unknown OS'} • {device.browser || 'Unknown Browser'}
              </Text>
              
              {device.lastActiveTime && (
                <Text size='xs' color='$textLight400' mt='$0.5'>
                  {format(new Date(device.lastActiveTime), 'Pp')}
                </Text>
              )}
            </VStack>
          </HStack>

          {!isCurrent && (
            <Pressable
              p='$2'
              onPress={() => handleDeleteDevice(device.id)}
              disabled={deleteDeviceMutation.isPending}
            >
              {deleteDeviceMutation.isPending ? (
                <Spinner size='small' />
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
      <Box p='$4'>
        <Text size='sm' color='$textLight500' mb='$4'>
          {t('settings.deviceManagement.description')}
        </Text>

        {isLoading ? (
          <HStack space='sm' justifyContent='center' py='$8'>
            <Spinner />
            <Text size='sm' color='$textLight500'>
              {t('settings.deviceManagement.loading')}
            </Text>
          </HStack>
        ) : devices && devices.length > 0 ? (
          <VStack space='xl'>
            {/* Active Devices */}
            {activeDevices.length > 0 && (
              <VStack space='sm'>
                <Text size='sm' fontWeight='$bold' color='$textLight400' textTransform='uppercase'>
                  {t('settings.deviceManagement.activeDevices')}
                </Text>
                {activeDevices.map(renderDeviceItem)}
              </VStack>
            )}

            {/* Inactive Devices */}
            {inactiveDevices.length > 0 && (
              <VStack space='sm'>
                <Text size='sm' fontWeight='$bold' color='$textLight400' textTransform='uppercase'>
                  {t('settings.deviceManagement.inactiveDevices')}
                </Text>
                {inactiveDevices.map(renderDeviceItem)}
              </VStack>
            )}

            <Divider my='$2' />

            <Button
              action='negative'
              variant='outline'
              onPress={handleLogoutOtherDevices}
              isDisabled={logoutOtherDevicesMutation.isPending || (devices.length <= 1)}
            >
              {logoutOtherDevicesMutation.isPending && <Spinner mr='$2' color='$error600' />}
              <ButtonIcon as={Ionicons} name='log-out-outline' mr='$2' color='$error600' />
              <ButtonText color='$error600'>
                {t('settings.deviceManagement.logoutOthers')}
              </ButtonText>
            </Button>
          </VStack>
        ) : (
          <Box py='$8' alignItems='center'>
            <Text size='sm' color='$textLight500'>
              {t('settings.deviceManagement.noDevices')}
            </Text>
          </Box>
        )}
      </Box>
    </SettingsDetailScreen>
  )
}
