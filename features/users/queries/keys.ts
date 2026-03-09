export const userKeys = {
  all: ['users'] as const,
  profile: () => [...userKeys.all, 'me'] as const,
  byId: (id: string) => [...userKeys.all, id] as const,
  search: (keyword: string) => [...userKeys.all, 'search', keyword] as const
}

export const blockKeys = {
  all: ['blocks'] as const,
  myBlocks: () => [...blockKeys.all, 'my'] as const,
  detail: (userId: string) => [...blockKeys.all, 'detail', userId] as const,
  check: (userId: string) => [...blockKeys.all, 'check', userId] as const
}
