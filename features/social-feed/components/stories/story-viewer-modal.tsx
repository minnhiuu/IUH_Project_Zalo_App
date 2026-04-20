import { useEffect, useRef, useState } from 'react'
import { Modal, View, Text, TouchableOpacity, Image, Pressable, Animated } from 'react-native'
import { Video, ResizeMode, type AVPlaybackStatus } from 'expo-av'
import { X } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { UserAvatar } from '@/components/common/user-avatar'
import { useRecordStoryViewMutation } from '../../queries/use-mutations'
import type { ReactionType } from '../../types/reaction'
import type { StoryGroup } from '../../types/story'

interface StoryViewerModalProps {
  visible: boolean
  groups: StoryGroup[]
  initialGroupIndex: number
  onClose: () => void
}

const STORY_DURATION_MS = 15000
const VIDEO_PROGRESS_THROTTLE_MS = 200
const STORY_REACTIONS: Array<{ type: ReactionType; emoji: string }> = [
  { type: 'LIKE', emoji: '👍' },
  { type: 'LOVE', emoji: '💗' },
  { type: 'HAHA', emoji: '😂' },
  { type: 'WOW', emoji: '😮' },
  { type: 'SAD', emoji: '🥺' },
  { type: 'ANGRY', emoji: '😡' }
]

