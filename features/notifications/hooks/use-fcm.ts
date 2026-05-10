import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Platform as RNPlatform, AppState, ToastAndroid } from 'react-native'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { useAuth } from '@/features/auth'
import { useRegisterDeviceMutation, useUnregisterDeviceMutation } from '@/features/notifications/queries/use-mutation'
import { Platform } from '@/constants'
import { useNotificationStore } from '@/store'
import { friendApi } from '@/features/friend/api/friend.api'
import { useTranslation } from 'react-i18next'
import i18n from '@/i18n'
import { secureStorage } from '@/utils/storageUtils'
import notifee, { EventType } from '@notifee/react-native'
import { displayChatNotification } from '@/tasks/notifee-background-handler'

const isChatNotification = (type?: string) => type === 'MESSAGE_DIRECT' || type === 'MESSAGE_GROUP'

function resolveFcmNotificationId(data: Record<string, string>) {
  if (isChatNotification(data.type) && data.conversationId) {
    return `CHAT_${data.conversationId}`
  }

  const stableId = data.notificationId || data.id || data.referenceId || data.requestId
  return stableId ? `${data.type || 'NOTIFICATION'}_${stableId}` : undefined
}

function resolveNotificationRecordId(data?: Record<string, unknown>) {
  return String(data?.notificationId || data?.id || data?.referenceId || data?.requestId || '')
}

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const { title, body } = notification.request.content
    const data = notification.request.content.data as Record<string, string>

    console.log('[FCM] Received foreground notification:', { title, body, data })

    // 1. Data-only Case (Manual Local Notification)
    const customTitle = data?.customTitle || data?.title
    const customBody = data?.customBody || data?.body

    if (!title && !body && customTitle) {
      // 1. Deduplication check
      const notiId = resolveFcmNotificationId(data) || Math.random().toString()
      if (processedFcmNotifications.has(notiId)) {
        return { shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: false, shouldShowList: false }
      }
      processedFcmNotifications.add(notiId)
      if (processedFcmNotifications.size > 50) {
        const first = processedFcmNotifications.values().next().value
        if (first) processedFcmNotifications.delete(first)
      }

      console.log('[FCM] Received payload:', JSON.stringify(data))
      await displayChatNotification(data)

      return {
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false
      }
    }

    // 2. Normal Notification Case (Already has Title/Body)
    if (title || body) {
      return {
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true
      }
    }

    return {
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
      options: { opensAppToForeground: true }
    },
    {
      identifier: 'decline',
      buttonTitle: i18n.t('friendRequests.actions.decline'),
      options: { isDestructive: true, opensAppToForeground: true }
    },
    {
      identifier: 'view_profile',
      buttonTitle: i18n.t('friendRequests.actions.viewProfile'),
      options: { opensAppToForeground: true }
    }
  ])
}

