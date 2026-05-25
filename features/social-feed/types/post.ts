import type { ReactionType } from './reaction'

export interface SocialPostMedia {
  url: string
  type: 'IMAGE' | 'VIDEO'
}

interface SharedPostPreview {
  postId: string
  authorId?: string | null
  authorName: string
  authorAvatar?: string | null
  content: string
  media?: SocialPostMedia[]
}

export interface SocialPost {
  id: string
  authorId?: string | null
  authorName: string
  authorAvatar?: string | null
  postType?: 'FEED' | 'STORY' | 'REEL' | 'SHARE'
  postedAt: string
  visibility: 'Public' | 'Friends' | 'Private'
  content: string
  media?: SocialPostMedia[]
  sharedPost?: SharedPostPreview | null
  reactions: number
  topReactions?: ReactionType[]
  comments: number
  shares: number
  views?: number
  rootPostId?: string | null
  currentUserReaction?: ReactionType | null
}
