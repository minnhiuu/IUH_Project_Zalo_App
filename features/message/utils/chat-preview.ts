import { MessageType, MessageStatus } from '../schemas/message.schema'
import { parseBusinessCardContent } from './business-card'

interface PreviewData {
  content?: string | null
  isFromMe?: boolean | null
  senderName?: string | null
  type?: MessageType | null
  status?: MessageStatus | null
}

export const formatPreview = (
  data: PreviewData,
  text: { you: string; user: string; type: { image: string; file: string } }
) => {
  if (!data.content && !data.type) return ''

  const isRevoked = data.status === MessageStatus.REVOKED
  const senderLabel = data.senderName?.trim() || ''
  const prefix = isRevoked ? '' : data.isFromMe ? text.you : senderLabel

  let displayContent = typeof data.content === 'string' ? data.content : ''
  const businessCard = parseBusinessCardContent(displayContent)
  if (businessCard) {
    displayContent = `[Danh thiếp] ${businessCard.name}`
  }

  if (data.type === MessageType.IMAGE || displayContent === '[IMAGE]') {
    displayContent = text.type.image
  } else if (data.type === MessageType.FILE) {
    if (!displayContent || displayContent === '[FILE]') {
      displayContent = text.type.file
    } else {
      // Keep filename in conversation preview for file messages.
      displayContent = `${text.type.file} ${displayContent}`
    }
  }

  if (isRevoked) return displayContent
  if (!prefix) return displayContent
  return `${prefix}: ${displayContent}`
}
