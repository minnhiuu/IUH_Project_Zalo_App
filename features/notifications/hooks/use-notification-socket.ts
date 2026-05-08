import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react'
import { Client } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
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

          // 2. Invalidate caches. OS notifications are owned by FCM/Notifee, not WebSocket.
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

  useEffect(() => {
    if (user) {
      connectSingleton(user, queryClient)
    } else {
      disconnectSingleton()
    }
  }, [user, queryClient])

  return { connected }
}
