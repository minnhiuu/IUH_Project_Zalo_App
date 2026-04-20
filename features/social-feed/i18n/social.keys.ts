export const SOCIAL_KEYS = {
  reactions: {
    like: 'reactions.like',
    love: 'reactions.love',
    haha: 'reactions.haha',
    wow: 'reactions.wow',
    sad: 'reactions.sad',
    angry: 'reactions.angry',
    react: 'reactions.react'
  },

  composer: {
    me: 'composer.me',
    visibilityPublic: 'composer.visibilityPublic',
    placeholder: 'composer.placeholder',
    image: 'composer.image',
    video: 'composer.video',
    feeling: 'composer.feeling',
    post: 'composer.post'
  },

  post: {
    attachmentAlt: 'post.attachmentAlt',
    commentCount: 'post.commentCount',
    shareCount: 'post.shareCount',
    comment: 'post.comment',
    share: 'post.share',
    visibilityPublic: 'post.visibilityPublic',
    visibilityFriends: 'post.visibilityFriends',
    visibilityPrivate: 'post.visibilityPrivate',
    sharedAPost: 'post.sharedAPost',
    justNow: 'post.justNow',
    readMore: 'post.readMore',
    showLess: 'post.showLess'
  },

  commentsModal: {
    title: 'commentsModal.title',
    subtitle: 'commentsModal.subtitle',
    mediaAlt: 'commentsModal.mediaAlt',
    empty: 'commentsModal.empty',
    inputPlaceholder: 'commentsModal.inputPlaceholder',
    closeAriaLabel: 'commentsModal.closeAriaLabel',
    commentCount: 'commentsModal.commentCount',
    loadingComments: 'commentsModal.loadingComments',
    loadError: 'commentsModal.loadError',
    beFirstToComment: 'commentsModal.beFirstToComment',
    sortBy: 'commentsModal.sortBy',
    sortNewest: 'commentsModal.sortNewest',
    sortMostReacted: 'commentsModal.sortMostReacted'
  },

  reactionsModal: {
    title: 'reactionsModal.title',
    subtitle: 'reactionsModal.subtitle',
    loading: 'reactionsModal.loading',
    loadError: 'reactionsModal.loadError',
    emptyByType: 'reactionsModal.emptyByType',
    unknownUser: 'reactionsModal.unknownUser'
  },

  commentItem: {
    reply: 'commentItem.reply',
    edited: 'commentItem.edited',
    cancel: 'commentItem.cancel',
    save: 'commentItem.save',
    edit: 'commentItem.edit',
    delete: 'commentItem.delete',
    hideReplies: 'commentItem.hideReplies',
    viewReplies: 'commentItem.viewReplies',
    loadingReplies: 'commentItem.loadingReplies',
    loadRepliesError: 'commentItem.loadRepliesError',
    noReplies: 'commentItem.noReplies'
  },

  commentInput: {
    replyingTo: 'commentInput.replyingTo',
    cancel: 'commentInput.cancel',
    uploadPhoto: 'commentInput.uploadPhoto',
    uploadVideo: 'commentInput.uploadVideo',
    invalidMedia: 'commentInput.invalidMedia',
    uploadFailed: 'commentInput.uploadFailed'
  },

  shareModal: {
    title: 'shareModal.title',
    captionPlaceholder: 'shareModal.captionPlaceholder',
    shareNow: 'shareModal.shareNow',
    shareSuccess: 'shareModal.shareSuccess',
    shareFailed: 'shareModal.shareFailed',
    unknownUser: 'shareModal.unknownUser'
  }
} as const
