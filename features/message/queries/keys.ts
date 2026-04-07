export const messageKeys = {
  all: ['messages'] as const,

  conversations: () => [...messageKeys.all, 'conversations'] as const,
  conversationList: (page: number = 0, size: number = 20) =>
    [...messageKeys.conversations(), 'list', page, size] as const,

  messages: (conversationId: string) => [...messageKeys.all, 'chat', conversationId] as const,
  messageList: (conversationId: string, page: number = 0, size: number = 20) =>
    [...messageKeys.messages(conversationId), page, size] as const,

  partnerConversation: (partnerId: string) =>
    [...messageKeys.conversations(), 'partner', partnerId] as const,
}
