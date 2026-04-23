import { MessageResponse, MessageType, ConversationMemberResponse } from '../schemas'
import { TFunction } from 'i18next'

export interface SystemMetadata {
  action?: string
  actorName?: string
  targetIds?: string[]
  payload?: Record<string, any>
}

export function getSystemMessageText(
  message: MessageResponse,
  currentUserId: string | undefined,
  t: TFunction,
  members: ConversationMemberResponse[] = []
): string {
  if (message.type !== MessageType.SYSTEM && 
      message.type !== MessageType.JOIN && 
      message.type !== MessageType.LEAVE && 
      message.type !== MessageType.CALL) {
    return ''
  }

  const safeT = (key: string, options?: any) => {
    return t(key, options) || options?.defaultValue || key
  }
  const safeMembers = Array.isArray(members) ? members : []
  
  const meta = (message.metadata || (message as any).lastMessageMetadata || (message as any).latestMessageMetadata || {}) as SystemMetadata
  let action = (meta.action || (message as any).action || (message as any).lastMessageAction || '').toUpperCase()
  const payload = (meta.payload || (message as any).payload || (message as any).lastMessagePayload || {}) as Record<string, any>
  const targetIds = Array.isArray(meta.targetIds) ? meta.targetIds : (Array.isArray((message as any).targetIds) ? (message as any).targetIds : [])
  
  // Fallback: Try to extract action from content if metadata is missing
  if (!action && typeof message.content === 'string') {
    const upperContent = message.content.toUpperCase()
    if (upperContent.includes('PIN_MESSAGE') || upperContent === 'PIN') action = 'PIN_MESSAGE'
    else if (upperContent.includes('UNPIN_MESSAGE') || upperContent === 'UNPIN') action = 'UNPIN_MESSAGE'
    else if (upperContent.includes('ADD_MEMBERS') || upperContent === 'ADD') action = 'ADD_MEMBERS'
    else if (upperContent.includes('REMOVE_MEMBER') || upperContent === 'REMOVE') action = 'REMOVE_MEMBER'
    else if (upperContent.includes('LEAVE_GROUP') || upperContent === 'LEAVE') action = 'LEAVE_GROUP'
    else if (upperContent.includes('REVOKE_MESSAGE') || upperContent === 'REVOKE' || upperContent === 'DELETE_MESSAGE') action = 'REVOKE_MESSAGE'
    else if (upperContent.includes('JOIN')) action = 'JOIN_GROUP'
    else if (upperContent.includes('CREATE_GROUP') || upperContent.includes('GROUP_CREATED')) action = 'GROUP_CREATED'
  }
  
  const resolveDisplayName = (userId?: string | null, fallbackName?: string | null) => {
    if (userId && userId === currentUserId) return safeT('messages.you', { defaultValue: 'Bạn' })
    return fallbackName || safeT('messages.user', { defaultValue: 'Người dùng' })
  }

  const actorName = resolveDisplayName(message.senderId, meta.actorName || message.senderName)
  const payloadTargetNames = Array.isArray(payload.targetNames) ? payload.targetNames : []
  
  const targetNamesRaw = (
    targetIds.length > 0
      ? targetIds.map((id: string, index: number) => {
          const byMember = safeMembers.find((m) => m.userId === id)?.fullName
          const byPayload = payloadTargetNames[index]
          return resolveDisplayName(id, byMember || byPayload)
        })
      : payloadTargetNames.map((name: string) => resolveDisplayName(undefined, name))
  ).filter(Boolean) as string[]

  const formatCompactNames = (names: string[]) => {
    if (names.length <= 2) return names.join(', ')
    return `${names.slice(0, 2).join(', ')} ${safeT('messages.system.andOthers', { count: names.length - 2, defaultValue: `và ${names.length - 2} người khác` })}`
  }

  const targetNamesCompact = formatCompactNames(targetNamesRaw)
  const firstTargetName = targetNamesRaw[0] || safeT('messages.user', { defaultValue: 'Người dùng' })
  const isActorMe = message.senderId === currentUserId

  // Check if content already contains formatted text
  if (typeof message.content === 'string' && (message.content.includes('|') || message.content.length > 30)) {
     const contentStr = message.content
     if (isActorMe && contentStr.includes(message.senderName || '')) {
        return contentStr.replace(message.senderName || '', safeT('messages.you', { defaultValue: 'Bạn' }))
     }
     return contentStr
  }

  // Action mapping
  switch (action) {
    case 'PIN_MESSAGE':
    case 'PIN':
      return isActorMe 
        ? safeT('messages.system.pin.self', { defaultValue: 'Bạn đã ghim tin nhắn' })
        : safeT('messages.system.pin.actor', { actor: actorName, defaultValue: `${actorName} đã ghim tin nhắn` })
    
    case 'UNPIN_MESSAGE':
    case 'UNPIN':
      return isActorMe 
        ? safeT('messages.system.unpin.self', { defaultValue: 'Bạn đã bỏ ghim tin nhắn' })
        : safeT('messages.system.unpin.actor', { actor: actorName, defaultValue: `${actorName} đã bỏ ghim tin nhắn` })

    case 'ADD_MEMBERS':
    case 'ADD':
      return isActorMe
        ? safeT('messages.system.add.self', { targets: targetNamesCompact, defaultValue: `Bạn đã thêm ${targetNamesCompact} vào nhóm` })
        : safeT('messages.system.add.actor', { actor: actorName, targets: targetNamesCompact, defaultValue: `${actorName} đã thêm ${targetNamesCompact} vào nhóm` })

    case 'REMOVE_MEMBER':
    case 'REMOVE':
      if (targetIds[0] === currentUserId) return safeT('messages.system.remove.self_target', { actor: actorName, defaultValue: `Bạn đã bị ${actorName} mời ra khỏi nhóm` })
      return isActorMe
        ? safeT('messages.system.remove.self_actor', { target: firstTargetName, defaultValue: `Bạn đã mời ${firstTargetName} ra khỏi nhóm` })
        : safeT('messages.system.remove.actor', { actor: actorName, target: firstTargetName, defaultValue: `${actorName} đã mời ${firstTargetName} ra khỏi nhóm` })

    case 'LEAVE_GROUP':
    case 'LEAVE':
      return isActorMe
        ? safeT('messages.system.leave.self', { defaultValue: 'Bạn đã rời nhóm' })
        : safeT('messages.system.leave.actor', { actor: actorName, defaultValue: `${actorName} đã rời nhóm` })

    case 'UPDATE_NAME':
      return isActorMe
        ? safeT('messages.system.update_name.self', { name: payload.newName, defaultValue: `Bạn đã đổi tên nhóm thành ${payload.newName}` })
        : safeT('messages.system.update_name.actor', { actor: actorName, name: payload.newName, defaultValue: `${actorName} đã đổi tên nhóm thành ${payload.newName}` })

    case 'UPDATE_AVATAR':
      return isActorMe
        ? safeT('messages.system.update_avatar.self', { defaultValue: 'Bạn đã thay đổi ảnh đại diện nhóm' })
        : safeT('messages.system.update_avatar.actor', { actor: actorName, defaultValue: `${actorName} đã thay đổi ảnh đại diện nhóm` })

    case 'GROUP_CREATED':
    case 'CREATE_GROUP':
      return isActorMe
        ? safeT('messages.system.create_group.self', { defaultValue: 'Bạn đã tạo nhóm' })
        : safeT('messages.system.create_group.actor', { actor: actorName, defaultValue: `${actorName} đã tạo nhóm` })

    case 'REVOKE_MESSAGE':
    case 'REVOKE':
    case 'DELETE_MESSAGE':
      return isActorMe
        ? safeT('messages.system.revoke.self', { defaultValue: 'Bạn đã thu hồi một tin nhắn' })
        : safeT('messages.system.revoke.actor', { actor: actorName, defaultValue: `${actorName} đã thu hồi một tin nhắn` })

    default:
      if (message.type === MessageType.CALL) {
         return safeT('messages.system.call', { defaultValue: '[Cuộc gọi]' })
      }
      if (message.type === MessageType.JOIN || action === 'JOIN_GROUP') {
        return isActorMe 
          ? safeT('messages.system.join.self', { defaultValue: 'Bạn đã tham gia nhóm' })
          : safeT('messages.system.join.actor', { actor: actorName, defaultValue: `${actorName} đã tham gia nhóm` })
      }
      if (message.type === MessageType.LEAVE) {
        return isActorMe
          ? safeT('messages.system.leave.self', { defaultValue: 'Bạn đã rời nhóm' })
          : safeT('messages.system.leave.actor', { actor: actorName, defaultValue: `${actorName} đã rời nhóm` })
      }
      
      const contentText = typeof message.content === 'string' ? message.content : ''
      if (contentText && contentText !== '[SYSTEM]' && contentText !== 'SYSTEM') {
        return contentText
      }
      
      return safeT('messages.system.default', { defaultValue: '[Thông báo]' })
  }
}
