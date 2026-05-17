import { MessageType, MessageStatus } from '../schemas/message.schema'
import { parseBusinessCardContent } from './business-card'
import { parseGroupLinkContent } from './group-link'

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

  let displayContent = typeof data.content === 'string' ? data.content : ''
  
  if (displayContent) {
    const businessCard = parseBusinessCardContent(displayContent)
    if (businessCard) {
      displayContent = `[Danh thiếp] ${businessCard.name}`
    } else {
      const groupLink = parseGroupLinkContent(displayContent)
      if (groupLink) {
        displayContent = `[Link nhóm] ${groupLink.groupName || ''}`.trim()
      }
    }
  }

  if (!displayContent && data.type === MessageType.IMAGE) {
    displayContent = text.type.image
  } else if (displayContent && LEGACY_IMAGE_PLACEHOLDERS.has(displayContent)) {
    displayContent = text.type.image
  } else if (!displayContent && data.type === MessageType.VIDEO) {
    displayContent = text.type.video || '[Video]'
  } else if (displayContent && LEGACY_VIDEO_PLACEHOLDERS.has(displayContent)) {
    displayContent = text.type.video || '[Video]'
  } else if (!displayContent && data.type === MessageType.FILE) {
    displayContent = text.type.file
  } else if (displayContent && LEGACY_FILE_PLACEHOLDERS.has(displayContent)) {
    displayContent = text.type.file
  } else if (data.type === MessageType.FILE && displayContent && !displayContent.startsWith(text.type.file)) {
    displayContent = `${text.type.file} ${displayContent}`
  }

  if (isRevoked || !prefix) {
    return displayContent
  }
  return `${prefix}: ${displayContent}`
}
