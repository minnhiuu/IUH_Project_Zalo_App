import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useState, useEffect, useRef } from 'react'
import { Platform as RNPlatform } from 'react-native'
import Constants from 'expo-constants'
import { useAuth } from '@/features/auth'
import { useRegisterDeviceMutation, useUnregisterDeviceMutation } from '@/features/notifications/queries/use-mutation'
import { Platform } from '@/constants'

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
  const { user, setFcmToken: setFcmTokenStore, fcmToken: fcmTokenStore } = useAuth()
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
    if (user?.id && fcmToken) {
      registerDevice({
        userId: user.id,
        token: fcmToken,
        platform: RNPlatform.OS === 'android' ? Platform.Android : Platform.iOS
      })
    }
  }, [user?.id, fcmToken, registerDevice])

  const unregister = async () => {
    const token = fcmToken || fcmTokenStore
    if (user?.id && token) {
      unregisterDevice({ userId: user.id, token })
    }
  }

  return { fcmToken, notification, unregister }
}

async function registerForPushNotificationsAsync() {
  let token

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
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!')
      return
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId

      if (!projectId) {
        console.warn('Project ID not found. Ensure EAS is configured.')
      }

      token = (await Notifications.getDevicePushTokenAsync()).data
    } catch (e) {
      console.error('Error fetching FCM Token:', e)
    }
  } else {
    console.log('Must use physical device for Push Notifications')
  }

  return token
}
