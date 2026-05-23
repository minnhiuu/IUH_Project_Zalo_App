export const getBadgeConfig = (type: string) => {
  switch (type) {
    case 'MESSAGE_DIRECT':
      return { icon: 'chatbubble' as const, color: '#22c55e' }
    case 'POST_LIKE':
    case 'COMMENT_LIKE':
      return { icon: 'heart' as const, color: '#0068FF' }
    case 'POST_PUBLISHED':
      return { icon: 'chatbubble' as const, color: '#0068FF' }
    case 'FRIEND_REQUEST':
      return { icon: 'person-add' as const, color: '#0068FF' }
    case 'FRIEND_ACCEPT':
      return { icon: 'people' as const, color: '#0068FF' }
    case 'PHOTO_POST':
    case 'ALBUM_POST':
      return { icon: 'image' as const, color: '#22c55e' }
    case 'VIDEO_POST':
      return { icon: 'videocam' as const, color: '#ec4899' }
    case 'DOB':
      return { icon: 'gift' as const, color: '#ec4899' }
    case 'CALL':
      return { icon: 'call' as const, color: '#22c55e' }
    case 'POST_COMMENT':
    case 'COMMENT_REPLY':
      return { icon: 'chatbubble-ellipses' as const, color: '#22c55e' }
    case 'POST_TAG':
    case 'POST_MENTION':
    case 'COMMENT_MENTION':
      return { icon: 'at' as const, color: '#0068FF' }
    case 'SYSTEM':
      return { icon: 'shield-checkmark' as const, color: '#0068FF' }
    case 'DLQ_ALERT':
      return { icon: 'alert-circle' as const, color: '#ef4444' }
    case 'CONTENT_REMOVED':
      return { icon: 'trash' as const, color: '#ef4444' }
    case 'CONTENT_HIDDEN':
      return { icon: 'eye-off' as const, color: '#f97316' }
    case 'USER_WARNED':
      return { icon: 'alert' as const, color: '#f97316' }
    default:
      return { icon: 'notifications' as const, color: '#6b7280' }
  }
}
