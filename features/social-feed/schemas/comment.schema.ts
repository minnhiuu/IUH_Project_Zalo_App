import type { AuthorInfo } from '../api/post.api'
import type { ReactionType } from '../types/reaction'

export interface BackendCommentResponse {
  id: string
  postId: string
  authorInfo?: AuthorInfo | null
  parentId?: string | null
  content: string
  media?: Array<{
    url?: string | null
    type?: string | null
  }> | null
  replyDepth: number
  replyCount: number
  reactionCount: number
  currentUserReaction?: string | null
  isEdited?: boolean
  edited: boolean
  createdAt?: string | null
  lastModifiedAt?: string | null
}

export interface CommentMediaRequest {
  url: string
  type: 'IMAGE' | 'VIDEO'
}

export interface CreateCommentRequest {
  postId: string
  content: string
  parentId?: string
  media?: CommentMediaRequest[]
}

export interface UpdateCommentRequest {
  content: string
  media?: CommentMediaRequest[]
}

export interface SocialFeedComment {
  id: string
  postId: string
  authorId: string
  authorName: string
  authorAvatar?: string | null
  parentId?: string | null
  content: string
  createdAt: string
  reactions: number
  currentUserReaction?: ReactionType | null
  isEdited: boolean
  replyDepth: number
  replyCount: number
}

export interface ToggleReactionRequest {
  targetId: string
  targetType: 'POST' | 'COMMENT'
  type: ReactionType
}

export interface ReactionResponse {
  id: string
  authorInfo?: AuthorInfo | null
  targetId: string
  targetType: 'POST' | 'COMMENT'
  type: ReactionType
  active: boolean
  totalReactions: number
}
