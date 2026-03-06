import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Platform as RNPlatform, AppState } from 'react-native'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { useAuth } from '@/features/auth'
import { useRegisterDeviceMutation, useUnregisterDeviceMutation } from '@/features/notifications/queries/use-mutation'
import { Platform } from '@/constants'
import { useNotificationStore } from '@/store'
import { friendApi } from '@/features/friend/api/friend.api'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { title, body } = notification.request.content
    const data = notification.request.content.data as Record<string, string>

    console.log('[FCM] Received foreground notification:', { title, body, data })

    // 1. Trường hợp Data-only (Silent/Data-only message từ Server)
    // Chúng ta tự tạo Local Notification để hiện đầy đủ Avatar + Nút bấm
    if (!title && !body && data?.title) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body || '',
          data: data as unknown as Record<string, unknown>,
          categoryIdentifier: data.categoryIdentifier || 'friend_request',
          sound: 'default',
          // Ảnh đại diện cho iOS/Rich Media
          attachments: data.actorAvatar ? [{ identifier: 'avatar', url: data.actorAvatar, type: 'image' }] : []
        },
        trigger: null
      })

      // Không cần hiện cảnh báo mặc định của hệ thống nữa vì đã tự hiện ở trên
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false
      }
    }

    // 2. Trường hợp đã có Title/Body từ Server (Web/iOS system) -> Hiện luôn
    if (title || body) {
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
      }
    }

    return {
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: false,
      shouldShowList: false
    }
  }
})

async function registerNotificationCategories() {
  await Notifications.setNotificationCategoryAsync('friend_request', [
    {
      identifier: 'confirm',
      buttonTitle: i18n.t('friendRequests.actions.accept'),
      options: { opensAppToForeground: false }
    },
    {
      identifier: 'decline',
      buttonTitle: i18n.t('friendRequests.actions.decline'),
      options: { isDestructive: true, opensAppToForeground: false }
    },
    {
      identifier: 'view_profile',
      buttonTitle: i18n.t('friendRequests.actions.viewProfile'),
      options: { opensAppToForeground: true }
    }
  ])
}

export const useFcm = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { i18n: i18nInstance } = useTranslation()
  const { fcmToken: storedFcmToken, setFcmToken: setFcmTokenStore } = useNotificationStore()
  const { mutate: registerDevice } = useRegisterDeviceMutation()
  const { mutate: unregisterDevice } = useUnregisterDeviceMutation()

  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notifications.Notification | null>(null)
  const notificationListener = useRef<Notifications.Subscription | null>(null)
  const responseListener = useRef<Notifications.Subscription | null>(null)

  useEffect(() => {
    registerNotificationCategories()
  }, [i18nInstance.language])

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
      const actionId = response.actionIdentifier
      const data = response.notification.request.content.data as Record<string, string>

      if (actionId === 'confirm' && data.requestId) {
        friendApi.acceptFriendRequest(data.requestId).catch(() => {})
      } else if (actionId === 'decline' && data.requestId) {
        friendApi.declineFriendRequest(data.requestId).catch(() => {})
      } else if (actionId === 'view_profile' && data.actorId) {
        // @ts-ignore - Dynamic path for router.push
        router.push(`/user-profile/${data.actorId}`)
      }

      console.log('Notification Response:', response)
    })

    return () => {
      tokenRefreshListener.remove()
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [setFcmTokenStore, router])

  const doRegister = useCallback(
    (token: string) => {
      if (!user?.id || !token) return
      console.log('[FCM] registerDevice: userId=', user.id, '| token=***' + token.slice(-6))
      registerDevice(
        {
          token,
          platform: RNPlatform.OS === 'android' ? Platform.Android : Platform.iOS
        },
        {
          onSuccess: () => console.log('[FCM] registerDevice success'),
          onError: (e) => console.error('[FCM] registerDevice error:', e)
        }
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id]
  )

  // Register on mount / user change / token change
  useEffect(() => {
    const token = fcmToken || storedFcmToken
    doRegister(token ?? '')
  }, [user?.id, fcmToken, doRegister, storedFcmToken])

  // Re-register whenever app comes back to foreground (e.g. after DB wipe)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        const token = fcmToken || storedFcmToken
        if (token) doRegister(token)
      }
    })
    return () => sub.remove()
  }, [fcmToken, storedFcmToken, doRegister])

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
