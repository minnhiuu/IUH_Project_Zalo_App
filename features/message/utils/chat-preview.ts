import { MessageType, MessageStatus } from '../schemas/message.schema'
import { parseBusinessCardContent } from './business-card'
import { parseGroupLinkContent } from './group-link'

interface PreviewData {
  content?: string | null
  isFromMe?: boolean | null
  senderName?: string | null
  type?: MessageType | null
  status?: MessageStatus | null
  systemText?: string | null // Added this
}

export const formatPreview = (
  data: PreviewData,
  text: { you: string; user: string; type: { image: string; file: string } }
) => {
  if (!data.content && !data.type && !data.systemText) return ''

  const isRevoked = data.status === MessageStatus.REVOKED
  const senderLabel = data.senderName?.trim() || ''
  const isSystem =
    data.type === MessageType.SYSTEM ||
    data.type === MessageType.JOIN ||
    data.type === MessageType.LEAVE ||
    data.type === MessageType.CALL

  const prefix = isRevoked || isSystem ? '' : data.isFromMe ? text.you : senderLabel

  if (isSystem && data.systemText) {
    return data.systemText
  }

  let displayContent = typeof data.content === 'string' ? data.content : ''
  if (displayContent.startsWith('[GROUP_CALL]::')) {
    try {
      const payload = JSON.parse(displayContent.slice('[GROUP_CALL]::'.length))
      displayContent = payload.status === 'active' ? 'Cuộc gọi nhóm đang diễn ra...' : 'Cuộc gọi nhóm đã kết thúc'
    } catch {
      displayContent = 'Cuộc gọi nhóm'
    }
  } else {
    const businessCard = parseBusinessCardContent(displayContent)
    if (businessCard) {
      displayContent = `[Danh thiếp] ${businessCard.name}`
    }
  }

  const groupLink = parseGroupLinkContent(displayContent)
  if (groupLink) {
    displayContent = `[Link nhóm] ${groupLink.groupName || ''}`.trim()
  }

  if (data.type === MessageType.IMAGE || displayContent === '[IMAGE]') {
    displayContent = text.type.image
  } else if (data.type === MessageType.FILE) {
    if (!displayContent || displayContent === '[FILE]') {
      displayContent = text.type.file
    } else {
      displayContent = `${text.type.file} ${displayContent}`
    }
  } else if (data.type === MessageType.CALL) {
    displayContent = displayContent || '[Cuộc gọi]'
  } else if (data.type === MessageType.JOIN) {
    displayContent = displayContent || '[Gia nhập nhóm]'
  } else if (data.type === MessageType.LEAVE) {
    displayContent = displayContent || '[Rời nhóm]'
  } else if (data.type === MessageType.SYSTEM) {
    displayContent = data.systemText || displayContent || '[Thông báo]'
  }

  if (isRevoked || isSystem) return displayContent
  if (!prefix) return displayContent
  return `${prefix}: ${displayContent}`
}
