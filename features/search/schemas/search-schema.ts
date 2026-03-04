export type RecentSearch = {
  id: string
  type: 'user' | 'keyword'
  displayName: string
  avatar?: string | null
  timestamp: number
}
