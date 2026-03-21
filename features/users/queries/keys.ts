export const userKeys = {
  all: ['users'] as const,
  profile: () => [...userKeys.all, 'me'] as const,
  byId: (id: string) => [...userKeys.all, id] as const,
  search: (keyword: string) => [...userKeys.all, 'search', keyword] as const
}

export const blockKeys = {
  all: ['blocks'] as const,
  detail: (userId: string) => [...blockKeys.all, 'detail', userId] as const,
  myBlocks: () => [...blockKeys.all, 'my-blocks'] as const
}
