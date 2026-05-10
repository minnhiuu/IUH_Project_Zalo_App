import type { SocialPost } from './post'

export interface StoryGroup {
  authorId: string
  authorName: string
  authorAvatar?: string | null
  stories: SocialPost[]
}
