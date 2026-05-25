import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Image as ImageIcon, Video as VideoIcon, Plus, ThumbsUp } from 'lucide-react-native'
import { Image as ExpoImage } from 'expo-image'
import { useEffect, useMemo, useState } from 'react'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { Video, ResizeMode } from 'expo-av'
import { useRouter } from 'expo-router'
import {
  useInfiniteSocialFeedPosts,
  useSocialFeedComments,
  useSocialStories
} from '../queries/use-queries'
import { useQuery } from '@tanstack/react-query'
import { getSocialFeedCommentRepliesQueryOptions } from '../queries/options'
import {
  useCreateSocialCommentMutation,
  useDeleteSocialCommentMutation,
  useDeleteSocialCommentReactionMutation,
  useDeleteSocialPostReactionMutation,
  useToggleSocialCommentReactionMutation,
  useToggleSocialPostReactionMutation
} from '../queries/use-mutations'
import { PostCard } from '../components/post/post-card'
import { PostComposer, PostComposerLauncher } from '../components/composer'
import { StoriesStrip } from '../components/stories/stories-strip'
import { StoryViewerModal } from '../components/stories/story-viewer-modal'
import { ShareModal } from '../components/modals/share-modal'
import { SocialFeedTabs } from '../components/post/feed-tabs'
import { ReelsFeed } from '../components/reels/reels-feed'
import type { SocialPost } from '../types/post'
import type { SocialPostMedia } from '../types/post'
import type { StoryGroup } from '../types/story'
import type { ReactionType } from '../types/reaction'
import type { SocialFeedComment } from '../schemas/comment.schema'
import { useMyProfile, useUserById } from '@/features/users'
import { userApi } from '@/features/users/api/user.api'
import { UserAvatar } from '@/components/common/user-avatar'
import { useAuthStore } from '@/store'
import { formatRelativeTime } from '@/utils/dateUtils'
import { commentApi } from '../api/comment.api'
import { REACTION_EMOJIS } from '../components/post/reaction-picker'

type FeedTab = 'following' | 'reels'

const REACTION_TYPES: ReactionType[] = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY']
const REACTION_MODAL_REALTIME_INTERVAL_MS = 4000

interface ReactorProfile {
  authorId: string
  name: string
  avatar: string | null
}

type ReactorMap = Record<ReactionType, ReactorProfile[]>

const createEmptyReactorMap = (): ReactorMap => ({
  LIKE: [],
  LOVE: [],
  HAHA: [],
  WOW: [],
  SAD: [],
  ANGRY: []
})

