import notifee, {
  Event,
  EventType,
  AndroidCategory,
  AndroidImportance,
  AndroidInboxStyle,
  AndroidStyle,
  AndroidBigTextStyle,
  AndroidVisibility
} from '@notifee/react-native'
import { cacheDirectory, downloadAsync, getInfoAsync } from 'expo-file-system/legacy'

const CHAT_NOTIFICATION_PREFIX = 'CHAT_'

const isChatNotification = (type: string) => type === 'MESSAGE_DIRECT' || type === 'MESSAGE_GROUP'

const getChatNotificationId = (conversationId: string) => `${CHAT_NOTIFICATION_PREFIX}${conversationId}`

function toNotificationData(data: Record<string, unknown>): Record<string, string> {
  return Object.entries(data).reduce<Record<string, string>>((acc, [key, value]) => {
    if (key === 'dataString' || value == null) return acc
    acc[key] = typeof value === 'string' ? value : JSON.stringify(value)
    return acc
  }, {})
}

function resolveNotificationId(data: Record<string, string>, type: string) {
  if (isChatNotification(type) && data.conversationId) {
    return getChatNotificationId(data.conversationId)
  }

  const stableId = data.notificationId || data.id || data.referenceId || data.requestId
  if (stableId) return `${type || 'NOTIFICATION'}_${stableId}`

  return undefined
}

function createFallbackNotificationId(type: string) {
  const safeType = type || 'NOTIFICATION'
  return `${safeType}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function isValidLargeIcon(icon: string | number | object | undefined) {
  if (!icon) return false
  if (typeof icon !== 'string') return true
  return icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('file://') || icon.startsWith('content://')
}

function normalizeBody(value: string) {
  return value.replace(/\\n/g, '\n').trim()
}

function getBodyLines(value: string) {
  return normalizeBody(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function getCompactBody(lines: string[], fallback: string) {
  return lines.length > 0 ? lines[lines.length - 1] : fallback
}

function getAndroidStyle(type: string, bodyLines: string[], compactBody: string, title: string) {
  if (!isChatNotification(type)) return undefined

  return bodyLines.length > 1
    ? {
        type: AndroidStyle.INBOX,
        lines: bodyLines,
        title,
        summary: compactBody
      } satisfies AndroidInboxStyle
    : {
        type: AndroidStyle.BIGTEXT,
        text: compactBody
      } satisfies AndroidBigTextStyle
}

function getAndroidActions(type: string) {
  return type === 'FRIEND_REQUEST'
    ? [
        { title: 'Accept', pressAction: { id: 'accept_friend' } },
        { title: 'Decline', pressAction: { id: 'decline_friend' } },
        { title: 'View Profile', pressAction: { id: 'view_profile' } }
      ]
    : undefined
}

/**
 * Must be called outside any React component at the entry point.
 */
export function registerNotifeeBackgroundHandler() {
  notifee.onBackgroundEvent(async ({ type, detail }: Event) => {
    const { notification } = detail

    if (type === EventType.ACTION_PRESS || type === EventType.PRESS || type === EventType.DISMISSED) {
      if (notification?.id) {
        await notifee.cancelNotification(notification.id)
      }
    }
  })
}

/**
 * Display the backend-rendered push payload. Backend owns chat aggregation;
 * Android only reuses a stable local notification id so later pushes replace the same conversation.
 */
export async function displayChatNotification(rawData: Record<string, string>) {
  const data = toNotificationData(rawData)
  const title = data.customTitle || data.title || ''
  const body = normalizeBody(data.customBody || data.body || '')
  const type = data.type || ''

  if (!title && !body) return

  await notifee.createChannel({
    id: 'chat-messages-v4',
    name: 'Chat Messages',
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: 'default'
  })

  let largeIcon: string | number | object | undefined
  const avatarUrl = data.actorAvatar
  try {
    if (avatarUrl && avatarUrl.startsWith('http')) {
      const filename = avatarUrl.split('/').pop()?.split('?')[0] || 'avatar.jpg'
      const fileUri = `${cacheDirectory}${filename}`
      const fileInfo = await getInfoAsync(fileUri)
      largeIcon = fileInfo.exists ? fileUri : (await downloadAsync(avatarUrl, fileUri)).uri
    } else if (avatarUrl && avatarUrl.startsWith('file')) {
      largeIcon = avatarUrl
    } else {
      largeIcon = require('@/assets/images/logo.jpg')
    }
  } catch {
    largeIcon = require('@/assets/images/logo.jpg')
  }
  if (!isValidLargeIcon(largeIcon)) {
    console.log('[BGNotification] Skipping invalid largeIcon:', largeIcon)
    largeIcon = undefined
  }

  const notificationId = resolveNotificationId(data, type) || createFallbackNotificationId(type)
  const groupId = isChatNotification(type) && data.conversationId ? getChatNotificationId(data.conversationId) : undefined
  const bodyLines = getBodyLines(body)
  const compactBody = isChatNotification(type) ? getCompactBody(bodyLines, body) : body
  const style = getAndroidStyle(type, bodyLines, compactBody, title)
  const actions = getAndroidActions(type)

  if (isChatNotification(type)) {
    console.log('[BGNotification] Chat body lines:', JSON.stringify(bodyLines))
  }

  await notifee.displayNotification({
    id: notificationId,
    title,
    body: compactBody,
    data: {
      ...data,
      notificationId: data.notificationId || data.id || '',
      localNotificationId: notificationId,
      referenceId: data.referenceId || data.requestId || '',
      actorId: data.actorId || ''
    },
    android: {
      channelId: 'chat-messages-v4',
      importance: AndroidImportance.HIGH,
      category: AndroidCategory.MESSAGE,
      visibility: AndroidVisibility.PUBLIC,
      smallIcon: 'ic_launcher',
      ...(largeIcon ? { largeIcon } : {}),
      circularLargeIcon: true,
      color: '#0084FF',
      ...(groupId ? { groupId } : {}),
      ...(style ? { style } : {}),
      ...(actions ? { actions } : {}),
      pressAction: { id: 'default' }
    }
  })
}
