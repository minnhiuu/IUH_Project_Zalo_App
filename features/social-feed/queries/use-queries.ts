import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  getSocialFeedCommentRepliesQueryOptions,
  getSocialFeedCommentsQueryOptions,
  getSocialFeedPostsQueryOptions,
  getSocialReelsQueryOptions,
  getSocialStoriesQueryOptions,
  getInfiniteSocialFeedPostsQueryOptions,
  getInfiniteSocialReelsQueryOptions,
  getInfiniteMyPostsQueryOptions,
  getPostByIdQueryOptions
} from './options'

const FEED_REALTIME_INTERVAL_MS = 3000
const COMMENTS_REALTIME_INTERVAL_MS = 3000

export const useSocialFeedPosts = (page = 0, size = 20) => {
  return useQuery(getSocialFeedPostsQueryOptions(page, size))
}

export const useInfiniteSocialFeedPosts = (size = 20, realtime = false) => {
  return useInfiniteQuery({
    ...getInfiniteSocialFeedPostsQueryOptions(size),
    refetchInterval: realtime ? FEED_REALTIME_INTERVAL_MS : false,
    refetchIntervalInBackground: false
  })
}

export const useSocialFeedComments = (
  postId: string,
  page = 0,
  size = 20,
  sortBy = 'NEWEST',
  enabled = true,
  realtime = false
) => {
  return useQuery({
    ...getSocialFeedCommentsQueryOptions(postId, page, size, sortBy),
    enabled,
    refetchInterval: enabled && realtime ? COMMENTS_REALTIME_INTERVAL_MS : false,
    refetchIntervalInBackground: false
  })
}

export const useSocialCommentReplies = (postId: string, commentId: string, enabled = true) => {
  return useQuery({
    ...getSocialFeedCommentRepliesQueryOptions(postId, commentId),
    enabled
  })
}

export const useSocialStories = (page = 0, size = 20) => {
  return useQuery(getSocialStoriesQueryOptions(page, size))
}

export const useInfiniteSocialStories = (size = 20) => {
  return useInfiniteQuery(getInfiniteSocialStoriesQueryOptions(size))
}

export const useSocialReels = (page = 0, size = 20) => {
  return useQuery(getSocialReelsQueryOptions(page, size))
}

export const useInfiniteSocialReels = (size = 20) => {
  return useInfiniteQuery(getInfiniteSocialReelsQueryOptions(size))
}

export const useInfiniteMyPosts = (size = 20) => {
  return useInfiniteQuery(getInfiniteMyPostsQueryOptions(size))
}

export const usePostById = (postId: string) => {
  return useQuery(getPostByIdQueryOptions(postId))
}
