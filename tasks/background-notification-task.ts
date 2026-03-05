import * as TaskManager from 'expo-task-manager'
import * as Notifications from 'expo-notifications'

export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK'

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) {
    console.error('[BGNotification] Task error:', error)
    return
  }

  const payload = data as any
  const notification = payload.notification
  const remoteData = (notification?.request?.content?.data || payload.data || payload || {}) as Record<string, string>

  const title = notification?.request?.content?.title || remoteData.title || ''
  const body = notification?.request?.content?.body || remoteData.body || ''

  if (!title && !body) {
    console.log('[BGNotification] No content to display, skipping local notification')
    return
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: remoteData as unknown as Record<string, unknown>,
      categoryIdentifier: remoteData.categoryIdentifier || undefined,
      sound: 'default',
      attachments: remoteData.actorAvatar ? [{ identifier: 'avatar', url: remoteData.actorAvatar, type: 'image' }] : []
    },
    trigger: null
  })
})

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => {})