// Global set to track processed FCM notification IDs and prevent duplicates
const processedFcmNotifications = new Set<string>()

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

  const navigateFromNotificationData = useCallback(
    (rawData?: Record<string, unknown>) => {
      if (!rawData) return

      console.log('[FCM] Navigating from notification data:', JSON.stringify(rawData))

      const type = String(rawData.type || '')
      const conversationId = String(rawData.conversationId || rawData.conversation_id || '')
      
      if (isChatNotification(type) || conversationId) {
        // Fallback: if we have conversationId but type is missing or generic, treat as chat
        const targetId = conversationId || String(rawData.referenceId || '')
        if (!targetId) {
          console.warn('[FCM] Navigation failed: No conversationId found in data')
          return
        }

        console.log('[FCM] Navigating to chat:', targetId)

        router.push({
          pathname: '/chat/[id]' as any,
          params: {
            id: targetId,
            conversationId: targetId,
            name: String(rawData.conversationName || rawData.groupName || rawData.title || rawData.customTitle || ''),
            avatar: String(rawData.conversationAvatar || rawData.actorAvatar || '')
          }
        })
        return
      }

      router.push({
        pathname: '/' as any,
        params: {
          openNotifications: '1',
          highlightNotificationId: resolveNotificationRecordId(rawData),
          timestamp: Date.now().toString()
        }
      })
    },
    [router]
  )

  useEffect(() => {
    // Ensure high priority channel exists
    if (RNPlatform.OS === 'android') {
      Notifications.setNotificationChannelAsync('chat-messages', {
        name: 'Chat Messages',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        showBadge: true
      })
    }
    registerNotificationCategories().catch((e) => console.error('[FCM] Error registering categories:', e))
  }, [i18nInstance.language])

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setFcmToken(token)
          setFcmTokenStore(token)
          console.log('FCM Token:', token)
        }
      })
      .catch((e) => console.error('[FCM] Error in registerForPushNotificationsAsync:', e))

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
      const requestId = data.requestId || data.referenceId
      const notificationId = response.notification.request.identifier

      if (actionId === 'confirm' && requestId) {
        router.push({
          pathname: '/friend-requests',
          params: { autoAction: 'accept', requestId, timestamp: Date.now().toString() }
        })
      } else if (actionId === 'decline' && requestId) {
        router.push({
          pathname: '/friend-requests',
          params: { autoAction: 'decline', requestId, timestamp: Date.now().toString() }
        })
      } else if (actionId === 'view_profile' && data.actorId) {
        // @ts-ignore - Dynamic path for router.push
        router.push(`/user-profile/${data.actorId}`)
      } else if (actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
        navigateFromNotificationData(data)
      }

      // Xóa thông báo sau khi click
      Notifications.dismissNotificationAsync(notificationId).catch(() => {})

      console.log('Notification Response:', response)
    })

    const notifeeForegroundUnsubscribe = notifee.onForegroundEvent(async ({ type, detail }) => {
      const { notification, pressAction } = detail

      if (type === EventType.PRESS) {
        navigateFromNotificationData(notification?.data as Record<string, unknown> | undefined)
        if (notification?.id) {
          await notifee.cancelNotification(notification.id)
        }
        return
      }

      if (type !== EventType.ACTION_PRESS) return

      const referenceId = notification?.data?.referenceId as string
      const actorId = notification?.data?.actorId as string

      if (!referenceId) {
        console.warn('[NotificationActions] Missing referenceId in notification data')
        return
      }

      switch (pressAction?.id) {
        case 'accept_friend':
          try {
            await friendApi.acceptFriendRequest(referenceId)
            ToastAndroid.show('Accepted friend request', ToastAndroid.SHORT)
          } catch (error) {
            console.error('[NotificationActions] Failed to accept:', error)
          }
          break

        case 'decline_friend':
          try {
            await friendApi.declineFriendRequest(referenceId)
            ToastAndroid.show('Declined friend request', ToastAndroid.SHORT)
          } catch (error) {
            console.error('[NotificationActions] Failed to decline:', error)
          }
          break

        case 'view_profile':
          if (actorId) {
            router.push(`/other-profile/${actorId}`)
          }
          break
      }

      if (notification?.id) {
        await notifee.cancelNotification(notification.id)
      }
    })

    notifee.getInitialNotification().then((initialNotification) => {
      if (initialNotification?.notification?.data) {
        navigateFromNotificationData(initialNotification.notification.data as Record<string, unknown>)
      }
    }).catch((error) => console.error('[NotificationActions] Failed to read initial notification:', error))

    return () => {
      notifeeForegroundUnsubscribe()
      tokenRefreshListener.remove()
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [setFcmTokenStore, router, navigateFromNotificationData])

  const doRegister = useCallback(
    async (token: string) => {
      if (!user?.id || !token) return

      let deviceId = await secureStorage.getDeviceId()
      if (!deviceId) {
        // Fallback if not found in storage (should not happen if logged in correctly)
        deviceId = RNPlatform.OS === 'android' ? 'android-unknown' : 'ios-unknown'
      }

      console.log('[FCM] registerDevice: userId=', user.id, '| deviceId=', deviceId, '| token=***' + token.slice(-6))

      registerDevice(
        {
          token,
          platform: RNPlatform.OS === 'android' ? Platform.Android : Platform.iOS,
          deviceId: deviceId,
          locale: i18n.language
        },
        {
          onSuccess: () => console.log('[FCM] registerDevice success'),
          onError: (e) => console.log('[FCM] registerDevice error:', e)
        }
      )
    },
    [user?.id, registerDevice]
  )

  // Register on mount / user change / token change
  useEffect(() => {
    const token = fcmToken || storedFcmToken
    doRegister(token ?? '')
  }, [user?.id, fcmToken, doRegister, storedFcmToken, i18nInstance.language])

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
    await Notifications.setNotificationChannelAsync('friend_requests', {
      name: 'Friend Requests',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      showBadge: true
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
