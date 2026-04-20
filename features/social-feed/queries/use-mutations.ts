import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { commentApi } from '../api/comment.api'
import { interactionApi } from '../api/interaction.api'
import { socialFeedApi, type CreatePostRequest } from '../api/post.api'
import { socialFeedCommentKeys, socialFeedKeys, socialStoryKeys } from './keys'
import type { CreateCommentRequest, UpdateCommentRequest } from '../schemas/comment.schema'
import type { ReactionType } from '../types/reaction'
import type { SocialPost } from '../types/post'

type FeedPage = {
  posts: SocialPost[]
  nextPage: number
}

type FeedInfiniteData = InfiniteData<FeedPage, unknown>

const patchFeedPost = (
  data: FeedInfiniteData | undefined,
  postId: string,
  updater: (post: SocialPost) => SocialPost
): FeedInfiniteData | undefined => {
  if (!data) return data

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      posts: page.posts.map((post) => (post.id === postId ? updater(post) : post))
    }))
  }
}

const invalidateSocialFeedCommentData = async (queryClient: ReturnType<typeof useQueryClient>, postId: string) => {
  await queryClient.invalidateQueries({ queryKey: socialFeedCommentKeys.byPost(postId) })
}

export const useCreateSocialPostMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePostRequest) => socialFeedApi.createPost(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialFeedKeys.all })
      await queryClient.invalidateQueries({ queryKey: socialStoryKeys.all })
    }
  })
}

export const useCreateSocialCommentMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<CreateCommentRequest, 'postId'> & { postId?: string }) =>
      commentApi.createComment({
        postId,
        ...payload
      }),
    onSuccess: async () => {
      await invalidateSocialFeedCommentData(queryClient, postId)
    }
  })
}

export const useUpdateSocialCommentMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, payload }: { commentId: string; payload: UpdateCommentRequest }) =>
      commentApi.updateComment(commentId, payload),
    onSuccess: async () => {
      await invalidateSocialFeedCommentData(queryClient, postId)
    }
  })
}

export const useDeleteSocialCommentMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => commentApi.deleteComment(commentId),
    onSuccess: async () => {
      await invalidateSocialFeedCommentData(queryClient, postId)
    }
  })
}

export const useToggleSocialCommentReactionMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, type }: { commentId: string; type: ReactionType }) =>
      commentApi.toggleReaction({
        targetId: commentId,
        targetType: 'COMMENT',
        type
      }),
    onSuccess: async () => {
      await invalidateSocialFeedCommentData(queryClient, postId)
    }
  })
}

export const useDeleteSocialCommentReactionMutation = (postId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => commentApi.deleteReaction(commentId, 'COMMENT'),
    onSuccess: async () => {
      await invalidateSocialFeedCommentData(queryClient, postId)
    }
  })
}

/**
 * Fire-and-forget mutation to record a VIEW interaction for a story.
 * Idempotent on the backend — safe to call multiple times for the same user+post.
 */
export const useRecordStoryViewMutation = () =>
  useMutation({
    mutationFn: (postId: string) => socialFeedApi.recordStoryView(postId)
  })

export const useDislikePostMutation = () => {
  return useMutation({
    mutationFn: (postId: string) => interactionApi.dislikePost(postId)
  })
}

export const useToggleSocialPostReactionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: ReactionType }) =>
      commentApi.toggleReaction({
        targetId: postId,
        targetType: 'POST',
        type
      }),
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: socialFeedKeys.all })

      const previousFeed = queryClient.getQueryData<FeedInfiniteData>(socialFeedKeys.all)

      queryClient.setQueryData<FeedInfiniteData>(socialFeedKeys.all, (oldData) =>
        patchFeedPost(oldData, postId, (post) => {
          const previousReaction = post.currentUserReaction ?? null
          const isAddingNewReaction = !previousReaction

          return {
            ...post,
            currentUserReaction: type,
            reactions: isAddingNewReaction ? post.reactions + 1 : post.reactions,
            topReactions: [type, ...(post.topReactions ?? []).filter((reaction) => reaction !== type)].slice(0, 3)
          }
        })
      )

      return { previousFeed }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(socialFeedKeys.all, context.previousFeed)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialFeedKeys.all })
    }
  })
}

export const useDeleteSocialPostReactionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) => commentApi.deleteReaction(postId, 'POST'),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: socialFeedKeys.all })

      const previousFeed = queryClient.getQueryData<FeedInfiniteData>(socialFeedKeys.all)

      queryClient.setQueryData<FeedInfiniteData>(socialFeedKeys.all, (oldData) =>
        patchFeedPost(oldData, postId, (post) => {
          const hadReaction = Boolean(post.currentUserReaction)

          return {
            ...post,
            currentUserReaction: null,
            reactions: hadReaction ? Math.max(0, post.reactions - 1) : post.reactions
          }
        })
      )

      return { previousFeed }
    },
    onError: (_error, _postId, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(socialFeedKeys.all, context.previousFeed)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: socialFeedKeys.all })
    }
  })
}
