import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useState, useEffect, useRef } from 'react'
import { Platform as RNPlatform } from 'react-native'
import Constants from 'expo-constants'
import { useAuth } from '@/features/auth'
import { useRegisterDeviceMutation, useUnregisterDeviceMutation } from '@/features/notifications/queries/use-mutation'
import { Platform } from '@/constants'
import { useNotificationStore } from '@/store'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
})

export const useFcm = () => {
  const { user } = useAuth()
  const { fcmToken: storedFcmToken, setFcmToken: setFcmTokenStore } = useNotificationStore()
  const { mutate: registerDevice } = useRegisterDeviceMutation()
  const { mutate: unregisterDevice } = useUnregisterDeviceMutation()

  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notifications.Notification | null>(null)
  const notificationListener = useRef<Notifications.Subscription | null>(null)
  const responseListener = useRef<Notifications.Subscription | null>(null)

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setFcmToken(token)
        setFcmTokenStore(token)
        console.log('FCM Token:', token)
      }
    })

    const tokenRefreshListener = Notifications.addPushTokenListener((newToken) => {
      const token = newToken.data
      setFcmToken(token)
      setFcmTokenStore(token)
      console.log('FCM Token Refreshed:', token)
    })

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification Response:', response)
    })

    return () => {
      tokenRefreshListener.remove()
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [setFcmTokenStore])

  useEffect(() => {
    console.log(
      '[FCM] registerDevice effect: userId=',
      user?.id,
      '| fcmToken=',
      fcmToken ? '***' + fcmToken.slice(-6) : null
    )
    if (user?.id && fcmToken) {
      registerDevice(
        {
          token: fcmToken,
          platform: RNPlatform.OS === 'android' ? Platform.Android : Platform.iOS
        },
        {
          onSuccess: () => console.log('[FCM] registerDevice success'),
          onError: (e) => console.error('[FCM] registerDevice error:', e)
        }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, fcmToken])

  const unregister = async () => {
    const token = fcmToken || storedFcmToken
    if (token) {
      unregisterDevice(token)
    }
  }

  return { fcmToken, notification, unregister }
}

async function registerForPushNotificationsAsync() {
  let token

  console.log('[FCM] isDevice:', Device.isDevice, '| OS:', RNPlatform.OS)

  if (RNPlatform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C'
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    console.log('[FCM] existingStatus:', existingStatus)
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
      console.log('[FCM] requestPermissions result:', status)
    }

    if (finalStatus !== 'granted') {
      console.warn('[FCM] Permission not granted, finalStatus:', finalStatus)
      alert('Failed to get push token for push notification!')
      return
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
      console.log('[FCM] projectId:', projectId)

      token = (await Notifications.getDevicePushTokenAsync()).data
      console.log('[FCM] Token obtained:', token ? '***' + token.slice(-6) : null)
    } catch (e) {
      console.error('[FCM] Error fetching FCM Token:', e)
    }
  } else {
    console.warn('[FCM] Not a physical device — push notifications unavailable')
  }

  return token
}
