export const friendKeys = {
  all: ['friendships'] as const,

  requests: () => [...friendKeys.all, 'requests'] as const,
  receivedRequests: () => [...friendKeys.requests(), 'received'] as const,
  sentRequests: () => [...friendKeys.requests(), 'sent'] as const,

  friends: () => [...friendKeys.all, 'friends'] as const,
  myFriends: () => [...friendKeys.friends(), 'my'] as const,

  status: (userId: string) => [...friendKeys.all, 'status', userId] as const,

  mutual: (userId: string) => [...friendKeys.all, 'mutual', userId] as const,
  mutualCount: (userId: string) => [...friendKeys.all, 'mutual-count', userId] as const,
}
