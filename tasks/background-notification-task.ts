import * as TaskManager from 'expo-task-manager'
import * as Notifications from 'expo-notifications'

export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK'

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) {
    console.error('[BGNotification] Task error:', error)
    return
  }

  const payload = data as any
  console.log('[BGNotification] Received background payload:', JSON.stringify(payload, null, 2))

  // 1. Kiểm tra xem hệ thống đã hiển thị thông báo chưa
  // Nếu có khối 'notification' (mặc định cho Web) -> Bỏ qua
  if (payload.notification) {
    console.log('[BGNotification] System notification detected, skipping.')
    return
  }

  // 2. Xử lý Data-only (Gửi từ Java cho Android/iOS)
  const remoteData = (payload.data || payload || {}) as Record<string, string>
  const title = remoteData.title || ''
  const body = remoteData.body || ''

  if (!title && !body) {
    console.log('[BGNotification] No content in data-only message, skipping.')
    return
  }

  // Tự tạo Local Notification để hiện được cả Avatar và 3 Nút bấm
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title || 'Thông báo mới',
      body: body,
      data: remoteData as unknown as Record<string, unknown>,
      categoryIdentifier: remoteData.categoryIdentifier || 'friend_request',
      sound: 'default',
      // PHỤC HỒI ICON: Đưa avatar vào attachments để hiện thumbnail bên phải
      attachments: remoteData.actorAvatar ? [{ identifier: 'avatar', url: remoteData.actorAvatar, type: 'image' }] : []
    },
    trigger: null
  })
})

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => {})
