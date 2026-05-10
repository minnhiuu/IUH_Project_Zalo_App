import { MessageType, MessageStatus } from '../schemas/message.schema'

interface PreviewData {
  content?: string | null
  isFromMe?: boolean | null
  isGroup?: boolean | null
  senderName?: string | null
  type?: MessageType | null
  status?: MessageStatus | null
}

const LEGACY_IMAGE_PLACEHOLDERS = new Set(['[IMAGE]'])
const LEGACY_VIDEO_PLACEHOLDERS = new Set(['[VIDEO]'])
const LEGACY_FILE_PLACEHOLDERS = new Set(['[FILE]'])

export const formatPreview = (
  data: PreviewData,
  text: { you: string; user: string; type: { image: string; video?: string; file: string } }
) => {
  if (!data.content && !data.type) return ''

  const isRevoked = data.status === MessageStatus.REVOKED
  const prefix = isRevoked ? '' : data.isFromMe ? text.you : data.isGroup ? data.senderName || text.user : ''

  let displayContent = data.content || ''
  if (!displayContent && data.type === MessageType.IMAGE) {
    displayContent = text.type.image
  } else if (data.content && LEGACY_IMAGE_PLACEHOLDERS.has(data.content)) {
    displayContent = text.type.image
  } else if (!displayContent && data.type === MessageType.VIDEO) {
    displayContent = text.type.video || '[Video]'
  } else if (data.content && LEGACY_VIDEO_PLACEHOLDERS.has(data.content)) {
    displayContent = text.type.video || '[Video]'
  } else if (!displayContent && data.type === MessageType.FILE) {
    displayContent = text.type.file
  } else if (data.content && LEGACY_FILE_PLACEHOLDERS.has(data.content)) {
    displayContent = text.type.file
  }

  if (isRevoked || !prefix) {
    return displayContent
  }

  return `${prefix}: ${displayContent}`
}
