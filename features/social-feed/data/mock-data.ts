import type { SocialPost } from '../../types/post'

export const MOCK_POSTS: SocialPost[] = []

export const MOCK_STORIES: SocialPost[] = [
  {
    id: 'story1',
    authorName: 'Tạo mới',
    authorAvatar: undefined,
    postType: 'STORY',
    postedAt: new Date().toISOString(),
    visibility: 'Public',
    content: '',
    media: [
      {
        url: 'https://via.placeholder.com/200x300?text=Your+Story',
        type: 'IMAGE'
      }
    ],
    reactions: 0,
    topReactions: [],
    comments: 0,
    shares: 0,
    currentUserReaction: null,
    rootPostId: null
  },
  {
    id: 'story2',
    authorName: 'Cscd',
    authorAvatar: 'https://via.placeholder.com/80?text=Cscd',
    postType: 'STORY',
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    visibility: 'Public',
    content: '',
    media: [
      {
        url: 'https://via.placeholder.com/200x300?text=Cscd+Story',
        type: 'IMAGE'
      }
    ],
    reactions: 0,
    topReactions: [],
    comments: 0,
    shares: 0,
    currentUserReaction: null,
    rootPostId: null
  },
  {
    id: 'story3',
    authorName: 'Đoàn Lân Hư...',
    authorAvatar: 'https://via.placeholder.com/80?text=DLH',
    postType: 'STORY',
    postedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    visibility: 'Public',
    content: '',
    media: [
      {
        url: 'https://via.placeholder.com/200x300?text=Party+Story',
        type: 'IMAGE'
      }
    ],
    reactions: 0,
    topReactions: [],
    comments: 0,
    shares: 0,
    currentUserReaction: null,
    rootPostId: null
  },
  {
    id: 'story4',
    authorName: 'TFP Aca',
    authorAvatar: 'https://via.placeholder.com/80?text=TFP',
    postType: 'STORY',
    postedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    visibility: 'Public',
    content: '',
    media: [
      {
        url: 'https://via.placeholder.com/200x300?text=TFP+Story',
        type: 'IMAGE'
      }
    ],
    reactions: 0,
    topReactions: [],
    comments: 0,
    shares: 0,
    currentUserReaction: null,
    rootPostId: null
  }
]

export const MOCK_CURRENT_USER = {
  id: 'user_1',
  name: 'Bạn',
  avatar: 'https://via.placeholder.com/80?text=You'
}
