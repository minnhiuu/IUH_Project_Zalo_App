import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query'
import { socialFeedApi, type BackendPostResponse } from '../api/post.api'
import { commentApi } from '../api/comment.api'
import {
  myPostsKeys,
  singlePostKeys,
  socialFeedCommentKeys,
  socialFeedKeys,
  socialReelKeys,
  socialStoryKeys
} from './keys'
import type { SocialPost } from '../types/post'
import type { StoryGroup } from '../types/story'
import type { BackendCommentResponse, SocialFeedComment } from '../schemas/comment.schema'

const toPostType = (postType?: string | null): SocialPost['postType'] => {
  switch ((postType ?? '').toUpperCase()) {
    case 'SHARE':
      return 'SHARE'
    case 'STORY':
      return 'STORY'
    case 'REEL':
      return 'REEL'
    case 'FEED':
    default:
      return 'FEED'
  }
}

const toVisibility = (visibility?: string | null): SocialPost['visibility'] => {
  switch ((visibility ?? '').toUpperCase()) {
    case 'FRIENDS':
      return 'Friends'
    case 'PRIVATE':
      return 'Private'
    case 'ALL':
    case 'PUBLIC':
    default:
      return 'Public'
  }
}

const normalizeHashtag = (tag: string) => (tag.startsWith('#') ? tag : `#${tag}`)

const pickDisplayContent = (post: BackendPostResponse) => {
  return post.content ?? post.sharedCaption ?? null
}

const toContent = (post: BackendPostResponse): string => {
  const content = pickDisplayContent(post)

  const sections = [content?.title, content?.caption, content?.description]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))

  const hashtags = (content?.hashtags ?? []).filter(Boolean).map(normalizeHashtag).join(' ')
  if (hashtags) {
    sections.push(hashtags)
  }

  return sections.join('\n\n') || ''
}

const getFallbackAuthorName = () => 'Unknown user'

type BackendAuthorInfo = {
  id?: string | null
  fullName?: string | null
  full_name?: string | null
  displayName?: string | null
  username?: string | null
  name?: string | null
  avatar?: string | null
  avatarUrl?: string | null
}

const normalizeAuthorInfo = (rawAuthor: BackendAuthorInfo | null | undefined) => {
  return {
    id: rawAuthor?.id ?? null,
    name:
      rawAuthor?.fullName?.trim() ||
      rawAuthor?.full_name?.trim() ||
      rawAuthor?.displayName?.trim() ||
      rawAuthor?.name?.trim() ||
      rawAuthor?.username?.trim() ||
      getFallbackAuthorName(),
    avatar: rawAuthor?.avatar ?? rawAuthor?.avatarUrl ?? null
  }
}

type BackendSharedPostPreview = NonNullable<BackendPostResponse['sharedPostPreview']>

const mapSharedPreview = (preview: BackendSharedPostPreview): SocialPost['sharedPost'] => {
  const primaryAuthor = normalizeAuthorInfo(preview.authorInfo)
  const fallbackAuthor = normalizeAuthorInfo(preview.author ?? preview.userInfo ?? preview.user)
  const resolvedAuthorName =
    (primaryAuthor.name !== getFallbackAuthorName() ? primaryAuthor.name : '') ||
    (fallbackAuthor.name !== getFallbackAuthorName() ? fallbackAuthor.name : '') ||
    getFallbackAuthorName()
  const resolvedAuthorAvatar = primaryAuthor.avatar ?? fallbackAuthor.avatar ?? null
  const resolvedAuthorId = primaryAuthor.id ?? fallbackAuthor.id ?? null

  const content = preview.content
  const sections = [content?.title, content?.caption, content?.description]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
  const hashtags = (content?.hashtags ?? []).filter(Boolean).map(normalizeHashtag).join(' ')
  if (hashtags) sections.push(hashtags)

  const media =
    preview.media
      ?.map((item) => {
        const mediaType = (item.type ?? '').toUpperCase()
        if (!item.url) return null
        return {
          url: item.url,
          type: mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE'
        } as const
      })
      .filter((item): item is { url: string; type: 'IMAGE' | 'VIDEO' } => Boolean(item)) ?? []

  return {
    postId: preview.postId,
    authorId: resolvedAuthorId,
    authorName: resolvedAuthorName,
    authorAvatar: resolvedAuthorAvatar,
    content: sections.join('\n\n') || '',
    media
  }
}

