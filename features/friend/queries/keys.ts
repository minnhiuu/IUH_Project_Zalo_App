export const friendKeys = {
  all: ['friendships'] as const,

  requests: () => [...friendKeys.all, 'requests'] as const,
  receivedRequests: (page: number = 0, size: number = 10) =>
    [...friendKeys.requests(), 'received', page, size] as const,
  sentRequests: (page: number = 0, size: number = 10) => [...friendKeys.requests(), 'sent', page, size] as const,

  friends: () => [...friendKeys.all, 'friends'] as const,
  myFriends: (page: number = 0, size: number = 10) => [...friendKeys.friends(), 'my', page, size] as const,

  status: (userId: string) => [...friendKeys.all, 'status', userId] as const,
  batchStatus: (userIds: string[]) => [...friendKeys.all, 'batch-status', ...userIds] as const,

  mutual: (userId: string) => [...friendKeys.all, 'mutual', userId] as const,
  mutualCount: (userId: string) => [...friendKeys.all, 'mutual-count', userId] as const,

  suggestions: () => [...friendKeys.all, 'suggestions'] as const,
  unifiedSuggestions: (page: number = 0, size: number = 20) =>
    [...friendKeys.suggestions(), 'unified', page, size] as const,
  graphSuggestions: (page: number = 0, size: number = 20) => [...friendKeys.suggestions(), 'graph', page, size] as const,
  contactSuggestions: (page: number = 0, size: number = 20) =>
    [...friendKeys.suggestions(), 'contacts', page, size] as const
}
