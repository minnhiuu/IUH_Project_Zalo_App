import { MessageSearchResponse } from '../schemas'

export function resolveMessageResultTitle(item: MessageSearchResponse) {
  const participantTitle = item.participantNames?.filter(Boolean).join(', ')
  return item.senderName || item.conversationName || participantTitle || ''
}

export function resolveMessageResultAvatar(item: MessageSearchResponse) {
  const participantAvatar = item.participantAvatars?.find(Boolean)
  return item.senderAvatar || item.conversationAvatar || participantAvatar || null
}