export function StoryViewerModal({ visible, groups, initialGroupIndex, onClose }: StoryViewerModalProps) {
  const insets = useSafeAreaInsets()
  const lastVideoProgressUpdateRef = useRef(0)
  const viewedStoryIdsRef = useRef(new Set<string>())
  const prefetchedUrlsRef = useRef(new Set<string>())
  const progressValue = useRef(new Animated.Value(0)).current
  const imageProgressAnimationRef = useRef<Animated.CompositeAnimation | null>(null)
  const maxGroupIndex = Math.max(groups.length - 1, 0)
  const safeInitialGroupIndex = Math.min(Math.max(initialGroupIndex, 0), maxGroupIndex)
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [storyReactions, setStoryReactions] = useState<Record<string, ReactionType | null>>({})

  const recordViewMutation = useRecordStoryViewMutation()

  const currentGroup = groups[groupIndex]
  const currentStories = currentGroup?.stories ?? []
  const currentStory = currentStories[storyIndex]
  const rawCurrentStory = currentStory as typeof currentStory & {
    mediaUrl?: string | null
    mediaType?: string | null
  }
  const currentMedia =
    currentStory?.media?.[0] ??
    (rawCurrentStory?.mediaUrl
      ? {
          url: rawCurrentStory.mediaUrl,
          type: (rawCurrentStory.mediaType ?? '').toUpperCase() === 'VIDEO' ? 'VIDEO' : 'IMAGE'
        }
      : null)
  const isVideoStory = currentMedia?.type === 'VIDEO'
  const currentMediaUrl = currentMedia?.url ?? null
  const progressTop = Math.max(insets.top + 12, 20)
  const headerTop = progressTop + 20
  const reactionBarBottom = Math.max(insets.bottom + 8, 16)
  const captionBottom = reactionBarBottom + 74
  const progressWidth = progressValue.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  })

  const stopImageProgressAnimation = () => {
    if (imageProgressAnimationRef.current) {
      imageProgressAnimationRef.current.stop()
      imageProgressAnimationRef.current = null
    }
  }

  const resetProgress = () => {
    stopImageProgressAnimation()
    progressValue.setValue(0)
  }

  useEffect(() => {
    if (!visible) return
    setGroupIndex(safeInitialGroupIndex)
    setStoryIndex(0)
    resetProgress()
  }, [visible, safeInitialGroupIndex])

  useEffect(() => {
    if (visible) return

    stopImageProgressAnimation()
    lastVideoProgressUpdateRef.current = 0
    viewedStoryIdsRef.current.clear()
  }, [visible])

  useEffect(() => {
    if (!visible) return
    if (groupIndex > maxGroupIndex) {
      setGroupIndex(maxGroupIndex)
      setStoryIndex(0)
      resetProgress()
      return
    }

    const groupStoriesLength = groups[groupIndex]?.stories?.length ?? 0
    if (groupStoriesLength === 0) {
      setStoryIndex(0)
      return
    }

    if (storyIndex > groupStoriesLength - 1) {
      setStoryIndex(groupStoriesLength - 1)
      resetProgress()
    }
  }, [visible, groupIndex, storyIndex, groups, maxGroupIndex])

  useEffect(() => {
    if (!visible || !currentStory?.id) return

    if (viewedStoryIdsRef.current.has(currentStory.id)) {
      return
    }

    viewedStoryIdsRef.current.add(currentStory.id)
    recordViewMutation.mutate(currentStory.id)
  }, [visible, currentStory?.id])

  useEffect(() => {
    if (!visible || !currentStory) return

    resetProgress()

    if (isVideoStory) {
      return
    }

    imageProgressAnimationRef.current = Animated.timing(progressValue, {
      toValue: 100,
      duration: STORY_DURATION_MS,
      useNativeDriver: false
    })

    imageProgressAnimationRef.current.start(({ finished }) => {
      if (finished) {
        goForward()
      }
    })

    return () => {
      stopImageProgressAnimation()
    }
  }, [visible, groupIndex, storyIndex, isVideoStory, currentStory?.id])

  useEffect(() => {
    if (!visible || !currentStory) return

    const currentUrl = currentMedia?.url || null
    const nextStory = currentStories[storyIndex + 1]
    const nextRawStory = nextStory as typeof nextStory & { mediaUrl?: string | null }
    const nextUrl = nextStory?.media?.[0]?.url || nextRawStory?.mediaUrl || null

    const prefetchTargets = [currentUrl, nextUrl].filter((url): url is string => Boolean(url))
    prefetchTargets.forEach((url) => {
      if (prefetchedUrlsRef.current.has(url)) {
        return
      }

      prefetchedUrlsRef.current.add(url)
      void Image.prefetch(url).catch(() => {
        // Keep silent to avoid unhandled promise logs when a candidate URL is not previewable.
      })
    })
  }, [visible, groupIndex, storyIndex, currentStory?.id])

  if (!currentStory || !currentGroup) {
    return null
  }

  const hasPrev = groupIndex > 0 || storyIndex > 0
  const hasNext = storyIndex < currentStories.length - 1 || groupIndex < groups.length - 1
  const selectedReaction = storyReactions[currentStory.id] ?? null
  const storyCaption = currentStory.content && currentStory.content !== 'No content' ? currentStory.content : ''

  function goBack() {
    if (storyIndex > 0) {
      setStoryIndex((value) => value - 1)
      return
    }

    if (groupIndex > 0) {
      const previousGroupIndex = groupIndex - 1
      const previousGroupStories = groups[previousGroupIndex]?.stories ?? []
      setGroupIndex(previousGroupIndex)
      setStoryIndex(Math.max(previousGroupStories.length - 1, 0))
    }
  }

  function goForward() {
    if (storyIndex < currentStories.length - 1) {
      setStoryIndex((value) => value + 1)
      return
    }

    if (groupIndex < groups.length - 1) {
      setGroupIndex((value) => value + 1)
      setStoryIndex(0)
      return
    }

    onClose()
  }

  function handleVideoStatusUpdate(status: AVPlaybackStatus) {
    if (!status.isLoaded) return

    if (status.durationMillis && status.durationMillis > 0) {
      const now = Date.now()
      if (!status.didJustFinish && now - lastVideoProgressUpdateRef.current < VIDEO_PROGRESS_THROTTLE_MS) {
        return
      }

      lastVideoProgressUpdateRef.current = now
      const nextProgress = Math.min((status.positionMillis / status.durationMillis) * 100, 100)
      progressValue.setValue(nextProgress)
    }

    if (status.didJustFinish) {
      goForward()
    }
  }

  function handleReactionSelect(type: ReactionType) {
    const currentReaction = storyReactions[currentStory.id] ?? null

    setStoryReactions((previous) => ({
      ...previous,
      [currentStory.id]: currentReaction === type ? null : type
    }))
  }

  const storyBars = currentStories.map((story, idx) => ({ id: story.id, idx }))

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType='fade'
      onRequestClose={onClose}
      presentationStyle='fullScreen'
      statusBarTranslucent
    >
      <View className='flex-1 bg-black'>
        <View className='flex-1 bg-black'>
          <View pointerEvents='none' style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: '#000', zIndex: 40 }} />

          {currentMedia && currentMediaUrl ? (
            currentMedia.type === 'VIDEO' ? (
              <Video
                source={{ uri: currentMediaUrl }}
                className='absolute inset-0'
                style={{ width: '100%', height: '100%' }}
                shouldPlay
                isLooping={false}
                useNativeControls={false}
                resizeMode={ResizeMode.COVER}
                onPlaybackStatusUpdate={handleVideoStatusUpdate}
              />
            ) : (
              <Image
                source={{ uri: currentMediaUrl }}
                className='absolute inset-0'
                style={{ width: '100%', height: '100%' }}
                resizeMode='cover'
              />
            )
          ) : (
            <View className='absolute inset-0 bg-black' />
          )}

          <View className='absolute inset-0 bg-black/28' />

          <View className='absolute inset-0 z-10 flex-row'>
            <Pressable className='flex-1' onPress={goBack} />
            <Pressable className='flex-1' onPress={goForward} />
          </View>

          <View className='absolute left-4 right-4 flex-row items-center gap-1 z-20' style={{ top: progressTop }}>
            {storyBars.map((bar) => {
              const isCompleted = bar.idx < storyIndex
              const isActive = bar.idx === storyIndex

              return (
                <TouchableOpacity
                  key={bar.id}
                  className='flex-1 h-2 justify-center'
                  onPress={() => {
                    setStoryIndex(bar.idx)
                    resetProgress()
                  }}
                  activeOpacity={0.7}
                >
                  <View className='h-[3px] rounded-full bg-white/20 overflow-hidden'>
                    {isCompleted ? (
                      <View className='h-full bg-white' style={{ width: '100%' }} />
                    ) : isActive ? (
                      <Animated.View className='h-full bg-white' style={{ width: progressWidth }} />
                    ) : (
                      <View className='h-full bg-white' style={{ width: '0%' }} />
                    )}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>

          <View className='absolute left-4 right-4 z-20 flex-row items-center' style={{ top: headerTop }}>
            <View className='flex-row items-center flex-1'>
              <UserAvatar source={currentGroup.authorAvatar || undefined} name={currentGroup.authorName} size='sm' />
              <Text className='text-white font-semibold ml-3'>{currentGroup.authorName}</Text>
            </View>

            <TouchableOpacity onPress={onClose} className='w-9 h-9 rounded-full bg-black/30 items-center justify-center'>
              <X size={18} color='white' />
            </TouchableOpacity>
          </View>

          {storyCaption ? (
            <View className='absolute left-4 right-4 z-20' style={{ bottom: captionBottom }}>
              <Text className='text-white text-base'>{storyCaption}</Text>
            </View>
          ) : null}

          <View className='absolute left-0 right-0 z-20 items-center' style={{ bottom: reactionBarBottom }}>
            <View className='flex-row items-center gap-2 bg-black/40 border border-white/10 rounded-full px-3 py-2'>
              {STORY_REACTIONS.map((reaction) => {
                const isActive = selectedReaction === reaction.type
                return (
                  <TouchableOpacity
                    key={reaction.type}
                    onPress={() => handleReactionSelect(reaction.type)}
                    className={`w-9 h-9 rounded-full items-center justify-center ${isActive ? 'bg-white/20' : 'bg-transparent'}`}
                  >
                    <Text className='text-2xl'>{reaction.emoji}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}
