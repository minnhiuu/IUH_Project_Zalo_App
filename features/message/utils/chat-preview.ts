import { MessageType, MessageStatus } from '../schemas/message.schema'
import { parseBusinessCardContent } from './business-card'
import { parseGroupLinkContent } from './group-link'
import { stripMentionsForPreview } from './mention'

interface PreviewData {
  content?: string | null
  isFromMe?: boolean | null
  isGroup?: boolean | null
  senderName?: string | null
  type?: MessageType | null
  status?: MessageStatus | null
  systemText?: string | null // Added this
}

const LEGACY_IMAGE_PLACEHOLDERS = new Set(['[IMAGE]'])
const LEGACY_VIDEO_PLACEHOLDERS = new Set(['[VIDEO]'])
const LEGACY_FILE_PLACEHOLDERS = new Set(['[FILE]'])

export const formatPreview = (
  data: PreviewData,
  text: { you: string; user: string; type: { image: string; video?: string; file: string } }
) => {
  if (!data.content && !data.type && !data.systemText) return ''

  const isRevoked = data.status === MessageStatus.REVOKED
  const isSystem =
    data.type === MessageType.SYSTEM ||
    data.type === MessageType.JOIN ||
    data.type === MessageType.LEAVE ||
    data.type === MessageType.CALL

  const prefix = isRevoked || isSystem ? '' : data.isFromMe ? text.you : data.isGroup ? data.senderName || text.user : ''

  if (isSystem && data.systemText) {
    return data.systemText
  }

  let displayContent = typeof data.content === 'string' ? data.content : ''
  displayContent = stripMentionsForPreview(displayContent)
  if (displayContent.startsWith('[GROUP_CALL]::')) {
    try {
      const payload = JSON.parse(displayContent.slice('[GROUP_CALL]::'.length))
      displayContent = payload.status === 'active' ? 'Cuộc gọi nhóm đang diễn ra...' : 'Cuộc gọi nhóm đã kết thúc'
    } catch {
      displayContent = 'Cuộc gọi nhóm'
    }
  } else if (displayContent) {
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

  if (data.type === MessageType.CALL) {
    displayContent = displayContent || '[Cuộc gọi]'
  } else if (data.type === MessageType.JOIN) {
    displayContent = displayContent || '[Gia nhập nhóm]'
  } else if (data.type === MessageType.LEAVE) {
    displayContent = displayContent || '[Rời nhóm]'
  } else if (data.type === MessageType.SYSTEM) {
    displayContent = data.systemText || displayContent || '[Thông báo]'
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

  if (isRevoked || isSystem || !prefix) {
    return displayContent
  }

  return `${prefix}: ${displayContent}`
}