const mapPostToSocialPost = (post: BackendPostResponse): SocialPost => {
  const legacyPost = post as BackendPostResponse & {
    author?: BackendAuthorInfo | null
    userInfo?: BackendAuthorInfo | null
    user?: BackendAuthorInfo | null
    authorId?: string | null
    authorName?: string | null
    authorAvatar?: string | null
    mediaUrl?: string | null
    mediaType?: string | null
    imageUrl?: string | null
    videoUrl?: string | null
  }

  const primaryAuthor = normalizeAuthorInfo(post.authorInfo)
  const fallbackAuthor = normalizeAuthorInfo(legacyPost.author ?? legacyPost.userInfo ?? legacyPost.user)

  const authorId = primaryAuthor.id ?? legacyPost.authorId ?? fallbackAuthor.id
  const authorName =
    (primaryAuthor.name !== getFallbackAuthorName() ? primaryAuthor.name : '') ||
    legacyPost.authorName?.trim() ||
    (fallbackAuthor.name !== getFallbackAuthorName() ? fallbackAuthor.name : '') ||
    getFallbackAuthorName()
  const authorAvatar = primaryAuthor.avatar ?? legacyPost.authorAvatar ?? fallbackAuthor.avatar ?? null

  const media =
    (post.media
      ?.map((item) => {
        const mediaType = (item.type ?? '').toUpperCase()
        if (!item.url) {
          return null
        }

        return {
          url: item.url,
          type: mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE'
        } as const
      })
      .filter((item): item is { url: string; type: 'IMAGE' | 'VIDEO' } => Boolean(item)) ?? []) ||
    []

  if (media.length === 0) {
    const fallbackUrl = legacyPost.mediaUrl || legacyPost.imageUrl || legacyPost.videoUrl
    if (fallbackUrl) {
      media.push({
        url: fallbackUrl,
        type:
          (legacyPost.mediaType ?? '').toUpperCase() === 'VIDEO' || Boolean(legacyPost.videoUrl)
            ? 'VIDEO'
            : 'IMAGE'
      })
    }
  }

  const normalizedTopReactions = (post.stats?.topReactions ?? [])
    .map((type) => (type ?? '').toUpperCase())
    .filter((type): type is NonNullable<SocialPost['topReactions']>[number] =>
      ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'].includes(type)
    )

  const sharedPost = post.sharedPostPreview ? mapSharedPreview(post.sharedPostPreview) : null

  return {
    id: post.id,
    authorId,
    authorName,
    authorAvatar,
    postType: toPostType(post.postType),
    postedAt: post.uploadedAt ?? '',
    visibility: toVisibility(post.visibility),
    content: toContent(post),
    media,
    reactions: post.stats?.reactionCount ?? 0,
    topReactions: normalizedTopReactions,
    comments: post.stats?.commentCount ?? 0,
    shares: post.stats?.shareCount ?? 0,
    sharedPost,
    rootPostId: post.rootPostId ?? null,
    currentUserReaction: (post.currentUserReaction?.toUpperCase() ?? null) as SocialPost['currentUserReaction']
  }
}

const mapCommentToSocialComment = (comment: BackendCommentResponse): SocialFeedComment => {
  return {
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorInfo?.id ?? '',
    authorName: comment.authorInfo?.fullName?.trim() || getFallbackAuthorName(),
    authorAvatar: comment.authorInfo?.avatar ?? null,
    parentId: comment.parentId ?? null,
    content: comment.content,
    createdAt: comment.createdAt ?? '',
    reactions: comment.reactionCount ?? 0,
    currentUserReaction: (comment.currentUserReaction?.toUpperCase() ??
      null) as SocialFeedComment['currentUserReaction'],
    isEdited: comment.edited ?? false,
    replyDepth: comment.replyDepth ?? 0,
    replyCount: comment.replyCount ?? 0
  }
}

type BackendStoryGroup = {
  author?: BackendAuthorInfo | null
  authorInfo?: { id?: string; fullName?: string; avatar?: string | null } | null
  userInfo?: BackendAuthorInfo | null
  user?: BackendAuthorInfo | null
  stories?: BackendPostResponse[] | null
}

const mapBackendGroupToStoryGroup = (group: BackendStoryGroup): StoryGroup => {
  const stories = (group.stories ?? []).map(mapPostToSocialPost).filter((story) => story.media.length > 0)
  const firstStory = stories[0]
  const author = normalizeAuthorInfo(group.authorInfo ?? group.author ?? group.userInfo ?? group.user)
  const authorName =
    (author.name !== getFallbackAuthorName() ? author.name : '') ||
    (firstStory?.authorName && firstStory.authorName !== getFallbackAuthorName() ? firstStory.authorName : '') ||
    getFallbackAuthorName()

  return {
    authorId: author.id ?? firstStory?.authorId ?? '',
    authorName,
    authorAvatar: author.avatar ?? firstStory?.authorAvatar ?? null,
    stories
  }
}

const groupStoriesByAuthor = (stories: SocialPost[]): StoryGroup[] => {
  const groupMap = new Map<string, StoryGroup>()

  stories.forEach((story) => {
    const key = story.authorId || story.authorName || story.id
    const existing = groupMap.get(key)

    if (existing) {
      existing.stories.push(story)
      return
    }

    groupMap.set(key, {
      authorId: story.authorId ?? '',
      authorName: story.authorName,
      authorAvatar: story.authorAvatar,
      stories: [story]
    })
  })

  return Array.from(groupMap.values())
}

