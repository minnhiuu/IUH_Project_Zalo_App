import { z } from 'zod'
import { SearchType } from '@/constants/enum'

export const recentSearchRequestSchema = z.object({
  id: z.string().min(1, 'search.validation.idRequired'),
  name: z.string().min(1, 'search.validation.nameRequired'),
  avatar: z.string().nullable().optional(),
  type: z.enum([SearchType.User, SearchType.Group, SearchType.Keyword])
})

export type RecentSearchRequest = z.infer<typeof recentSearchRequestSchema>

export type RecentSearchResponse = {
  id: string
  name: string
  avatar: string | null
  type: SearchType
  timestamp: number
}
