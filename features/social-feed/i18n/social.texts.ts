import type { TFunction } from 'i18next'
import { SOCIAL_KEYS } from './social.keys'

export const createSocialTexts = (t: TFunction<'social'>) => ({
  reactions: {
    labels: {
      LIKE: t(SOCIAL_KEYS.reactions.like),
      LOVE: t(SOCIAL_KEYS.reactions.love),
      HAHA: t(SOCIAL_KEYS.reactions.haha),
      WOW: t(SOCIAL_KEYS.reactions.wow),
      SAD: t(SOCIAL_KEYS.reactions.sad),
      ANGRY: t(SOCIAL_KEYS.reactions.angry)
    },
    react: t(SOCIAL_KEYS.reactions.react)
  },

  composer: {
    me: t(SOCIAL_KEYS.composer.me),
    visibilityPublic: t(SOCIAL_KEYS.composer.visibilityPublic),
    placeholder: t(SOCIAL_KEYS.composer.placeholder),
    image: t(SOCIAL_KEYS.composer.image),
    video: t(SOCIAL_KEYS.composer.video),
    feeling: t(SOCIAL_KEYS.composer.feeling),
    post: t(SOCIAL_KEYS.composer.post)
  },

  launcher: {
    prompt: t('composer.prompt')
  },

  post: {
    attachmentAlt: (author: string) => t(SOCIAL_KEYS.post.attachmentAlt, { author }),
    commentCount: (count: number) => t(SOCIAL_KEYS.post.commentCount, { count }),
    shareCount: (count: number) => t(SOCIAL_KEYS.post.shareCount, { count }),
    comment: t(SOCIAL_KEYS.post.comment),
    share: t(SOCIAL_KEYS.post.share),
    visibility: {
      Public: t(SOCIAL_KEYS.post.visibilityPublic),
      Friends: t(SOCIAL_KEYS.post.visibilityFriends),
      Private: t(SOCIAL_KEYS.post.visibilityPrivate)
    },
    sharedAPost: t(SOCIAL_KEYS.post.sharedAPost),
    justNow: t(SOCIAL_KEYS.post.justNow),
    readMore: t(SOCIAL_KEYS.post.readMore),
    showLess: t(SOCIAL_KEYS.post.showLess)
  },

  commentsModal: {
    title: t(SOCIAL_KEYS.commentsModal.title),
    subtitle: t(SOCIAL_KEYS.commentsModal.subtitle),
    mediaAlt: (author: string) => t(SOCIAL_KEYS.commentsModal.mediaAlt, { author }),
    empty: t(SOCIAL_KEYS.commentsModal.empty),
    inputPlaceholder: t(SOCIAL_KEYS.commentsModal.inputPlaceholder),
    closeAriaLabel: t(SOCIAL_KEYS.commentsModal.closeAriaLabel),
    commentCount: (count: number) => t(SOCIAL_KEYS.commentsModal.commentCount, { count }),
    loadingComments: t(SOCIAL_KEYS.commentsModal.loadingComments),
    loadError: t(SOCIAL_KEYS.commentsModal.loadError),
    beFirstToComment: t(SOCIAL_KEYS.commentsModal.beFirstToComment),
    sortBy: t(SOCIAL_KEYS.commentsModal.sortBy),
    sortNewest: t(SOCIAL_KEYS.commentsModal.sortNewest),
    sortMostReacted: t(SOCIAL_KEYS.commentsModal.sortMostReacted)
  },

  reactionsModal: {
    title: t(SOCIAL_KEYS.reactionsModal.title),
    subtitle: t(SOCIAL_KEYS.reactionsModal.subtitle),
    loading: t(SOCIAL_KEYS.reactionsModal.loading),
    loadError: t(SOCIAL_KEYS.reactionsModal.loadError),
    emptyByType: (type: string) => t(SOCIAL_KEYS.reactionsModal.emptyByType, { type }),
    unknownUser: t(SOCIAL_KEYS.reactionsModal.unknownUser)
  },

  commentItem: {
    reply: t(SOCIAL_KEYS.commentItem.reply),
    edited: t(SOCIAL_KEYS.commentItem.edited),
    cancel: t(SOCIAL_KEYS.commentItem.cancel),
    save: t(SOCIAL_KEYS.commentItem.save),
    edit: t(SOCIAL_KEYS.commentItem.edit),
    delete: t(SOCIAL_KEYS.commentItem.delete),
    hideReplies: t(SOCIAL_KEYS.commentItem.hideReplies),
    viewReplies: (count: number) => t(SOCIAL_KEYS.commentItem.viewReplies, { count }),
    loadingReplies: t(SOCIAL_KEYS.commentItem.loadingReplies),
    loadRepliesError: t(SOCIAL_KEYS.commentItem.loadRepliesError),
    noReplies: t(SOCIAL_KEYS.commentItem.noReplies)
  },

  commentInput: {
    replyingTo: (author: string) => t(SOCIAL_KEYS.commentInput.replyingTo, { author }),
    cancel: t(SOCIAL_KEYS.commentInput.cancel),
    uploadPhoto: t(SOCIAL_KEYS.commentInput.uploadPhoto),
    uploadVideo: t(SOCIAL_KEYS.commentInput.uploadVideo),
    invalidMedia: t(SOCIAL_KEYS.commentInput.invalidMedia),
    uploadFailed: t(SOCIAL_KEYS.commentInput.uploadFailed)
  },

  shareModal: {
    title: t(SOCIAL_KEYS.shareModal.title),
    captionPlaceholder: t(SOCIAL_KEYS.shareModal.captionPlaceholder),
    shareNow: t(SOCIAL_KEYS.shareModal.shareNow),
    shareSuccess: t(SOCIAL_KEYS.shareModal.shareSuccess),
    shareFailed: t(SOCIAL_KEYS.shareModal.shareFailed),
    unknownUser: t(SOCIAL_KEYS.shareModal.unknownUser)
  }
})
