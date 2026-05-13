export const searchKeys = {
  all: ['search'] as const,
  users: (query: string) => [...searchKeys.all, 'users', query] as const,
  usersInfinite: (query: string) => [...searchKeys.all, 'users', 'infinite', query] as const,
  contactsInfinite: (query: string, isGroup?: boolean) =>
    [...searchKeys.all, 'contacts', 'infinite', query, { isGroup }] as const,
  messagesInfinite: (query: string, filters: readonly string[] = []) =>
    [...searchKeys.all, 'messages', 'infinite', query, filters.join(',')] as const,
  conversationMessagesInfinite: (conversationId: string, query: string, filters: readonly string[] = []) =>
    [...searchKeys.all, 'messages', 'conversation', conversationId, query, filters.join(',')] as const,
  messageGroupsInfinite: (query: string, filters: readonly string[] = []) =>
    [...searchKeys.all, 'message-groups', 'infinite', query, filters.join(',')] as const,
  filesInfinite: (query: string) => [...searchKeys.all, 'files', 'infinite', query] as const,
  recentItems: () => [...searchKeys.all, 'recent', 'items'] as const,
  recentQueries: () => [...searchKeys.all, 'recent', 'queries'] as const
}
