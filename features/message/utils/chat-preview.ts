import { MessageType, MessageStatus } from '../schemas/message.schema'

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
  const prefix = isRevoked ? '' : data.isFromMe ? text.you : text.user

  let displayContent = data.content || ''
  if (data.type === MessageType.IMAGE || data.content === '[IMAGE]') {
    displayContent = text.type.image
  } else if (data.type === MessageType.FILE || data.content === '[FILE]') {
    displayContent = text.type.file
  }

  return isRevoked ? displayContent : `${prefix}: ${displayContent}`
}
