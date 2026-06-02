import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react'
import { Client } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { AppState } from 'react-native'
import { useAuthStore } from '@/store'
import { getAccessToken } from '@/lib/http'
import apiConfig from '@/config/apiConfig'
import { notificationKeys } from '../queries/keys'
import type { NotificationSocketMessage } from '../schemas/notification.schema'

// ────────── Singleton state ──────────
let singletonClient: Client | null = null
let singletonConnected = false
let singletonUserId: string | null = null
const listeners = new Set<() => void>()

const notifyListeners = () => listeners.forEach((l) => l())
const getConnected = () => singletonConnected
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

const getWsUrl = () => {
  const base = apiConfig.socketUrl.replace(/^http/, 'ws')
  return `${base}/ws/websocket`
}

const connectSingleton = async (user: any, queryClient: any) => {
  if (singletonClient?.active && singletonUserId === user.id) return
  if (singletonClient?.active && singletonUserId !== user.id) {
    singletonClient.deactivate()
    singletonClient = null
  }

  const token = await getAccessToken()
  if (!token) return

  singletonUserId = user.id

  const client = new Client({
    brokerURL: getWsUrl(),
    reconnectDelay: 5000,
    connectHeaders: {
      Authorization: `Bearer ${token}`
    },
    forceBinaryWSFrames: true,
    appendMissingNULLonIncoming: true,
    onConnect: () => {
      singletonConnected = true
      notifyListeners()
      console.log('[NotificationSocket] Connected')

      // ────────── /user/queue/notifications ──────────
      client.subscribe('/user/queue/notifications', (payload) => {
        try {
          const data = JSON.parse(payload.body) as NotificationSocketMessage
          console.log('[NotificationSocket] Received message:', data)

          // 1. Handle Cleanup/Delete action
          if ('action' in data && data.action === 'DELETE') {
            console.log('[NotificationSocket] Cleaning up notification:', data.referenceId)
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: notificationKeys.all })
            }, 3000)
            return
          }

          // 2. Intercept incoming call notifications
          const type = !('action' in data) ? data.type : undefined
          const callPayload = !('action' in data) ? data.payload : undefined
          const sessionId = callPayload?.sessionId || (!('action' in data) && (data as any).sessionId)
          
          if (type === 'CALL' && sessionId) {
            console.log('[NotificationSocket] Intercepted CALL notification', callPayload)
            import('@/store/use-call-store').then(({ useCallStore }) => {
              const callStore = useCallStore.getState()
              if (!callStore.isRinging) {
                callStore.setIncomingCall({
                  sessionId: String(sessionId),
                  roomId: callPayload?.roomId || (!('action' in data) && (data as any).roomId) || '',
                  callerId: callPayload?.callerId || (!('action' in data) && (data as any).callerId) || '',
                  callerName: callPayload?.callerName || (!('action' in data) && data.title) || 'Cuộc gọi đến',
                  callerAvatar: callPayload?.callerAvatar || (!('action' in data) && (data as any).callerAvatar),
                  isGroup: false,
                  callKind: callPayload?.callKind || (!('action' in data) && (data as any).callKind) || 'video'
                })
              }
            })

            // Also display a local notification so user sees it if app is backgrounded
            const callerName = callPayload?.callerName || (!('action' in data) && data.title) || 'Cuộc gọi đến'
            const callKindLabel = (callPayload?.callKind || 'video') === 'video' ? '📹 Video' : '📞 Thoại'
            import('expo-constants').then((ConstantsMod) => {
              const Constants = ConstantsMod.default || ConstantsMod
              if (Constants.executionEnvironment === 'storeClient') return
              import('@/tasks/notifee-background-handler')
                .then((mod) => {
                  const displayFn = mod.displayChatNotification || (mod.default && mod.default.displayChatNotification)
                  if (displayFn) {
                    displayFn({
                      title: `${callKindLabel} - Cuộc gọi đến`,
                      body: `${callerName} đang gọi cho bạn`,
                      type: 'CALL',
                      sessionId: String(sessionId),
                      roomId: callPayload?.roomId || '',
                      callerId: callPayload?.callerId || '',
                      callerName: callerName,
                      callerAvatar: callPayload?.callerAvatar || '',
                      callKind: callPayload?.callKind || 'video',
                      notificationId: `CALL_${sessionId}`
                    } as any).catch((err: any) => console.error('[NotificationSocket] Error displaying call notification:', err))
                  }
                })
                .catch(() => {})
            }).catch(() => {})
            return // Skip normal notification display since we show ringing UI
          }

          // 3. Display local notification if not silent
          if (!('action' in data) && !data.silent) {
            import('expo-constants').then((ConstantsMod) => {
              const Constants = ConstantsMod.default || ConstantsMod
              if (Constants.executionEnvironment === 'storeClient') {
                console.log('[NotificationSocket] Skipping Notifee in Expo Go')
                return
              }
              
              import('@/tasks/notifee-background-handler')
                .then((mod) => {
                  const displayFn = mod.displayChatNotification || (mod.default && mod.default.displayChatNotification)
                  if (displayFn) {
                    displayFn({
                      ...data.payload,
                      title: data.title,
                      body: data.body,
                      type: data.type,
                      notificationId: data.id,
                      referenceId: data.referenceId
                    } as any).catch((err: any) => console.error('[NotificationSocket] Error displaying notification:', err))
                  } else {
                    console.warn('[NotificationSocket] displayChatNotification is not available in the imported module.')
                  }
                })
                .catch((err) => {
                  console.error('[NotificationSocket] Failed to import notifee handler:', err)
                })
            }).catch(err => console.error(err))
          }

          // 3. Invalidate caches.
          queryClient.invalidateQueries({ queryKey: notificationKeys.all })
        } catch (error) {
          console.error('[NotificationSocket] Error handling notification:', error)
        }
      })
    },
    onDisconnect: () => {
      singletonConnected = false
      notifyListeners()
      console.log('[NotificationSocket] Disconnected')
    },
    debug: __DEV__ ? (msg) => console.log('[Notification STOMP]', msg) : undefined
  })

  client.activate()
  singletonClient = client
}

const disconnectSingleton = () => {
  if (singletonClient) {
    singletonClient.deactivate()
    singletonClient = null
    singletonUserId = null
    singletonConnected = false
    notifyListeners()
  }
}

export const useNotificationSocket = () => {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const connected = useSyncExternalStore(subscribe, getConnected, getConnected)

  const userRef = useRef(user)
  const queryClientRef = useRef(queryClient)

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    queryClientRef.current = queryClient
  }, [queryClient])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        const currentUser = userRef.current
        if (currentUser) {
          void connectSingleton(currentUser, queryClientRef.current)
        }
        return
      }

      if (nextState === 'inactive' || nextState === 'background') {
        disconnectSingleton()
      }
    })

    return () => subscription.remove()
  }, [])

  useEffect(() => {
    if (user) {
      connectSingleton(user, queryClient)
    } else {
      disconnectSingleton()
    }
  }, [user, queryClient])

  return { connected }
}
