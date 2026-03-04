export const searchKeys = {
  all: ['search'] as const,
  users: (query: string) => [...searchKeys.all, 'users', query] as const,
  usersInfinite: (query: string) => [...searchKeys.all, 'users', 'infinite', query] as const
}
