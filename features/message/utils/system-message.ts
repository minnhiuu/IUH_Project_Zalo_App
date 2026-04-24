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

    const hasResolvedAction = !!action

  // Action mapping
  switch (action) {
    case 'PIN_MESSAGE':
    case 'PIN':
      return isActorMe 
        ? safeT('messages.system.pin.self', { defaultValue: 'Bạn đã ghim tin nhắn' })
        : safeT('messages.system.pin.actor', { actor: actorName, defaultValue: `${actorName} đã ghim tin nhắn` })
    
    case 'UNPIN_MESSAGE':
        case 'PROMOTE_ADMIN':
          if (targetIds[0] === currentUserId) {
            return safeT('messages.system.promote.self', { defaultValue: 'Bạn đã được bổ nhiệm làm phó nhóm' })
          }
          return isActorMe
            ? safeT('messages.system.promote.actor_self', { target: firstTargetName, defaultValue: `Bạn đã bổ nhiệm ${firstTargetName} làm phó nhóm` })
            : safeT('messages.system.promote.actor', { actor: actorName, target: firstTargetName, defaultValue: `${actorName} đã bổ nhiệm ${firstTargetName} làm phó nhóm` })

        case 'DEMOTE_ADMIN':
          if (targetIds[0] === currentUserId) {
            return safeT('messages.system.demote.self', { defaultValue: 'Bạn không còn là phó nhóm' })
          }
          return isActorMe
            ? safeT('messages.system.demote.actor_self', { target: firstTargetName, defaultValue: `Bạn đã thu hồi quyền phó nhóm của ${firstTargetName}` })
            : safeT('messages.system.demote.actor', { actor: actorName, target: firstTargetName, defaultValue: `${actorName} đã thu hồi quyền phó nhóm của ${firstTargetName}` })

        case 'TRANSFER_OWNER':
          if (targetIds[0] === currentUserId) {
            return safeT('messages.system.transfer.self', { defaultValue: 'Bạn đã trở thành trưởng nhóm' })
          }
          return isActorMe
            ? safeT('messages.system.transfer.actor_self', { target: firstTargetName, defaultValue: `Bạn đã chuyển quyền trưởng nhóm cho ${firstTargetName}` })
            : safeT('messages.system.transfer.actor', { actor: actorName, target: firstTargetName, defaultValue: `${actorName} đã chuyển quyền trưởng nhóm cho ${firstTargetName}` })

        case 'UPDATE_SETTINGS':
          if (payload.setting === 'memberCanSendMessages') {
            const allowed = payload.value !== false
            return allowed
              ? (isActorMe
                  ? safeT('messages.system.update_settings.send_all.self', { defaultValue: 'Bạn cho phép tất cả thành viên gửi tin nhắn trong nhóm' })
                  : safeT('messages.system.update_settings.send_all.actor', { actor: actorName, defaultValue: `${actorName} cho phép tất cả thành viên gửi tin nhắn trong nhóm` }))
              : (isActorMe
                  ? safeT('messages.system.update_settings.send_admin.self', { defaultValue: 'Bạn chỉ cho phép trưởng/phó nhóm gửi tin nhắn trong nhóm' })
                  : safeT('messages.system.update_settings.send_admin.actor', { actor: actorName, defaultValue: `${actorName} chỉ cho phép trưởng/phó nhóm gửi tin nhắn trong nhóm` }))
          }
          if (payload.setting === 'membershipApprovalEnabled') {
            return payload.value === true
              ? safeT('messages.system.update_settings.approval_on', { defaultValue: 'Hình thức tham gia nhóm được thay đổi thành "Cần phê duyệt".' })
              : safeT('messages.system.update_settings.approval_off', { defaultValue: 'Hình thức tham gia nhóm được thay đổi thành "Không cần phê duyệt".' })
          }
          if (payload.setting === 'joinByLinkEnabled') {
            return payload.value === true
              ? safeT('messages.system.update_settings.join_by_link_on', { defaultValue: 'Đã cho phép tham gia nhóm bằng link mời' })
              : safeT('messages.system.update_settings.join_by_link_off', { defaultValue: 'Đã tắt tham gia nhóm bằng link mời' })
          }
          break

        case 'JOIN_BY_LINK':
          return isActorMe
            ? safeT('messages.system.join_by_link.self', { defaultValue: 'Bạn đã tham gia nhóm bằng link' })
            : safeT('messages.system.join_by_link.actor', { actor: actorName, defaultValue: `${actorName} đã tham gia nhóm bằng link` })

        case 'GENERATE_JOIN_LINK':
          return isActorMe
            ? safeT('messages.system.generate_link.self', { defaultValue: 'Bạn đã tạo link nhóm' })
            : safeT('messages.system.generate_link.actor', { actor: actorName, defaultValue: `${actorName} đã tạo link nhóm` })

        case 'REFRESH_JOIN_LINK':
          return isActorMe
            ? safeT('messages.system.refresh_link.self', { defaultValue: 'Bạn đã làm mới link nhóm' })
            : safeT('messages.system.refresh_link.actor', { actor: actorName, defaultValue: `${actorName} đã làm mới link nhóm` })

        case 'JOIN_REQUEST_CREATED':
          return isActorMe
            ? safeT('messages.system.join_request.created.self', { defaultValue: 'Bạn đã gửi yêu cầu tham gia nhóm' })
            : safeT('messages.system.join_request.created.actor', { actor: actorName, defaultValue: `${actorName} đã gửi yêu cầu tham gia nhóm` })

        case 'JOIN_REQUEST_APPROVED':
          if (targetIds[0] === currentUserId) {
            return safeT('messages.system.join_request.approved.self', { actor: actorName, defaultValue: `${actorName} đã duyệt yêu cầu tham gia của bạn` })
          }
          return isActorMe
            ? safeT('messages.system.join_request.approved.actor_self', { target: firstTargetName, defaultValue: `Bạn đã duyệt yêu cầu tham gia của ${firstTargetName}` })
            : safeT('messages.system.join_request.approved.actor', { actor: actorName, target: firstTargetName, defaultValue: `${actorName} đã duyệt yêu cầu tham gia của ${firstTargetName}` })

        case 'JOIN_REQUEST_REJECTED':
          return safeT('messages.system.join_request.rejected', { defaultValue: 'Yêu cầu tham gia nhóm đã bị từ chối' })

        case 'BLOCK_MEMBER':
          if (targetIds[0] === currentUserId) {
            return safeT('messages.system.block.self_target', { actor: actorName, defaultValue: `Bạn đã bị ${actorName} chặn khỏi nhóm` })
          }
          return isActorMe
            ? safeT('messages.system.block.actor_self', { target: firstTargetName, defaultValue: `Bạn đã chặn ${firstTargetName} khỏi nhóm` })
            : safeT('messages.system.block.actor', { actor: actorName, target: firstTargetName, defaultValue: `${actorName} đã chặn ${firstTargetName} khỏi nhóm` })

        case 'BLOCKED_FROM_JOINING':
          return safeT('messages.system.blocked_from_joining', { target: firstTargetName, defaultValue: `${firstTargetName} đã bị chặn tham gia nhóm` })

        case 'SELF_BLOCKED_FROM_JOINING':
          return payload?.joinLinkEnabled === true
            ? safeT('messages.system.self_blocked_from_joining.with_link', { target: firstTargetName, defaultValue: `${firstTargetName} đã bị chặn tham gia lại qua link mời` })
            : safeT('messages.system.self_blocked_from_joining.without_link', { target: firstTargetName, defaultValue: `${firstTargetName} đã bị chặn tham gia lại nhóm` })

        case 'ADD_MEMBERS_FAILED':
          return safeT('messages.system.add_failed', { count: Number(payload.failedCount || targetIds.length || 0), defaultValue: `Không thể thêm ${Number(payload.failedCount || targetIds.length || 0)} thành viên vào nhóm` })

        case 'DISBAND_GROUP':
          return safeT('messages.system.disband', { defaultValue: 'Nhóm đã bị giải tán' })
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
      
      if (!hasResolvedAction) {
        const contentText = typeof message.content === 'string' ? message.content : ''
        if (contentText && contentText !== '[SYSTEM]' && contentText !== 'SYSTEM') {
          return contentText
        }
      }
      
      return safeT('messages.system.default', { defaultValue: '[Thông báo]' })
  }
}
