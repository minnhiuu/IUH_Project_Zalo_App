export const messageKeys = {
  all: ['messages'] as const,

  conversations: () => [...messageKeys.all, 'conversations'] as const,
  conversationList: (page: number = 0, size: number = 20) =>
    [...messageKeys.conversations(), 'list', page, size] as const,

  messages: (conversationId: string) => [...messageKeys.all, 'chat', conversationId] as const,
  messageList: (conversationId: string, page: number = 0, size: number = 20) =>
    [...messageKeys.messages(conversationId), page, size] as const,

  pins: (conversationId: string) => [...messageKeys.all, 'pins', conversationId] as const,
  groupMembers: (conversationId: string, query: string) =>
    [...messageKeys.all, 'group-members', conversationId, query] as const,
  groupAdmins: (conversationId: string) => [...messageKeys.all, 'group-admins', conversationId] as const,
  adminCandidates: (conversationId: string, query: string) =>
    [...messageKeys.all, 'admin-candidates', conversationId, query] as const,
  blockedMembers: (conversationId: string) => [...messageKeys.all, 'blocked-members', conversationId] as const,
  blockCandidates: (conversationId: string, query: string) =>
    [...messageKeys.all, 'block-candidates', conversationId, query] as const,
  joinRequests: (conversationId: string) => [...messageKeys.all, 'join-requests', conversationId] as const,
  joinPreview: (token: string) => [...messageKeys.all, 'join-preview', token] as const,
  friendsDirectory: (conversationId?: string | null) =>
    [...messageKeys.all, 'friends-directory', conversationId || 'none'] as const,
  searchMembers: (query: string, conversationId?: string | null) =>
    [...messageKeys.all, 'search-members', query, conversationId || 'none'] as const,
  myGroups: (query: string, sort: string, filter: string, page: number) =>
    [...messageKeys.all, 'my-groups', query, sort, filter, page] as const,

  partnerConversation: (partnerId: string) => [...messageKeys.conversations(), 'partner', partnerId] as const,

  media: (conversationId: string, types: string[]) =>
    [...messageKeys.all, 'media', conversationId, types.join(',')] as const
}
