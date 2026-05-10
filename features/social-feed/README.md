# Social Feed Feature - React Native Zalo App

Đây là implementation hoàn chỉnh của Social Feed feature cho React Native Expo app, tương tự Zalo với đầy đủ UI components, modals, và chức năng.

## 📱 Screens & Components

### 1. **Social Feed Page** (`screens/social-feed-page.tsx`)
Main feed screen hiển thị:
- **Header**: Search bar + notifications + settings
- **Tabs**: "Quan tâm" / "Khác" tab navigation
- **Post Composer**: Launcher button để tạo bài viết
- **Stories**: Horizontal carousel với create story button
- **Status Update Section**: Cập nhật trạng thái 24 giờ
- **Quick Actions**: Buttons cho Ảnh, Video, Album, Nền chữ
- **Feed**: Infinite scroll posts
- **Bottom Navigation**: 5 tab navigation (Tin nhắn, Danh bạ, Khám phá, Tường nhà, Cá nhân)

### 2. **Components**

#### Header
- `SocialFeedHeader`: Top header với search, notifications badge, settings
- `BottomNavigation`: Bottom tab bar với unread badges

#### Posts
- `PostCard`: Post display với reactions, comments, shares
- `MediaSection`: Image/Video gallery support
- `ReactionPicker`: 6 emoji reactions (👍 ❤️ 😂 😮 😢 😠)
- `FeedTabs`: Tab navigation (Quan tâm/Khác)
- `StatusUpdateSection`: 24h status update section
- `QuickActions`: Quick action buttons

#### Composer
- `PostComposer`: Full-screen post creation
- `PostComposerLauncher`: Button để mở composer
- `VisibilityDropdown`: Public/Friends/Private selector

#### Stories
- `StoriesStrip`: Horizontal carousel

#### Modals
- `PostDetailModal`: Full post detail view
- `CommentsModal`: Comments list + input
- `ShareModal`: Share with caption & visibility
- `ReactionPeopleModal`: List người đã react
- `ReportDialog`: Report post workflow

#### Comments
- `CommentItem`: Individual comment
- `CommentInput`: Comment composition

#### Reels
- `ReelCard`: Reel video card
- `ReelsFeed`: Infinite reel feed

## 🎨 UI Features

✅ **Dark Mode**: Full dark theme (black background)
✅ **Styling**: NativeWind Tailwind CSS
✅ **Icons**: Lucide React Native
✅ **Responsive**: Adapted for mobile screens
✅ **Animations**: Smooth transitions
✅ **Badges**: Notification badges on bottom nav
✅ **Mock Data**: Sample posts, stories, comments

## 📦 Data Layer

### API Endpoints
```
POST /posts - Create post
GET /recommendations/feed - Get feed posts (infinite)
GET /posts/stories - Get stories
GET /recommendations/reels - Get reels (infinite)
POST /comments - Create comment
GET /comments/{postId} - Get post comments
POST /reactions/toggle - Toggle reaction
DELETE /interactions/posts/{postId}/view - Track view
```

### React Query
- **Keys**: Hierarchical key factory pattern
- **Hooks**: useInfiniteSocialFeedPosts, useSocialFeedComments, etc.
- **Mutations**: createPost, createComment, toggleReaction, etc.
- **DTO Mapping**: Backend DTO → UI model normalization

### Types
```typescript
interface SocialPost {
  id: string
  authorName: string
  authorAvatar?: string
  postType: 'FEED' | 'STORY' | 'REEL' | 'SHARE'
  postedAt: string
  visibility: 'Public' | 'Friends' | 'Private'
  content: string
  media: MediaItem[]
  reactions: number
  topReactions: ReactionType[]
  comments: number
  shares: number
  currentUserReaction?: ReactionType | null
  rootPostId?: string | null
}
```

## 🌍 Internationalization

- **Languages**: English (en) + Vietnamese (vi)
- **i18next**: Factory pattern translations
- **Keys**: 100+ translation keys
- **Hook**: `useSocialText()` for component translations

### Translation Files
- `i18n/social.keys.ts` - Key constants
- `i18n/social.texts.ts` - Translation factory
- `locales/en.json` - English strings
- `locales/vi.json` - Vietnamese strings

## 🚀 Getting Started

### 1. Setup Providers
```typescript
// In your app root
import { QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { ThemeProvider } from './context/theme-context'
import i18n from './i18n'
import { SocialFeedPage } from './features/social-feed'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <SocialFeedPage />
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  )
}
```

