export const friendKeys = {
  all: ['friendships'] as const,

  requests: () => [...friendKeys.all, 'requests'] as const,
  receivedRequests: (page: number = 0, size: number = 10) => [...friendKeys.requests(), 'received', page, size] as const,
  sentRequests: (page: number = 0, size: number = 10) => [...friendKeys.requests(), 'sent', page, size] as const,

  friends: () => [...friendKeys.all, 'friends'] as const,
  myFriends: (page: number = 0, size: number = 10) => [...friendKeys.friends(), 'my', page, size] as const,

  status: (userId: string) => [...friendKeys.all, 'status', userId] as const,

  mutual: (userId: string) => [...friendKeys.all, 'mutual', userId] as const,
  mutualCount: (userId: string) => [...friendKeys.all, 'mutual-count', userId] as const,
}