const getStoryResponseItems = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    const objectPayload = payload as { content?: unknown; data?: unknown }

    if (Array.isArray(objectPayload.content)) {
      return objectPayload.content
    }

    if (Array.isArray(objectPayload.data)) {
      return objectPayload.data
    }
  }

  return []
}

const parseStoryGroups = (payload: unknown): StoryGroup[] => {
  const items = getStoryResponseItems(payload)

  if (items.length === 0) {
    return []
  }

  const hasGroupedShape = items.some(
    (item) => Boolean(item && typeof item === 'object' && 'stories' in (item as Record<string, unknown>))
  )

  if (hasGroupedShape) {
    return (items as BackendStoryGroup[])
      .map(mapBackendGroupToStoryGroup)
      .filter((group) => group.stories.length > 0)
  }

  const storyPosts = (items as BackendPostResponse[])
    .map(mapPostToSocialPost)
    .filter((story) => story.media.length > 0)

  return groupStoriesByAuthor(storyPosts)
}

export const getSocialFeedPostsQueryOptions = (page = 0, size = 20) =>
  queryOptions({
    queryKey: socialFeedKeys.list(page, size),
    queryFn: async () => {
      const response = await socialFeedApi.getFeedAndSharePosts(page, size)
      return (response.data?.data ?? []).map(mapPostToSocialPost)
    }
  })

export const getInfiniteSocialFeedPostsQueryOptions = (size = 20) =>
  infiniteQueryOptions({
    queryKey: socialFeedKeys.all,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await socialFeedApi.getFeedAndSharePosts(pageParam, size)
      return {
        posts: (response.data?.data ?? []).map(mapPostToSocialPost),
        nextPage: pageParam + 1
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage
  })

export const getSocialFeedCommentsQueryOptions = (
  postId: string,
  page = 0,
  size = 20,
  sortBy = 'NEWEST'
) =>
  queryOptions({
    queryKey: socialFeedCommentKeys.list(postId, page, size, sortBy),
    queryFn: async () => {
      const response = await commentApi.getRootCommentsByPost(postId, page, size, sortBy)
      const payload = response.data?.data
      const rawComments = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.content)
            ? payload.content
            : []

      return rawComments.map(mapCommentToSocialComment)
    }
  })

export const getSocialFeedCommentRepliesQueryOptions = (postId: string, commentId: string) =>
  queryOptions({
    queryKey: socialFeedCommentKeys.replies(postId, commentId),
    queryFn: async () => {
      const response = await commentApi.getRepliesByComment(commentId)
      return (response.data?.data ?? []).map(mapCommentToSocialComment)
    }
  })

export const getSocialStoriesQueryOptions = (page = 0, size = 20) =>
  queryOptions({
    queryKey: socialStoryKeys.list(page, size),
    queryFn: async () => {
      const response = await socialFeedApi.getStoryPosts(page, size)
      return parseStoryGroups(response.data?.data)
    }
  })

export const getInfiniteSocialStoriesQueryOptions = (size = 20) =>
  infiniteQueryOptions({
    queryKey: socialStoryKeys.all,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await socialFeedApi.getStoryPosts(pageParam, size)
      return {
        groups: parseStoryGroups(response.data?.data),
        nextPage: pageParam + 1
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage
  })

export const getSocialReelsQueryOptions = (page = 0, size = 20) =>
  queryOptions({
    queryKey: socialReelKeys.list(page, size),
    queryFn: async () => {
      const response = await socialFeedApi.getReelPosts(page, size)
      return (response.data?.data ?? []).map(mapPostToSocialPost)
    }
  })

export const getInfiniteSocialReelsQueryOptions = (size = 20) =>
  infiniteQueryOptions({
    queryKey: socialReelKeys.all,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await socialFeedApi.getReelPosts(pageParam, size)
      return {
        posts: (response.data?.data ?? []).map(mapPostToSocialPost),
        nextPage: pageParam + 1
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage
  })

export const getInfiniteMyPostsQueryOptions = (size = 20) =>
  infiniteQueryOptions({
    queryKey: myPostsKeys.all,
    queryFn: async ({ pageParam = 0 }) => {
      const response = await socialFeedApi.getMyPosts(pageParam, size)
      return {
        posts: (response.data?.data?.content ?? []).map(mapPostToSocialPost),
        nextPage: pageParam + 1
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage
  })

export const getPostByIdQueryOptions = (postId: string) =>
  queryOptions({
    queryKey: singlePostKeys.byId(postId),
    queryFn: async () => {
      const response = await socialFeedApi.getPostById(postId)
      const post = response.data?.data
      if (!post) {
        throw new Error('Post not found')
      }

      const mappedPost = mapPostToSocialPost(post)

      if (post.sharedPostPreview) {
        mappedPost.sharedPost = mapSharedPreview(post.sharedPostPreview)
      }

      return mappedPost
    }
  })