### 2. Use with React Navigation
```typescript
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SocialFeedPage } from './features/social-feed'

const Tab = createBottomTabNavigator()

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name='Feed' component={SocialFeedPage} />
        {/* Other screens */}
      </Tab.Navigator>
    </NavigationContainer>
  )
}
```

### 3. Use Mock Data
```typescript
import { MOCK_POSTS, MOCK_STORIES } from './features/social-feed'

// Feed automatically uses mock data
// In SocialFeedPage: const posts = activeTab === 'following' ? MOCK_POSTS : ...
```

## 📋 File Structure

```
features/social-feed/
├── api/                      # Backend integration
│   ├── post.api.ts          # Post CRUD
│   ├── comment.api.ts       # Comment CRUD + reactions
│   ├── interaction.api.ts   # Views, dislikes
│   └── file.api.ts          # File upload
├── queries/                  # React Query
│   ├── keys.ts              # Query key factory
│   ├── options.ts           # Query options + DTO mapping
│   ├── use-queries.ts       # Query hooks
│   └── use-mutations.ts     # Mutation hooks
├── types/                    # TypeScript interfaces
│   ├── post.ts              # SocialPost type
│   └── reaction.ts          # Reaction enums
├── schemas/                  # DTO types
│   └── comment.schema.ts    # Backend DTOs
├── components/               # React Native components
│   ├── post/                # Post card + sections
│   ├── comments/            # Comment components
│   ├── composer/            # Post creation
│   ├── stories/             # Stories carousel
│   ├── reels/               # Reel feed
│   ├── header/              # Header + navigation
│   ├── sidebar/             # Sidebar (mobile adapted)
│   └── modals/              # Modal dialogs
├── screens/                  # Full screens
│   ├── social-feed-page.tsx # Main feed
│   └── my-profile-page.tsx  # User profile
├── hooks/                    # Custom hooks
├── i18n/                     # Internationalization
│   ├── social.keys.ts
│   ├── social.texts.ts
│   ├── use-social-text.ts
│   └── locales/
├── data/                     # Mock data
│   └── mock-data.ts
├── examples/                 # Usage examples
│   ├── app.example.tsx      # App setup
│   ├── root-navigator.example.tsx
│   └── ...
└── index.ts                  # Barrel export
```

## 🔧 Features Implemented

- ✅ Post feed with infinite pagination
- ✅ Post creation with media + caption
- ✅ Visibility control (Public/Friends/Private)
- ✅ Reactions (6 types) with emoji pickers
- ✅ Comments with threaded replies
- ✅ Share functionality
- ✅ Post detail modal
- ✅ Comments modal
- ✅ Reaction people modal
- ✅ Share modal
- ✅ Report dialog
- ✅ Stories carousel
- ✅ 24h status updates
- ✅ Reels infinite feed
- ✅ Bottom navigation (5 tabs)
- ✅ Tab navigation (Quan tâm/Khác)
- ✅ Mock data with sample posts
- ✅ Full i18n support (EN + VI)
- ✅ Dark mode UI
- ✅ Notification badges

## 📝 Usage Examples

### Display Feed
```typescript
<SocialFeedPage />
```

### Use Post Query
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteSocialFeedPosts(20)
```

### Create Post
```typescript
const { mutate: createPost } = useCreatePostMutation()

createPost({
  title: 'My post',
  visibility: 'Public',
  media: [{ url: 'image.jpg', type: 'IMAGE' }]
})
```

### React to Post
```typescript
const { mutate: toggleReaction } = useToggleReactionMutation()

toggleReaction({
  postId: '123',
  reactionType: 'LIKE'
})
```

### Get Translations
```typescript
const { text } = useSocialText()

<Text>{text.reactions.like}</Text>
```

## 🎯 Next Steps

1. **Connect to Real Backend**: Replace mock data with actual API calls
2. **Add Authentication**: Integrate user auth flow
3. **Implement Navigation**: Wire up React Navigation
4. **Add Storage**: Image upload/caching
5. **Push Notifications**: Real-time updates
6. **Analytics**: Track user interactions

## 📚 Dependencies

- `react-native` - Core framework
- `expo` - React Native framework
- `@tanstack/react-query` - Server state management
- `react-i18next` - Internationalization
- `nativewind` - Tailwind for React Native
- `lucide-react-native` - Icons
- `@react-navigation/*` - Navigation (optional)

## 🐛 Troubleshooting

**Issue**: Styles not applying
- Solution: Clear cache: `npx expo prebuild --clean`

**Issue**: i18n translations missing
- Solution: Ensure i18n provider is at root level

**Issue**: Images not loading
- Solution: Use valid image URLs or local imports

## 📄 License

MIT