export function SocialFeedPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<FeedTab>('following')
  const [showComposer, setShowComposer] = useState(false)
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null)
  const [reactionTargetPost, setReactionTargetPost] = useState<SocialPost | null>(null)
  const [showReactionPeopleModal, setShowReactionPeopleModal] = useState(false)
  const [selectedReactionType, setSelectedReactionType] = useState<ReactionType>('LIKE')
  const [isReactionsLoading, setIsReactionsLoading] = useState(false)
  const [reactionsError, setReactionsError] = useState<string | null>(null)
  const [reactorsByType, setReactorsByType] = useState<ReactorMap>(createEmptyReactorMap)
  const [commentText, setCommentText] = useState('')
  const [replyTarget, setReplyTarget] = useState<{ id: string; name: string } | null>(null)
  const [selectedMediaList, setSelectedMediaList] = useState<SocialPostMedia[]>([])
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  const [showMediaViewer, setShowMediaViewer] = useState(false)
  const [selectedStoryGroupIndex, setSelectedStoryGroupIndex] = useState(0)
  const [showStoryViewer, setShowStoryViewer] = useState(false)
  const [shareModalPost, setShareModalPost] = useState<SocialPost | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isFeedRealtimeEnabled = false
  const queryClient = useQueryClient()
  const {
    data: feedData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch
  } = useInfiniteSocialFeedPosts(20, isFeedRealtimeEnabled)
  const socialStoriesQuery = useSocialStories(0, 20)
  const storyGroups = (socialStoriesQuery.data ?? []) as StoryGroup[]
  const { data: myProfile } = useMyProfile()
  const authStoreUser = useAuthStore((state) => state.user)
  const currentUserId = (myProfile?.id || authStoreUser?.id || null) as string | null
  const { data: myProfileById } = useUserById(currentUserId ?? '', Boolean(currentUserId))
  const currentUserName = useMemo(() => {
    const profile = myProfile as
      | ({ fullName?: string | null; name?: string | null; username?: string | null } & Record<string, unknown>)
      | null
      | undefined

    return (
      profile?.fullName?.trim() ||
      (myProfileById as { fullName?: string | null } | null | undefined)?.fullName?.trim() ||
      authStoreUser?.fullName?.trim() ||
      profile?.name?.trim() ||
      profile?.username?.trim() ||
      'Bạn'
    )
  }, [myProfile, myProfileById, authStoreUser?.fullName])

  const currentUserAvatarFromProfile = useMemo(() => {
    const profile = myProfile as
      | ({
        avatar?: string | null
        avatarUrl?: string | null
        photoUrl?: string | null
        profileAvatar?: string | null
        imageUrl?: string | null
      } & Record<string, unknown>)
      | null
      | undefined

    const profileById = myProfileById as
      | ({
        avatar?: string | null
        avatarUrl?: string | null
        photoUrl?: string | null
        profileAvatar?: string | null
        imageUrl?: string | null
      } & Record<string, unknown>)
      | null
      | undefined

    return (
      profileById?.avatar ||
      profileById?.avatarUrl ||
      profileById?.photoUrl ||
      profileById?.profileAvatar ||
      profileById?.imageUrl ||
      authStoreUser?.avatar ||
      profile?.avatar ||
      profile?.avatarUrl ||
      profile?.photoUrl ||
      profile?.profileAvatar ||
      profile?.imageUrl ||
      null
    )
  }, [myProfile, myProfileById, authStoreUser?.avatar])
  const activePostId = selectedPost?.id || ''
  const {
    data: comments = [],
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    refetch: refetchComments
  } = useSocialFeedComments(activePostId, 0, 20, 'NEWEST', Boolean(activePostId), true)

  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(new Set())

  const toggleExpandComment = (commentId: string) => {
    setExpandedCommentIds((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
  }

  const unresolvedAuthorIds = useMemo<string[]>(() => {
    const ids = new Set<string>()

      ; (comments as SocialFeedComment[]).forEach((comment: SocialFeedComment) => {
        if (!comment.authorId || comment.authorId === currentUserId) return
        if (!comment.authorAvatar || comment.authorName === 'Unknown user') {
          ids.add(comment.authorId)
        }
      })

    return Array.from(ids)
  }, [comments, currentUserId])

  const authorQueries = useQueries({
    queries: unresolvedAuthorIds.map((authorId) => ({
      queryKey: ['social-comment-author', authorId],
      queryFn: async () => {
        const response = await userApi.getUserById(authorId)
        return response.data.data ?? null
      },
      enabled: Boolean(authorId),
      staleTime: 5 * 60 * 1000
    }))
  })

  const authorProfileMap = useMemo(() => {
    const map = new Map<string, { fullName?: string; avatar?: string | null }>()

    unresolvedAuthorIds.forEach((authorId, index) => {
      const authorData = authorQueries[index]?.data
      if (authorData) {
        map.set(authorId, {
          fullName: authorData.fullName,
          avatar: authorData.avatar
        })
      }
    })

    return map
  }, [authorQueries, unresolvedAuthorIds])

  const unresolvedStoryAuthorIds = useMemo<string[]>(() => {
    const ids = new Set<string>()

    storyGroups.forEach((group) => {
      if (!group.authorId || group.authorId === currentUserId) {
        return
      }

      if (!group.authorAvatar || group.authorName === 'Unknown user') {
        ids.add(group.authorId)
      }
    })

    return Array.from(ids)
  }, [storyGroups, currentUserId])

  const storyAuthorQueries = useQueries({
    queries: unresolvedStoryAuthorIds.map((authorId) => ({
      queryKey: ['social-story-author', authorId],
      queryFn: async () => {
        const response = await userApi.getUserById(authorId)
        return response.data.data ?? null
      },
      enabled: Boolean(authorId),
      staleTime: 5 * 60 * 1000
    }))
  })

  const storyAuthorProfileMap = useMemo(() => {
    const map = new Map<string, { fullName?: string; avatar?: string | null }>()

    unresolvedStoryAuthorIds.forEach((authorId, index) => {
      const authorData = storyAuthorQueries[index]?.data
      if (authorData) {
        map.set(authorId, {
          fullName: authorData.fullName,
          avatar: authorData.avatar
        })
      }
    })

    return map
  }, [storyAuthorQueries, unresolvedStoryAuthorIds])

  const createCommentMutation = useCreateSocialCommentMutation(activePostId)
  const deleteCommentMutation = useDeleteSocialCommentMutation(activePostId)
  const toggleCommentReactionMutation = useToggleSocialCommentReactionMutation(activePostId)
  const deleteCommentReactionMutation = useDeleteSocialCommentReactionMutation(activePostId)
  const togglePostReactionMutation = useToggleSocialPostReactionMutation()
  const deletePostReactionMutation = useDeleteSocialPostReactionMutation()

  const feedPosts = useMemo(() => {
    const raw = feedData?.pages.flatMap((page) => page.posts) ?? []
    const seen = new Set<string>()
    return raw.filter((post) => {
      if (!post.id || seen.has(post.id)) return false
      seen.add(post.id)
      return true
    })
  }, [feedData])

  const unresolvedPostAuthorIds = useMemo<string[]>(() => {
    const ids = new Set<string>()

    feedPosts.forEach((post) => {
      if (!post.authorId || post.authorId === currentUserId) return
      if (!post.authorAvatar || post.authorName === 'Unknown user') {
        ids.add(post.authorId)
      }
    })

    return Array.from(ids)
  }, [feedPosts, currentUserId])

  const postAuthorQueries = useQueries({
    queries: unresolvedPostAuthorIds.map((authorId) => ({
      queryKey: ['social-feed-author', authorId],
      queryFn: async () => {
        const response = await userApi.getUserById(authorId)
        return response.data.data ?? null
      },
      enabled: Boolean(authorId),
      staleTime: 5 * 60 * 1000
    }))
  })

  const postAuthorProfileMap = useMemo(() => {
    const map = new Map<string, { fullName?: string; avatar?: string | null }>()

    unresolvedPostAuthorIds.forEach((authorId, index) => {
      const authorData = postAuthorQueries[index]?.data
      if (authorData) {
        map.set(authorId, {
          fullName: authorData.fullName,
          avatar: authorData.avatar
        })
      }
    })

    return map
  }, [postAuthorQueries, unresolvedPostAuthorIds])

  const postsResolved = useMemo(() => {
    return feedPosts.map((post) => {
      const fallbackProfile = post.authorId ? postAuthorProfileMap.get(post.authorId) : undefined
      const resolvedAuthorName =
        post.authorName && post.authorName !== 'Unknown user'
          ? post.authorName
          : fallbackProfile?.fullName || post.authorName

      return {
        ...post,
        authorName: resolvedAuthorName,
        authorAvatar: post.authorAvatar || fallbackProfile?.avatar || null
      }
    })
  }, [feedPosts, postAuthorProfileMap])

  const unresolvedSharedAuthorIds = useMemo<string[]>(() => {
    const ids = new Set<string>()

    postsResolved.forEach((post) => {
      const shared = post.sharedPost
      if (!shared?.authorId || shared.authorId === currentUserId) return
      if (!shared.authorAvatar || shared.authorName === 'Unknown user') {
        ids.add(shared.authorId)
      }
    })

    return Array.from(ids)
  }, [postsResolved, currentUserId])

  const sharedAuthorQueries = useQueries({
    queries: unresolvedSharedAuthorIds.map((authorId) => ({
      queryKey: ['social-shared-author', authorId],
      queryFn: async () => {
        const response = await userApi.getUserById(authorId)
        return response.data.data ?? null
      },
      enabled: Boolean(authorId),
      staleTime: 5 * 60 * 1000
    }))
  })

  const sharedAuthorProfileMap = useMemo(() => {
    const map = new Map<string, { fullName?: string; avatar?: string | null }>()

    unresolvedSharedAuthorIds.forEach((authorId, index) => {
      const authorData = sharedAuthorQueries[index]?.data
      if (authorData) {
        map.set(authorId, {
          fullName: authorData.fullName,
          avatar: authorData.avatar
        })
      }
    })

    return map
  }, [sharedAuthorQueries, unresolvedSharedAuthorIds])

  const postsResolvedWithShared = useMemo(() => {
    return postsResolved.map((post) => {
      const shared = post.sharedPost
      if (!shared?.authorId) return post

      const fallbackProfile = sharedAuthorProfileMap.get(shared.authorId)
      const resolvedSharedName =
        shared.authorName && shared.authorName !== 'Unknown user'
          ? shared.authorName
          : fallbackProfile?.fullName || shared.authorName

      return {
        ...post,
        sharedPost: {
          ...shared,
          authorName: resolvedSharedName,
          authorAvatar: shared.authorAvatar || fallbackProfile?.avatar || null
        }
      }
    })
  }, [postsResolved, sharedAuthorProfileMap])

  const posts = postsResolvedWithShared
  const stories = storyGroups
    .filter((group) => group.stories.length > 0)
    .map((group) => {
      const isCurrentUserGroup = Boolean(currentUserId && group.authorId === currentUserId)
      const fallbackProfile = group.authorId ? storyAuthorProfileMap.get(group.authorId) : undefined
      const resolvedAuthorName =
        isCurrentUserGroup
          ? currentUserName || group.authorName
          : group.authorName && group.authorName !== 'Unknown user'
            ? group.authorName
            : fallbackProfile?.fullName || group.authorName
      const resolvedAuthorAvatar = isCurrentUserGroup
        ? currentUserAvatarFromProfile || group.authorAvatar || null
        : group.authorAvatar || fallbackProfile?.avatar || null

      return {
        ...group,
        authorName: resolvedAuthorName,
        authorAvatar: resolvedAuthorAvatar,
        stories: group.stories.map((story) => ({
          ...story,
          authorName: (() => {
            const isCurrentUserStory = Boolean(currentUserId && story.authorId === currentUserId)
            if (isCurrentUserStory) {
              return currentUserName || story.authorName
            }
            if (story.authorName && story.authorName !== 'Unknown user') {
              return story.authorName
            }
            return fallbackProfile?.fullName || story.authorName
          })(),
          authorAvatar: (() => {
            const isCurrentUserStory = Boolean(currentUserId && story.authorId === currentUserId)
            if (isCurrentUserStory) {
              return currentUserAvatarFromProfile || story.authorAvatar || null
            }
            return story.authorAvatar || fallbackProfile?.avatar || null
          })()
        }))
      }
    })

  const currentUserAvatarDebug = useMemo(() => {
    const profile = myProfile as
      | ({
        avatar?: string | null
        avatarUrl?: string | null
        photoUrl?: string | null
        profileAvatar?: string | null
        imageUrl?: string | null
      } & Record<string, unknown>)
      | null
      | undefined

    const profileById = myProfileById as
      | ({
        avatar?: string | null
        avatarUrl?: string | null
        photoUrl?: string | null
        profileAvatar?: string | null
        imageUrl?: string | null
      } & Record<string, unknown>)
      | null
      | undefined

    const avatarFromUserById =
      profileById?.avatar ||
      profileById?.avatarUrl ||
      profileById?.photoUrl ||
      profileById?.profileAvatar ||
      profileById?.imageUrl ||
      null

    const avatarFromAuthStore = authStoreUser?.avatar || null

    const avatarFromMyProfile =
      profile?.avatar ||
      profile?.avatarUrl ||
      profile?.photoUrl ||
      profile?.profileAvatar ||
      profile?.imageUrl ||
      null

    const normalizeId = (value?: string | null) => {
      if (!value) return ''
      return String(value).trim().toLowerCase()
    }

    const normalizedCurrentUserId = normalizeId(currentUserId)
    const avatarFromPostsById = normalizedCurrentUserId
      ? posts.find((post) => normalizeId(post.authorId) === normalizedCurrentUserId)?.authorAvatar || null
      : null

    const avatarFromStoriesById = normalizedCurrentUserId
      ? stories.find((group) => normalizeId(group.authorId) === normalizedCurrentUserId)?.authorAvatar ||
      stories
        .flatMap((group) => group.stories)
        .find((story) => normalizeId(story.authorId) === normalizedCurrentUserId)?.authorAvatar ||
      null
      : null

    const selectedAvatar =
      currentUserAvatarFromProfile ||
      avatarFromPostsById ||
      avatarFromStoriesById ||
      null

    const selectedSource = currentUserAvatarFromProfile
      ? avatarFromUserById
        ? 'useUserById'
        : avatarFromAuthStore
          ? 'authStore'
          : 'myProfile'
      : avatarFromPostsById
        ? 'posts-by-id'
        : avatarFromStoriesById
          ? 'stories-by-id'
          : 'none'

    return {
      selectedAvatar,
      selectedSource,
      avatarFromUserById,
      avatarFromMyProfile,
      avatarFromAuthStore,
      avatarFromPostsById,
      avatarFromStoriesById
    }
  }, [
    myProfile,
    myProfileById,
    authStoreUser?.avatar,
    currentUserAvatarFromProfile,
    stories,
    posts,
    currentUserId
  ])

  const currentUserAvatar = currentUserAvatarDebug.selectedAvatar
  const isReelsTab = activeTab === 'reels'
  const [reelContainerHeight, setReelContainerHeight] = useState(
    Math.max(1, Dimensions.get('window').height - 56)
  )

  const handlePostComposerClose = () => {
    setShowComposer(false)
  }

  const handleStoryPress = (groupIndex: number) => {
    setSelectedStoryGroupIndex(groupIndex)
    setShowStoryViewer(true)
  }

  const handleCloseStoryViewer = () => {
    setShowStoryViewer(false)
  }

  const handleOpenStoryCamera = () => {
    router.push('/story/capture' as any)
  }

  const handleMediaPress = (post: SocialPost, index: number, mediaList?: SocialPostMedia[]) => {
    const list = mediaList?.length ? mediaList : post.media || []
    if (!list.length) return

    setSelectedMediaList(list)
    setSelectedMediaIndex(Math.max(0, Math.min(index, list.length - 1)))
    setShowMediaViewer(true)
  }

  const handleCloseMediaViewer = () => {
    setShowMediaViewer(false)
    setSelectedMediaList([])
    setSelectedMediaIndex(0)
  }

  const handleOpenReactionPeopleModal = (post: SocialPost, initialType: ReactionType = 'LIKE') => {
    setReactionTargetPost(post)
    setSelectedReactionType(initialType)
    setShowReactionPeopleModal(true)
  }

  const handleCloseReactionPeopleModal = () => {
    setShowReactionPeopleModal(false)
    setReactionTargetPost(null)
    setSelectedReactionType('LIKE')
    setReactionsError(null)
    setReactorsByType(createEmptyReactorMap())
  }

  const handleCloseComments = () => {
    setSelectedPost(null)
    setCommentText('')
    setReplyTarget(null)
  }

  useEffect(() => {
    if (selectedPost?.id) {
      refetchComments()
    }
  }, [selectedPost?.id, refetchComments])

  useEffect(() => {
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | null = null

    const loadReactionPeople = async (silent = false) => {
      if (!showReactionPeopleModal || !reactionTargetPost?.id) {
        return
      }

      if (!silent) {
        setIsReactionsLoading(true)
      }
      setReactionsError(null)

      try {
        const entries = await Promise.all(
          REACTION_TYPES.map(async (reactionType) => {
            const response = await commentApi.searchReactions('POST', reactionType)
            const postReactions = (response.data?.data ?? []).filter((reaction) => reaction.targetId === reactionTargetPost.id)

            const profiles = await Promise.all(
              postReactions.map(async (reaction) => {
                const authorId = reaction.authorInfo?.id ?? ''
                let name = reaction.authorInfo?.fullName?.trim() || 'Unknown user'
                let avatar = reaction.authorInfo?.avatar ?? null

                if ((name === 'Unknown user' || !avatar) && authorId) {
                  try {
                    const userResponse = await userApi.getUserById(authorId)
                    const user = userResponse.data.data
                    name = user?.fullName || name
                    avatar = user?.avatar ?? avatar
                  } catch {
                    // Keep fallback from reaction authorInfo
                  }
                }

                return {
                  authorId,
                  name,
                  avatar
                } satisfies ReactorProfile
              })
            )

            return [reactionType, profiles] as const
          })
        )

        if (cancelled) return

        const nextState = createEmptyReactorMap()
        entries.forEach(([reactionType, profiles]) => {
          nextState[reactionType] = profiles
        })

        setReactorsByType(nextState)

        setSelectedReactionType((currentType) => {
          if (nextState[currentType].length > 0) {
            return currentType
          }
          return REACTION_TYPES.find((type) => nextState[type].length > 0) ?? currentType
        })
      } catch {
        if (cancelled) return
        if (!silent) {
          setReactionsError('Không tải được danh sách cảm xúc.')
          setReactorsByType(createEmptyReactorMap())
        }
      } finally {
        if (!cancelled && !silent) {
          setIsReactionsLoading(false)
        }
      }
    }

    if (showReactionPeopleModal && reactionTargetPost?.id) {
      void loadReactionPeople(false)
      intervalId = setInterval(() => {
        void loadReactionPeople(true)
      }, REACTION_MODAL_REALTIME_INTERVAL_MS)
    }

    return () => {
      cancelled = true
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [showReactionPeopleModal, reactionTargetPost?.id])

  const totalReactionsInModal = useMemo(
    () => Object.values(reactorsByType).reduce((sum, reactors) => sum + reactors.length, 0),
    [reactorsByType]
  )

  const visibleReactionTypes = useMemo(
    () => REACTION_TYPES.filter((reactionType) => reactorsByType[reactionType].length > 0),
    [reactorsByType]
  )

  const selectedReactors = reactorsByType[selectedReactionType] ?? []

  const handleSubmitComment = async () => {
    if (!selectedPost?.id || !commentText.trim()) return

    const parentId = replyTarget?.id

    try {
      await createCommentMutation.mutateAsync({
        content: commentText.trim(),
        parentId
      })

      if (parentId) {
        setExpandedCommentIds((prev) => new Set(prev).add(parentId))
      }

      setCommentText('')
      setReplyTarget(null)
      await refetchComments()
      await refetch()
    } catch (error) {
      console.error('Create comment failed:', error)
    }
  }

  const handleCommentLike = async (comment: SocialFeedComment) => {
    try {
      if (comment.currentUserReaction === 'LIKE') {
        await deleteCommentReactionMutation.mutateAsync(comment.id)
      } else {
        await toggleCommentReactionMutation.mutateAsync({ commentId: comment.id, type: 'LIKE' })
      }
    } catch (error) {
      console.error('Toggle comment reaction failed:', error)
    }
  }

  const handleCommentReply = (comment: SocialFeedComment, displayName: string) => {
    setReplyTarget({ id: comment.id, name: displayName || comment.authorName })
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId)
      if (replyTarget?.id === commentId) {
        setReplyTarget(null)
      }
    } catch (error) {
      console.error('Delete comment failed:', error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([refetch(), socialStoriesQuery.refetch()])
    } finally {
      setIsRefreshing(false)
    }
  }

  const handlePostReaction = async (postId: string, reactionType: ReactionType, isRemoving: boolean) => {
    try {
      if (isRemoving) {
        await deletePostReactionMutation.mutateAsync(postId)
      } else {
        await togglePostReactionMutation.mutateAsync({ postId, type: reactionType })
      }

      await refetch()
      queryClient.invalidateQueries({ queryKey: ['social-feed-reels'] })
    } catch (error) {
      console.error('Toggle post reaction failed:', error)
    }
  }

  return (
    <View className='flex-1 bg-gray-50'>
      {/* Tabs */}
      <SocialFeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {isReelsTab ? (
        <View
          className='flex-1 bg-black'
          onLayout={(e) => setReelContainerHeight(Math.max(1, e.nativeEvent.layout.height))}
        >
          <ReelsFeed
            itemHeight={reelContainerHeight}
            onReactionPress={async (reel, isRemoving) => {
              await handlePostReaction(reel.id, 'LIKE', isRemoving)
            }}
            onCommentPress={(reel) => setSelectedPost(reel)}
          />
          <TouchableOpacity
            onPress={() => setShowComposer(true)}
            className='absolute left-4 top-4 rounded-full bg-black/60 px-4 py-2 border border-white/30'
            activeOpacity={0.8}
          >
            <Text className='text-white text-sm font-semibold'>Đăng video</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              onReactionPress={(reactionType, isRemoving) => handlePostReaction(item.id, reactionType, isRemoving)}
              onReactionsSummaryPress={(reactionType) => handleOpenReactionPeopleModal(item, reactionType || 'LIKE')}
              onCommentPress={() => setSelectedPost(item)}
              onMediaPress={(index, mediaList) => handleMediaPress(item, index, mediaList)}
              onSharePress={() => {
                setShareModalPost(item)
                setShowShareModal(true)
              }}
            />
          )}
          ListHeaderComponent={
            <View className='bg-white'>
              {/* Post Composer Launcher */}
              <View className='bg-white px-4 py-3 border-b border-gray-100'>
                <PostComposerLauncher
                  userName={currentUserName}
                  userAvatar={currentUserAvatar}
                  onPress={() => setShowComposer(true)}
                />
              </View>

              {/* Stories Section */}
              <View className='bg-white border-b border-gray-100 px-3 py-3'>
                <StoriesStrip
                  stories={stories}
                  onCreateStory={handleOpenStoryCamera}
                  onStoryPress={handleStoryPress}
                  currentUserName={currentUserName}
                  currentUserAvatar={currentUserAvatar}
                />
              </View>
            </View>
          }
          scrollIndicatorInsets={{ right: 1 }}
          onEndReachedThreshold={0.1}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage()
            }
          }}
          ListFooterComponent={
            <View style={{ height: 60, justifyContent: 'center' }}>
              {isFetchingNextPage ? (
                <Text className='text-center text-gray-500'>Đang tải thêm bài viết...</Text>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <View className='py-10 items-center'>
              <Text className='text-gray-500'>Chưa có bài viết nào.</Text>
            </View>
          }
          className='bg-gray-50'
        />
      )}

      <Modal
        visible={showComposer}
        animationType='slide'
        onRequestClose={handlePostComposerClose}
      >
        <View className='flex-1 bg-white pt-12'>
          <View className='px-4 pb-3 border-b border-gray-100 flex-row items-center justify-between'>
            <Text className='text-lg font-semibold text-gray-900'>Đăng bài mới</Text>
            <TouchableOpacity onPress={handlePostComposerClose} className='px-3 py-1'>
              <Text className='text-blue-600 font-medium'>Đóng</Text>
            </TouchableOpacity>
          </View>

          <PostComposer
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            postType={isReelsTab ? 'REEL' : 'FEED'}
            mediaMode={isReelsTab ? 'video' : 'all'}
            onPosted={() => {
              handlePostComposerClose()
              refetch()
            }}
          />
        </View>
      </Modal>

      <Modal
        visible={Boolean(selectedPost)}
        animationType='slide'
        transparent={true}
        onRequestClose={handleCloseComments}
      >
        <View className='flex-1 justify-end bg-black/40'>
          <TouchableOpacity
            className='absolute inset-0'
            activeOpacity={1}
            onPress={handleCloseComments}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className='bg-white rounded-t-3xl h-[90%]'
          >
            <View className='w-12 h-1.5 bg-gray-300 rounded-full self-center mt-3 mb-1' />
            <View className='px-4 pb-3 flex-row items-center justify-between'>
              <Text className='text-lg font-semibold text-gray-900'>Bình luận</Text>
              <TouchableOpacity onPress={handleCloseComments} className='px-3 py-1'>
                <Text className='text-blue-600 font-medium'>Đóng</Text>
              </TouchableOpacity>
            </View>

            {isCommentsLoading ? (
              <View className='flex-1 items-center justify-center'>
                <ActivityIndicator size='large' color='#2563eb' />
              </View>
            ) : isCommentsError ? (
              <View className='flex-1 items-center justify-center px-6'>
                <Text className='text-red-500 text-center font-medium'>Không tải được bình luận.</Text>
                <TouchableOpacity onPress={() => refetchComments()} className='mt-3 px-4 py-2 rounded-full bg-blue-500'>
                  <Text className='text-white font-semibold'>Thử lại</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                  <SocialCommentItem
                    item={item}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    currentUserAvatar={currentUserAvatar}
                    authorProfileMap={authorProfileMap}
                    onLike={handleCommentLike}
                    onReply={handleCommentReply}
                    onDelete={handleDeleteComment}
                    isExpanded={expandedCommentIds.has(item.id)}
                    onToggleExpand={() => toggleExpandComment(item.id)}
                  />
                )}
                ListEmptyComponent={
                  <View className='py-10 items-center'>
                    <Text className='text-gray-500'>Chưa có bình luận nào.</Text>
                  </View>
                }
              />
            )}

            <View className='px-4 py-3 flex-row items-center gap-2'>
              <UserAvatar source={currentUserAvatar || undefined} name={currentUserName || 'Bạn'} size='md' />
              <TextInput
                placeholder='Viết bình luận...'
                placeholderTextColor='#9CA3AF'
                value={commentText}
                onChangeText={setCommentText}
                className='flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-900'
              />
              <TouchableOpacity
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || createCommentMutation.isPending}
                className={`px-4 py-2 rounded-full ${commentText.trim() ? 'bg-blue-500' : 'bg-blue-200'}`}
              >
                {createCommentMutation.isPending ? (
                  <ActivityIndicator size='small' color='white' />
                ) : (
                  <Text className='text-white font-semibold'>Gửi</Text>
                )}
              </TouchableOpacity>
            </View>
            {replyTarget && (
              <View className='px-4 pb-3 flex-row items-center justify-between'>
                <Text className='text-xs text-gray-500'>Replying to {replyTarget.name}</Text>
                <TouchableOpacity onPress={() => setReplyTarget(null)}>
                  <Text className='text-xs text-gray-500'>Huỷ</Text>
                </TouchableOpacity>
              </View>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        visible={showReactionPeopleModal}
        animationType='slide'
        transparent
        onRequestClose={handleCloseReactionPeopleModal}
      >
        <View className='flex-1 justify-end bg-black/20'>
          <TouchableOpacity className='absolute inset-0' activeOpacity={1} onPress={handleCloseReactionPeopleModal} />

          <View className='bg-white rounded-t-3xl max-h-[75%] overflow-hidden'>
            <View className='px-4 py-4'>
              <View className='flex-row items-center justify-between'>
                <Text className='text-2xl font-semibold text-gray-900'>Reactions</Text>
                <TouchableOpacity onPress={handleCloseReactionPeopleModal} className='px-2 py-1'>
                  <Text className='text-gray-700 text-xl'>×</Text>
                </TouchableOpacity>
              </View>
              <Text className='text-gray-500 mt-1'>{totalReactionsInModal} people reacted to this post.</Text>
            </View>

            <View className='border-t border-b border-gray-200 px-4 py-3'>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className='flex-row items-center gap-2'>
                  {(visibleReactionTypes.length > 0 ? visibleReactionTypes : REACTION_TYPES).map((reactionType) => {
                    const isActive = selectedReactionType === reactionType
                    const count = reactorsByType[reactionType].length

                    return (
                      <TouchableOpacity
                        key={reactionType}
                        onPress={() => setSelectedReactionType(reactionType)}
                        className={`px-4 py-2 rounded-full flex-row items-center ${isActive ? 'bg-gray-100 border border-gray-200' : 'bg-transparent'
                          }`}
                      >
                        <Text className='text-2xl mr-2'>{REACTION_EMOJIS[reactionType]}</Text>
                        <Text className='text-gray-700 font-medium'>{count}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </ScrollView>
            </View>

            {isReactionsLoading ? (
              <View className='py-10 items-center justify-center'>
                <ActivityIndicator size='large' color='#2563eb' />
              </View>
            ) : reactionsError ? (
              <View className='py-10 items-center justify-center px-6'>
                <Text className='text-red-500 text-center'>{reactionsError}</Text>
              </View>
            ) : (
              <FlatList
                data={selectedReactors}
                keyExtractor={(item, index) => `${selectedReactionType}-${item.authorId}-${index}`}
                renderItem={({ item }) => (
                  <View className='px-4 py-4 flex-row items-center justify-between'>
                    <View className='flex-row items-center flex-1'>
                      <UserAvatar source={item.avatar || undefined} name={item.name} size='md' />
                      <Text className='ml-3 text-gray-900 text-[18px] font-medium' numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                    <Text className='text-3xl ml-3'>{REACTION_EMOJIS[selectedReactionType]}</Text>
                  </View>
                )}
                ListEmptyComponent={
                  <View className='py-10 items-center'>
                    <Text className='text-gray-500'>Chưa có ai thả cảm xúc này.</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMediaViewer}
        animationType='fade'
        transparent
        onRequestClose={handleCloseMediaViewer}
      >
        <View className='flex-1 bg-black'>
          <View className='px-4 pt-12 pb-3 flex-row items-center justify-end'>
            <TouchableOpacity onPress={handleCloseMediaViewer} className='px-3 py-1'>
              <Text className='text-white font-semibold'>Đóng</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <FlatList
              data={selectedMediaList}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${item.url || index}-${index}`}
              initialScrollIndex={selectedMediaIndex}
              getItemLayout={(_, index) => {
                const width = Dimensions.get('window').width
                return { length: width, offset: width * index, index }
              }}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height - 120,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.type === 'VIDEO' ? (
                    <Video
                      source={{ uri: item.url }}
                      style={{ width: '100%', height: '100%' }}
                      useNativeControls
                      shouldPlay
                      resizeMode={ResizeMode.CONTAIN}
                    />
                  ) : (
                    <ExpoImage
                      source={{ uri: item.url }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit='contain'
                      cachePolicy='memory-disk'
                    />
                  )}
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      <StoryViewerModal
        visible={showStoryViewer}
        groups={stories}
        initialGroupIndex={selectedStoryGroupIndex}
        onClose={handleCloseStoryViewer}
      />

      <ShareModal
        visible={showShareModal}
        post={shareModalPost || undefined}
        onClose={() => {
          setShowShareModal(false)
          setShareModalPost(null)
        }}
      />
    </View>
  )
}

const useSocialCommentReplies = (postId: string, commentId: string, enabled = true) => {
  return useQuery({
    ...getSocialFeedCommentRepliesQueryOptions(postId, commentId),
    enabled
  })
}

interface SocialCommentItemProps {
  item: SocialFeedComment
  currentUserId: string | null
  currentUserName: string
  currentUserAvatar: string | null
  authorProfileMap: Map<string, { fullName?: string; avatar?: string | null }>
  onLike: (comment: SocialFeedComment) => void
  onReply: (comment: SocialFeedComment, name: string) => void
  onDelete: (commentId: string) => void
  isReply?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
}

function SocialCommentItem({
  item,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  authorProfileMap,
  onLike,
  onReply,
  onDelete,
  isReply = false,
  isExpanded = false,
  onToggleExpand
}: SocialCommentItemProps) {
  const { data: replies, isLoading } = useSocialCommentReplies(item.postId, item.id, isExpanded)

  const isOwnComment = item.authorId === currentUserId
  const displayName = isOwnComment
    ? currentUserName || item.authorName
    : authorProfileMap.get(item.authorId)?.fullName || item.authorName
  const displayAvatar = isOwnComment
    ? currentUserAvatar || undefined
    : authorProfileMap.get(item.authorId)?.avatar || item.authorAvatar || undefined

  return (
    <View className={`px-4 py-2 ${isReply ? 'ml-10 mt-1 border-l border-gray-200 pl-3' : 'mt-1'}`}>
      <View className='flex-row items-start'>
        <UserAvatar
          source={displayAvatar}
          name={displayName}
          size={isReply ? 'sm' : 'md'}
        />

        <View className='ml-3 flex-1'>
          <View className='bg-gray-100 self-start px-3 py-2 rounded-2xl max-w-[95%]'>
            <Text className='font-bold text-gray-900 text-[14px]'>
              {displayName}
            </Text>
            <Text className='text-gray-800 mt-0.5 text-[15px]'>{item.content}</Text>
          </View>

          <View className='flex-row items-center mt-1.5 ml-1'>
            <Text className='text-gray-500 text-[11px] mr-4'>
              {formatRelativeTime(item.createdAt) || 'Vừa xong'}
            </Text>
            <TouchableOpacity className='mr-5 flex-row items-center' onPress={() => onLike(item)}>
              <ThumbsUp
                size={14}
                color={item.currentUserReaction === 'LIKE' ? '#2563eb' : '#65676b'}
                fill={item.currentUserReaction === 'LIKE' ? '#2563eb' : 'transparent'}
              />
              {item.reactions > 0 && (
                <Text className={`ml-1 text-[11px] font-medium ${item.currentUserReaction === 'LIKE' ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.reactions}
                </Text>
              )}
            </TouchableOpacity>
            {!isReply && (
              <TouchableOpacity className='mr-5' onPress={() => onReply(item, displayName)}>
                <Text className='text-gray-600 font-bold text-[12px]'>Phản hồi</Text>
              </TouchableOpacity>
            )}
            {isOwnComment && (
              <TouchableOpacity onPress={() => onDelete(item.id)}>
                <Text className='text-gray-600 font-bold text-[12px]'>Xoá</Text>
              </TouchableOpacity>
            )}
          </View>

          {item.replyCount > 0 && !isExpanded && (
            <TouchableOpacity
              onPress={onToggleExpand}
              className='mt-2 ml-1 flex-row items-center'
            >
              <View className='w-6 h-[1px] bg-gray-300 mr-2' />
              <Text className='text-gray-500 font-bold text-[12px]'>
                Xem {item.replyCount} phản hồi
              </Text>
            </TouchableOpacity>
          )}

          {isExpanded && (
            <View className='mt-1'>
              {isLoading ? (
                <ActivityIndicator size='small' color='#65676b' className='mt-2 self-start' />
              ) : (
                replies?.map((reply) => (
                  <SocialCommentItem
                    key={reply.id}
                    item={reply}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    currentUserAvatar={currentUserAvatar}
                    authorProfileMap={authorProfileMap}
                    onLike={onLike}
                    onReply={onReply}
                    onDelete={onDelete}
                    isReply={true}
                  />
                ))
              )}
              {item.replyCount > 0 && (
                <TouchableOpacity
                  onPress={onToggleExpand}
                  className='mt-2 ml-1'
                >
                  <Text className='text-gray-500 font-bold text-[12px]'>Ẩn phản hồi</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
