import * as TaskManager from 'expo-task-manager'
import * as Notifications from 'expo-notifications'
import { BackgroundNotificationResult } from 'expo-notifications/build/BackgroundNotificationTasksModule.types'
import { displayChatNotification } from './notifee-background-handler'

export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK'

TaskManager.defineTask<Notifications.NotificationTaskPayload>(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[BGNotification] Task error:', error)
    return BackgroundNotificationResult.Failed
  }

  const payload = data as any
  console.log('[BGNotification] Received background payload:', JSON.stringify(payload, null, 2))

  // If the OS already handled a visible notification, we might want to skip displaying another one via Notifee.
  // However, for data-only messages, payload.notification will be undefined.
  if (payload.notification?.title || payload.notification?.body) {
    console.log('[BGNotification] System notification with content detected, skipping Notifee to avoid duplicates.')
    return BackgroundNotificationResult.NoData
  }

  let remoteData = (payload.data || payload || {}) as Record<string, string>
  if (typeof remoteData.dataString === 'string') {
    try {
      remoteData = JSON.parse(remoteData.dataString) as Record<string, string>
    } catch (parseError) {
      console.error('[BGNotification] Failed to parse dataString:', parseError)
      return BackgroundNotificationResult.Failed
    }
  }

  const type = remoteData.type || ''
  const title = remoteData.customTitle || remoteData.title || ''
  const body = remoteData.customBody || remoteData.body || ''

  if (!title && !body) {
    console.log('[BGNotification] No content in data-only message, skipping.')
    return BackgroundNotificationResult.NoData
  }

  console.log(`[BGNotification] Showing ${type} notification via notifee...`)

  await displayChatNotification(remoteData)
  return BackgroundNotificationResult.NewData
})

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch((error) => {
  console.error('[BGNotification] Failed to register background task:', error)
})
