# Friend Feature - Tổ Chức Code (Code Organization)

## 📋 Tổng Quan (Overview)

Feature `friend` được tổ chức theo kiến trúc **Feature-Based Architecture**, trong đó tất cả các file liên quan đến chức năng quản lý bạn bè được nhóm lại trong một thư mục duy nhất. Cấu trúc này giúp:
- 🎯 Dễ dàng tìm kiếm và bảo trì code
- 🔄 Tái sử dụng components và logic
- 🧪 Dễ dàng test các phần độc lập
- 📦 Có thể tách thành module riêng nếu cần

---

## 🏗️ Cấu Trúc Thư Mục (Directory Structure)

```
features/friend/
├── api/                    # API Layer - Giao tiếp với backend
│   ├── friend.api.ts       # Định nghĩa các API endpoints
│   └── index.ts            # Export barrel file
│
├── components/             # UI Components
│   ├── friend-action-button.tsx      # Nút hành động (kết bạn, hủy kết bạn, v.v.)
│   ├── friend-list-item.tsx          # Item hiển thị trong danh sách bạn bè
│   ├── friend-request-item.tsx       # Item hiển thị lời mời kết bạn
│   └── index.ts                      # Export barrel file
│
├── i18n/                   # Internationalization - Đa ngôn ngữ
│   ├── locales/
│   │   ├── vi.json         # Bản dịch tiếng Việt
│   │   └── en.json         # Bản dịch tiếng Anh
│   └── index.ts            # Khởi tạo i18n cho feature
│
├── queries/                # React Query Hooks - Quản lý state server
│   ├── keys.ts             # Query keys định nghĩa
│   ├── use-queries.ts      # Custom hooks cho GET requests
│   ├── use-mutations.ts    # Custom hooks cho POST/PUT/DELETE
│   └── index.ts            # Export barrel file
│
├── schemas/                # Type Definitions & Validations
│   ├── friend.schema.ts    # Zod schemas và TypeScript types
│   └── index.ts            # Export barrel file
│
└── index.ts               # Main export file của feature
```

---

## 📂 Chi Tiết Từng Thư Mục (Detailed Structure)

### 1. 🌐 API Layer (`api/`)

**Mục đích**: Tập trung tất cả các API calls liên quan đến friend feature.

#### `friend.api.ts`
Định nghĩa object `friendApi` chứa các methods để giao tiếp với backend:

**Các API Endpoints:**
- ✉️ **sendFriendRequest**: Gửi lời mời kết bạn
- ✅ **acceptFriendRequest**: Chấp nhận lời mời kết bạn
- ❌ **declineFriendRequest**: Từ chối lời mời kết bạn
- 🚫 **cancelFriendRequest**: Thu hồi lời mời đã gửi
- 📋 **getReceivedFriendRequests**: Lấy danh sách lời mời đã nhận
- 📤 **getSentFriendRequests**: Lấy danh sách lời mời đã gửi
- 👥 **getMyFriends**: Lấy danh sách bạn bè
- 💔 **unfriend**: Hủy kết bạn
- 🔍 **checkFriendshipStatus**: Kiểm tra trạng thái bạn bè với user
- 🤝 **getMutualFriends**: Lấy danh sách bạn chung
- 🔢 **getMutualFriendsCount**: Đếm số lượng bạn chung

**Pattern sử dụng:**
```typescript
import { friendApi } from '@/features/friend'

// Example usage
const response = await friendApi.sendFriendRequest({
  receiverId: 'user-123',
  message: 'Hi, let\'s be friends!'
})
```

---

### 2. 🎨 Components Layer (`components/`)

**Mục đích**: Chứa các UI components có thể tái sử dụng cho friend feature.

#### `friend-action-button.tsx`
**Component độc lập** hiển thị các nút hành động liên quan đến bạn bè.

**Props:**
- `variant`: Loại nút (addFriend, unfriend, cancelRequest, message, accept, decline)
- `onPress`: Callback khi nhấn nút
- `isLoading`: Trạng thái loading
- `disabled`: Vô hiệu hóa nút
- `compact`: Chế độ hiển thị compact (chỉ icon)

**Đặc điểm:**
- ⚙️ Cấu hình linh hoạt với `BUTTON_CONFIGS` object
- 🎨 Tự động styling dựa trên variant
- 📱 Hỗ trợ chế độ compact và full
- 🔄 Loading state với ActivityIndicator

**Export thêm:**
- `getFriendButtonVariant`: Helper function xác định variant dựa trên trạng thái

#### `friend-list-item.tsx`
**Component hiển thị một item** trong danh sách bạn bè.

**Props:**
- `friend`: Object FriendResponse
- `onPress`: Callback khi nhấn vào item
- `onCall`: Callback gọi điện
- `onVideoCall`: Callback gọi video

**Features:**
- 🖼️ Hiển thị avatar, tên người dùng
- 📞 Nút gọi điện và video call
- 👆 Có thể click để xem profile

#### `friend-request-item.tsx`
**Component hiển thị lời mời kết bạn** (cả nhận và gửi).

**Props:**
- `request`: Object FriendRequestResponse
- `type`: 'received' hoặc 'sent'
- `onAccept`, `onDecline`, `onCancel`: Callbacks cho các hành động
- `isLoading`: Trạng thái loading

**Features:**
- 📝 Hiển thị message kèm theo lời mời
- ⏰ Tính toán và hiển thị thời gian tương đối
- 🎯 Conditional rendering buttons dựa trên type
- 🔄 Loading state khi thực hiện hành động

---

### 3. 🌍 Internationalization (`i18n/`)

**Mục đích**: Quản lý đa ngôn ngữ cho friend feature.

#### Cấu trúc
```
i18n/
├── locales/
│   ├── vi.json    # Tiếng Việt
│   └── en.json    # Tiếng Anh
└── index.ts       # Bootstrap i18n
```

#### `index.ts`
- Import các file translation
- Sử dụng `i18n.addResourceBundle()` để thêm vào global i18n
- **Lưu ý**: Sử dụng flat structure với prefix `friend.*`

**Translation Keys Structure:**
```json
{
  "friend": {
    "title": "...",
    "tabs": { "received": "...", "sent": "..." },
    "actions": { "accept": "...", "decline": "...", ... },
    "time": { "justNow": "...", "minutesAgo": "...", ... },
    "empty": { "received": "...", "sent": "...", ... },
    "toast": { "sendSuccess": "...", ... },
    "status": { "pending": "...", "accepted": "...", ... },
    "addFriend": { ... },
    "profile": { ... }
  }
}
```

**Sử dụng:**
```typescript
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
t('friend.actions.accept')  // → "Accept" hoặc "Đồng ý"
```

---

### 4. 🔄 React Query Layer (`queries/`)

**Mục đích**: Quản lý server state với React Query (TanStack Query).

#### `keys.ts`
**Query Key Factory** - Định nghĩa cấu trúc keys cho caching và invalidation.

**Cấu trúc:**
```typescript
friendKeys = {
  all: ['friendships'],
  requests: () => [...all, 'requests'],
  receivedRequests: () => [...requests(), 'received'],
  sentRequests: () => [...requests(), 'sent'],
  friends: () => [...all, 'friends'],
  myFriends: () => [...friends(), 'my'],
  status: (userId) => [...all, 'status', userId],
  mutual: (userId) => [...all, 'mutual', userId],
  mutualCount: (userId) => [...all, 'mutual-count', userId]
}
```

**Lợi ích:**
- 🔑 Tập trung quản lý query keys
- 🎯 Dễ dàng invalidate cache theo hierarchy
- 🛡️ Type-safe với `as const`

#### `use-queries.ts`
**Custom hooks cho READ operations** (GET requests).

**Hooks:**
- `useReceivedFriendRequests`: Lấy lời mời đã nhận
- `useSentFriendRequests`: Lấy lời mời đã gửi
- `useMyFriends`: Lấy danh sách bạn bè
- `useFriendshipStatus`: Kiểm tra trạng thái với user
- `useMutualFriends`: Lấy bạn chung
- `useMutualFriendsCount`: Đếm bạn chung

**Pattern chung:**
```typescript
export const useMyFriends = (enabled = true) => {
  return useQuery({
    queryKey: friendKeys.myFriends(),
    queryFn: async () => {
      const response = await friendApi.getMyFriends()
      return response.data.data
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 phút
  })
}
```

**Features:**
- ✅ Cache tự động
- 🔄 Refetch on window focus
- ⏱️ Configurable staleTime
- 🎛️ Conditional fetching với `enabled`

#### `use-mutations.ts`
**Custom hooks cho WRITE operations** (POST/PUT/DELETE).

**Hooks:**
- `useSendFriendRequest`: Gửi lời mời
- `useAcceptFriendRequest`: Chấp nhận lời mời
- `useDeclineFriendRequest`: Từ chối lời mời
- `useCancelFriendRequest`: Thu hồi lời mời
- `useUnfriend`: Hủy kết bạn

**Pattern chung:**
```typescript
export const useAcceptFriendRequest = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (friendshipId: string) => 
      friendApi.acceptFriendRequest(friendshipId),
    
    onSuccess: () => {
      // Invalidate cache để refetch data mới
      queryClient.invalidateQueries({ 
        queryKey: friendKeys.receivedRequests() 
      })
      queryClient.invalidateQueries({ 
        queryKey: friendKeys.myFriends() 
      })
      
      // Hiển thị toast notification
      Toast.show({
        type: 'success',
        text1: t('friend.toast.acceptSuccess'),
      })
    },
    
    onError: (error: Error) => {
      handleErrorApi({ error })
    },
  })
}
```

**Features:**
- 🔄 Auto invalidate cache sau mutation
- 🎉 Toast notifications
- ⚠️ Error handling tập trung
- 🌐 i18n integrated

---

### 5. 📋 Schemas & Types (`schemas/`)

**Mục đích**: Định nghĩa types và validation schemas cho friend feature.

#### `friend.schema.ts`

**Enums:**
```typescript
enum FriendStatus {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
}
```

**Zod Validation Schemas:**
```typescript
// Request validation
friendRequestSendRequestSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID không được để trống'),
  message: z.string().optional(),
})

friendRequestActionRequestSchema = z.object({
  friendshipId: z.string().min(1, 'Friendship ID không được để trống'),
})
```

**TypeScript Types:**
```typescript
// Inferred from Zod schemas
type FriendRequestSendRequest = z.infer<typeof friendRequestSendRequestSchema>
type FriendRequestActionRequest = z.infer<typeof friendRequestActionRequestSchema>

// API Response types
type UserSummaryResponse = {
  id: string
  accountId: string
  userName: string
  email: string
  phone: string
  avatar: string
}

type FriendRequestResponse = {
  id: string
  requestedUserId: string
  requestedUserName: string
  requestedUserAvatar: string
  receivedUserId: string
  receivedUserName: string
  receivedUserAvatar: string
  message: string | null
  status: FriendStatus
  createdAt: string
  updatedAt: string
}

type FriendResponse = {
  userId: string
  userName: string
  userAvatar: string
  userEmail: string
  userPhone: string
  friendsSince: string
  mutualFriendsCount: number
}

type FriendshipStatusResponse = {
  areFriends: boolean
  status: FriendStatus | null
  friendshipId: string | null
  requestedBy: string | null
}

type MutualFriendsResponse = {
  count: number
  mutualFriends: FriendResponse[]
}
```

**Lợi ích:**
- ✅ Runtime validation với Zod
- 🛡️ Type safety với TypeScript
- 📝 Single source of truth cho data structures
- 🔄 Dễ dàng sync với API contracts

---

## 🔌 Export Strategy (Barrel Pattern)

Feature sử dụng **Barrel Pattern** để export, giúp import code dễ dàng và clean hơn.

### Main Export (`index.ts`)
```typescript
export * from './schemas'   // Types, enums, schemas
export * from './api'        // API functions
export * from './queries'    // React Query hooks
export * from './components' // UI components

// Initialize i18n
import './i18n'
```

### Cách sử dụng:
```typescript
// ✅ Clean import
import { 
  useMyFriends,           // hook
  friendApi,              // API
  FriendListItem,         // component
  FriendStatus,           // enum
  type FriendResponse     // type
} from '@/features/friend'

// ❌ Tránh import trực tiếp
import { useMyFriends } from '@/features/friend/queries/use-queries'
```

---

## 🎯 Design Patterns & Best Practices

### 1. **Separation of Concerns**
- API logic tách biệt khỏi UI
- Business logic trong hooks
- Presentation logic trong components

### 2. **Single Responsibility Principle**
- Mỗi file có một mục đích rõ ràng
- Components nhỏ, tập trung vào UI
- Hooks quản lý state/data fetching

### 3. **DRY (Don't Repeat Yourself)**
- Tái sử dụng components (FriendListItem, FriendRequestItem)
- Query keys được định nghĩa một lần
- API functions centralized

### 4. **Type Safety**
- Sử dụng TypeScript strict mode
- Zod validation cho runtime safety
- Type inference từ Zod schemas

### 5. **Error Handling**
- Centralized error handler `handleErrorApi`
- Consistent error messages từ i18n
- Toast notifications cho user feedback

### 6. **Performance Optimization**
- React Query caching strategy
- Stale time configuration
- Conditional fetching with `enabled` flag
- Optimistic updates (có thể thêm)

### 7. **Internationalization First**
- Không hardcode text trong components
- Sử dụng i18n keys
- Support multiple languages từ đầu

---

## 🔄 Data Flow

```
┌─────────────┐
│   Screen    │  (Friend Requests Screen, Friends List Screen)
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐
│  Component  │  (FriendRequestItem, FriendListItem)
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐
│ Query Hook  │  (useMyFriends, useSendFriendRequest)
└──────┬──────┘
       │ calls
       ▼
┌─────────────┐
│  API Layer  │  (friendApi.sendFriendRequest)
└──────┬──────┘
       │ uses
       ▼
┌─────────────┐
│ HTTP Client │  (@/lib/http)
└──────┬──────┘
       │
       ▼
   Backend API
```

---

## 🧪 Testing Strategy (Recommendations)

### Unit Tests
- **Schemas**: Test Zod validations
- **Components**: Test rendering and user interactions
- **Hooks**: Test with React Query testing utilities

### Integration Tests
- **API Layer**: Mock HTTP calls
- **Query Hooks**: Test cache invalidation
- **Mutations**: Test success/error flows

### E2E Tests
- Friend request flow (send → receive → accept)
- Unfriend flow
- Error scenarios

---

## 📊 Dependencies

### Internal Dependencies
```typescript
import http from '@/lib/http'                    // HTTP client
import { API_ENDPOINTS } from '@/config/apiConfig'  // API endpoints config
import { handleErrorApi } from '@/utils/error-handler'  // Error handler
import i18n from '@/i18n'                        // Global i18n instance
```

### External Dependencies
```typescript
import { z } from 'zod'                          // Schema validation
import { useQuery, useMutation } from '@tanstack/react-query'  // State management
import { useTranslation } from 'react-i18next'   // i18n hooks
import Toast from 'react-native-toast-message'   // Toast notifications
```

---

## 🚀 Usage Examples

### Example 1: Hiển thị danh sách bạn bè
```typescript
import { useMyFriends, FriendListItem } from '@/features/friend'

function FriendsScreen() {
  const { data: friends, isLoading } = useMyFriends()

  if (isLoading) return <LoadingSpinner />

  return (
    <FlatList
      data={friends}
      renderItem={({ item }) => (
        <FriendListItem
          friend={item}
          onPress={(friend) => router.push(`/user-profile/${friend.userId}`)}
          onCall={(friend) => initiateCall(friend.userId)}
        />
      )}
    />
  )
}
```

### Example 2: Gửi lời mời kết bạn
```typescript
import { useSendFriendRequest } from '@/features/friend'

function AddFriendButton({ userId }: { userId: string }) {
  const sendRequest = useSendFriendRequest()

  const handleAdd = () => {
    sendRequest.mutate({
      receiverId: userId,
      message: 'Hi, let\'s connect!'
    })
  }

  return (
    <FriendActionButton
      variant="addFriend"
      onPress={handleAdd}
      isLoading={sendRequest.isPending}
    />
  )
}
```

### Example 3: Hiển thị friend requests
```typescript
import { 
  useReceivedFriendRequests,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  FriendRequestItem
} from '@/features/friend'

function FriendRequestsScreen() {
  const { data: requests } = useReceivedFriendRequests()
  const acceptRequest = useAcceptFriendRequest()
  const declineRequest = useDeclineFriendRequest()

  return (
    <FlatList
      data={requests}
      renderItem={({ item }) => (
        <FriendRequestItem
          request={item}
          type="received"
          onAccept={(id) => acceptRequest.mutate(id)}
          onDecline={(id) => declineRequest.mutate(id)}
          isLoading={acceptRequest.isPending || declineRequest.isPending}
        />
      )}
    />
  )
}
```

---

## 🔮 Future Improvements

### Potential Enhancements
1. **Optimistic Updates**: Update UI trước khi API response
2. **Infinite Scrolling**: Pagination cho danh sách lớn
3. **Real-time Updates**: WebSocket cho friend requests real-time
4. **Offline Support**: Cache và sync khi online
5. **Block/Report**: Chặn và báo cáo user

---

## 📝 Conventions & Guidelines

### File Naming
- Components: `kebab-case.tsx` (e.g., `friend-list-item.tsx`)
- Hooks: `use-*.ts` (e.g., `use-queries.ts`)
- Types/Schemas: `*.schema.ts` (e.g., `friend.schema.ts`)
- API: `*.api.ts` (e.g., `friend.api.ts`)
- Barrel exports: `index.ts`

### Code Style
- **Functional components** với TypeScript
- **Named exports** cho reusability
- **Interface trước type** cho component props
- **Async/await** thay vì promises
- **Destructuring** trong function parameters

### Commit Messages (nếu áp dụng)
```
feat(friend): add mutual friends count hook
fix(friend): resolve cache invalidation issue
refactor(friend): extract button config to constant
docs(friend): update code organization guide
```

---

## 🤝 Contributing Guidelines

Khi thêm features mới vào friend module:

1. **Follow Structure**: Đặt code vào đúng folder
2. **Export Properly**: Thêm export vào `index.ts`
3. **Add Types**: Định nghĩa types trong `schemas/`
4. **i18n Keys**: Thêm translation keys cho text mới
5. **Query Keys**: Thêm vào `friendKeys` nếu có query mới
6. **Error Handling**: Sử dụng `handleErrorApi` consistently
7. **Documentation**: Update README này khi có thay đổi lớn

---

## � Coding Rules & Standards (Quy Tắc Lập Trình)

Dựa trên cấu trúc hiện tại của project, đây là các quy tắc cần tuân thủ khi phát triển features:

### 1. 🛠️ Utils Rules (Quy Tắc Utils)

**Nguyên tắc chung:**
- Mỗi file utils tập trung vào **một domain cụ thể** (date, string, validation, storage, error)
- Functions phải là **pure functions** (không side effects) khi có thể
- functions không cần có **JSDoc comments** 
- Export individual functions, không export default object

**Cấu trúc file theo domain:**

#### 📅 **dateUtils.ts** - Date/Time Functions
```typescript
// ✅ Good: Specific, reusable functions
export const formatMessageTime = (dateString: string): string => { }
export const formatChatTime = (dateString: string): string => { }
export const getTimeAgo = (dateString: string): string => { }

// ❌ Bad: Generic, unclear naming
export const format = (date: string) => { }
export const process = (d: any) => { }
```

**Rules:**
- Sử dụng `date-fns` cho tất cả date operations
- Luôn parse ISO string với `parseISO()`
- Support locale (Vietnamese là default)
- Return format chuẩn: `dd/MM/yyyy` cho date, `HH:mm` cho time

#### 📝 **stringUtils.ts** - String Manipulation
```typescript
// ✅ Good: Clear purpose, typed parameters
export const truncateText = (text: string, maxLength: number): string => { }
export const getInitials = (name: string): string => { }
export const removeVietnameseTones = (str: string): string => { }

// ❌ Bad: Vague naming, missing types
export const process = (s: any) => { }
export const transform = (text: string) => { } // Transform to what?
```

**Rules:**
- Handle edge cases (empty string, null, undefined)
- Vietnamese-specific utilities (remove tones, search filter)
- File utilities (formatFileSize, formatDuration) cũng ở đây
- Type safety với strict types

#### ✅ **validationUtils.ts** - Validation Functions
```typescript
// ✅ Good: Returns boolean or detailed result
export const isValidPhone = (phone: string): boolean => { }
export const isStrongPassword = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => { }

// ❌ Bad: Side effects, unclear return
export const validatePhone = (phone: string) => { 
  alert('Invalid phone') // ❌ Side effect
}
```

**Rules:**
- Prefix `isValid*` cho simple boolean checks
- Return object với `isValid` + `errors` cho complex validations
- Vietnamese phone format support: `0xxx xxx xxx` hoặc `+84xxx`
- Không có side effects (no alerts, no toast)
- Validation messages trong i18n, không hardcode

#### 💾 **storageUtils.ts** - Storage Management
```typescript
// ✅ Good: Separate secure and non-secure storage
export const secureStorage = {
  setAccessToken: async (token: string): Promise<void> => { },
  getAccessToken: async (): Promise<string | null> => { },
}

export const storage = {
  set: async <T>(key: string, value: T): Promise<void> => { },
  get: async <T>(key: string): Promise<T | null> => { },
}
```

**Rules:**
- **Sensitive data** (tokens, passwords) → `SecureStore`
- **Non-sensitive data** (preferences, cache) → `AsyncStorage`
- Generic methods: `set<T>`, `get<T>`, `remove`, `clear`
- Specific helpers cho common use cases: `setUserData`, `getUserData`
- Define constants: `SECURE_KEYS`, `STORAGE_KEYS`
- Always handle errors gracefully

#### ⚠️ **error-handler.ts** - Error Handling
```typescript
// ✅ Good: Centralized error handler
export const handleErrorApi = ({ 
  error, 
  setError, 
  duration = 4000, 
  showToast = true 
}: HandleErrorOptions): void => { }

// Define custom error classes
export class EntityError extends Error {
  status: 422
  payload: { message: string; errors: Array<...> }
}
```

**Rules:**
- Centralized error handling với `handleErrorApi`
- Custom error classes cho specific error types
- Support form errors với `setError` callback
- Toast notifications cho user feedback
- Map error codes từ backend → user-friendly messages
- Always log errors for debugging

#### 🔐 **jwt.ts** - JWT Utilities
```typescript
// ✅ Good: Type-safe JWT operations
export const decodeToken = (token: string): DecodedToken | null => { }
export const isTokenExpired = (token: string): boolean => { }
export const getUserIdFromToken = (token: string): string | null => { }
```

**Rules:**
- Type-safe với defined `DecodedToken` interface
- Handle decode errors gracefully (return null)
- Utility helpers: check expiry, get user info, etc.
- No side effects - pure functions only

#### 📤 **index.ts** - Barrel Export
```typescript
// ✅ Export all utils
export * from './dateUtils'
export * from './storageUtils'
export * from './stringUtils'
export * from './validationUtils'
export * from './error-handler'
export * from './jwt'
```

---

### 2. 📋 Types Rules (Quy Tắc Types)

**Nguyên tắc chung:**
- Centralized type definitions trong `/types`
- Feature-specific types trong feature's `/schemas` folder
- Sử dụng TypeScript strict mode
- Prefer `interface` cho object shapes, `type` cho unions/intersections

#### **common.types.ts** - Common Types
```typescript
// ✅ Good: Generic, reusable types
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message?: string
  success?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: { ... }
}

// ❌ Bad: Feature-specific types in common.types
export interface FriendRequest { } // Should be in features/friend/schemas
```

**Rules:**
- **ApiResponse<T>**: Wrap tất cả API responses
- **PaginatedResponse<T>**: Cho paginated data
- **BaseEntity**: Common fields (id, createdAt, updatedAt)
- **LoadingState**: Common loading states
- Navigation types: `RootStackParamList`, `MainTabParamList`

**Type vs Interface:**
```typescript
// ✅ Interface for object shapes
export interface User {
  id: string
  name: string
}

// ✅ Type for unions, intersections, utilities
export type UserRole = 'admin' | 'user' | 'guest'
export type UserWithRole = User & { role: UserRole }

// ✅ Type for function signatures
export type ApiFunction<T> = (params: T) => Promise<ApiResponse<T>>
```

**Rules:**
- Use `interface` khi có thể extend/merge
- Use `type` cho unions, mapped types, conditional types
- Generic types với meaningful names: `<T>`, `<TData>`, `<TResponse>`
- Optional fields với `?`
- Readonly khi cần: `readonly id: string`

---

### 3. 🪝 Hooks Rules (Quy Tắc Hooks)

**Nguyên tắc chung:**
- Tất cả hooks prefix `use*` (camelCase)
- File name: `use*.ts` hoặc `useFeatureName.ts`
- Export named exports
- Feature-specific hooks trong feature folder

#### **Custom Hook Structure**
```typescript
// ✅ Good: Type-safe, documented hook
interface UseFeatureReturn {
  value: string
  isLoading: boolean
  handleAction: () => void
}

/**
 * Hook description here
 * @param param1 - Description
 * @returns Object with value, loading state, and actions
 */
export const useFeature = (param1: string): UseFeatureReturn => {
  const [value, setValue] = useState<string>('')
  
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies])
  
  return {
    value,
    isLoading: false,
    handleAction
  }
}

// ❌ Bad: No types, unclear return
export const useFeature = (param) => {
  const [value, setValue] = useState('')
  return [value, setValue] // What are these?
}
```

**Common Hook Patterns:**

#### 🔄 **useDebounce** - Debounced Value
```typescript
export function useDebounce<T>(value: T, delay: number = 500): T
export function useDebouncedCallback<T>(callback: T, delay: number): T
```

**Rules:**
- Generic type `<T>` cho flexibility
- Default delay = 500ms
- Cleanup timeout on unmount

#### ⏳ **useLoading** - Loading State
```typescript
export const useLoading = (initialState = false): UseLoadingReturn => {
  // Returns: isLoading, startLoading, stopLoading, withLoading
}
```

**Rules:**
- Return object với clear methods
- `withLoading` wrapper cho async functions
- Always cleanup

#### ⌨️ **useKeyboard** - Keyboard State
```typescript
export const useKeyboard = (): UseKeyboardReturn => {
  // Returns: keyboardVisible, keyboardHeight, dismissKeyboard
}
```

**Rules:**
- Platform-specific handling (iOS vs Android)
- Cleanup listeners on unmount
- Expose utility methods

#### 📤 **index.ts** - Hook Exports
```typescript
// ✅ Re-export từ features
export {
  useAuth,
  useLoginMutation,
  authKeys as AUTH_QUERY_KEYS
} from '@/features/auth'

// ✅ Local hooks
export { useDebounce } from './useDebounce'
export { useLoading } from './useLoading'
```

**Rules:**
- Re-export feature hooks cho convenience
- Group related hooks
- Rename khi cần avoid conflicts: `authKeys as AUTH_QUERY_KEYS`

---

### 4. 🌍 i18n Rules (Quy Tắc Đa Ngôn Ngữ)

**Nguyên tắc chung:**
- Global i18n instance trong `/i18n`
- Feature-specific translations trong `feature/i18n/locales/`
- Keys phải có prefix theo feature: `friend.actions.accept`
- Support ít nhất 2 ngôn ngữ: `vi` (default), `en`

#### **Global i18n Setup**
```typescript
// i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// ✅ Good: Type-safe language codes
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  vi: { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' }
} as const

export type LanguageCode = keyof typeof LANGUAGES

// ✅ Initialize with device language
i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'vi',
  compatibilityJSON: 'v4' // For React Native
})
```

**Rules:**
- Device language detection với `expo-localization`
- Fallback to `vi` (Vietnamese)
- `compatibilityJSON: 'v4'` for React Native compatibility
- Export helper functions: `changeLanguage`, `getCurrentLanguage`

#### **Translation Keys Structure**
```json
// ✅ Good: Hierarchical, namespaced
{
  "friend": {
    "title": "Lời mời kết bạn",
    "actions": {
      "accept": "Đồng ý",
      "decline": "Từ chối"
    },
    "toast": {
      "sendSuccess": "Đã gửi lời mời kết bạn"
    }
  }
}

// ❌ Bad: Flat, no namespace
{
  "accept": "Đồng ý",
  "friendRequestSent": "Sent"
}
```

**Rules:**
- Feature prefix: `friend.*`, `auth.*`, `message.*`
- Group by context: `actions`, `toast`, `errors`, `empty`
- Use dot notation: `friend.actions.accept`
- Pluralization: `friend.time.minutesAgo` với `{{count}}`
- Interpolation: `friend.mutualFriends` với `{{count}}`

#### **Feature-Level i18n**
```typescript
// features/friend/i18n/index.ts
import i18n from '@/i18n'
import en from './locales/en.json'
import vi from './locales/vi.json'

// ✅ Add to global i18n instance
i18n.addResourceBundle('en', 'translation', en, true, true)
i18n.addResourceBundle('vi', 'translation', vi, true, true)

export default i18n
```

**Rules:**
- Import global i18n instance
- Use `addResourceBundle` để extend
- Parameters: `(language, namespace, resources, deep, overwrite)`
- Deep merge: `true`, Overwrite: `true`

#### **Usage in Components**
```typescript
// ✅ Good: Type-safe with useTranslation
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()
  
  // Simple translation
  return <Text>{t('friend.actions.accept')}</Text>
  
  // With interpolation
  return <Text>{t('friend.mutualFriends', { count: 5 })}</Text>
  
  // With pluralization
  return <Text>{t('friend.time.minutesAgo', { count: 10 })}</Text>
}

// ❌ Bad: Hardcoded text
function Component() {
  return <Text>Đồng ý</Text> // ❌ Not translatable
}
```

**Rules:**
- **Never hardcode user-facing text**
- Use `t()` function cho tất cả text
- Provide context variables: `{{ variable }}`
- Use pluralization keys khi cần

#### **Translation File Organization**
```
i18n/
├── locales/
│   ├── vi.json    # Global Vietnamese
│   └── en.json    # Global English
└── index.ts       # i18n configuration

features/friend/i18n/
├── locales/
│   ├── vi.json    # Friend-specific Vietnamese
│   └── en.json    # Friend-specific English
└── index.ts       # Feature i18n bootstrap
```

**Rules:**
- Global translations: common texts, errors, navigation
- Feature translations: feature-specific texts
- Same key structure across `vi.json` and `en.json`
- Keep translations in sync

---

### 5. 🔄 React Query Rules (Quy Tắc Server State)

**Nguyên tắc chung:**
- Tất cả server state dùng React Query (TanStack Query)
- Query keys được centralizetrong `keys.ts`
- Separate hooks: `use-queries.ts` (GET), `use-mutations.ts` (POST/PUT/DELETE)

#### **Query Keys Factory**
```typescript
// ✅ Good: Hierarchical query keys
export const friendKeys = {
  all: ['friendships'] as const,
  requests: () => [...friendKeys.all, 'requests'] as const,
  receivedRequests: () => [...friendKeys.requests(), 'received'] as const,
  myFriends: () => [...friendKeys.all, 'friends', 'my'] as const,
  status: (userId: string) => [...friendKeys.all, 'status', userId] as const,
}

// ❌ Bad: Hardcoded, scattered keys
useQuery({ queryKey: ['friends', 'list'] }) // Scattered
useQuery({ queryKey: ['friendsList'] }) // Different format
```

**Rules:**
- Hierarchy: `all` → `category` → `specific`
- Use `as const` for type inference
- Functions cho dynamic keys: `status(userId)`
- Consistent naming pattern

#### **Query Hooks (GET)**
```typescript
// ✅ Good: Configurable, typed hook
export const useMyFriends = (enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.myFriends(),
    queryFn: async () => {
      const response = await friendApi.getMyFriends()
      return response.data.data // Extract data
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ❌ Bad: Not configurable, missing types
export const useMyFriends = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: () => friendApi.getMyFriends(),
  })
}
```

**Rules:**
- `enabled` parameter cho conditional fetching
- Extract data trong `queryFn`: `response.data.data`
- Configure `staleTime` appropriately:
  - Real-time data: 10-30s
  - Frequently changing: 1-2min
  - Relatively stable: 5-10min
- Return raw `useQuery` result (don't destructure)

#### **Mutation Hooks (POST/PUT/DELETE)**
```typescript
// ✅ Good: Complete mutation with side effects
export const useAcceptFriendRequest = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (friendshipId: string) => 
      friendApi.acceptFriendRequest(friendshipId),
    
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: friendKeys.receivedRequests() 
      })
      queryClient.invalidateQueries({ 
        queryKey: friendKeys.myFriends() 
      })
      
      // User feedback
      Toast.show({
        type: 'success',
        text1: t('friend.toast.acceptSuccess'),
      })
    },
    
    onError: (error: Error) => {
      handleErrorApi({ error })
    },
  })
}
```

**Rules:**
- **onSuccess**: Invalidate cache, show success toast
- **onError**: Use `handleErrorApi` for consistent error handling
- Invalidate **all affected queries** (not just one)
- Use i18n cho toast messages
- Type mutation parameters properly

#### **Optimistic Updates (Optional)**
```typescript
// ✅ Advanced: Optimistic update
export const useUpdateFriend = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateFriendApi,
    onMutate: async (newData) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: friendKeys.myFriends() })
      
      // Snapshot current data
      const previous = queryClient.getQueryData(friendKeys.myFriends())
      
      // Optimistically update
      queryClient.setQueryData(friendKeys.myFriends(), (old) => {
        // Update logic
      })
      
      return { previous }
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(friendKeys.myFriends(), context.previous)
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: friendKeys.myFriends() })
    },
  })
}
```

---

### 6. 🎯 API Layer Rules (Quy Tắc API)

**Nguyên tắc chung:**
- API functions trong `feature/api/*.api.ts`
- Export object với methods: `export const featureApi = { ... }`
- Use http client từ `@/lib/http`
- Type-safe với TypeScript

#### **API Structure**
```typescript
// ✅ Good: Object with methods
export const friendApi = {
  sendFriendRequest: (request: FriendRequestSendRequest) =>
    http.post<ApiResponse<FriendRequestResponse>>(
      API_ENDPOINTS.FRIENDSHIP.SEND_REQUEST, 
      request
    ),

  getMyFriends: () =>
    http.get<ApiResponse<FriendResponse[]>>(
      API_ENDPOINTS.FRIENDSHIP.MY_FRIENDS
    ),

  unfriend: (friendId: string) =>
    http.delete<ApiResponse<void>>(
      API_ENDPOINTS.FRIENDSHIP.UNFRIEND(friendId)
    ),
}

// ❌ Bad: Individual exports, not organized
export const sendRequest = (data) => http.post('/api/send', data)
export const getFriends = () => http.get('/api/friends')
```

**Rules:**
- Group related APIs trong một object
- Type request payload: `(request: TypeName)`
- Type response: `http.method<ApiResponse<DataType>>`
- Use endpoint constants từ `apiConfig`
- Method names: verb + noun (sendRequest, getMyFriends, unfriend)

---

### 7. 🧩 Component Rules (Quy Tắc Components)

**Nguyên tắc chung:**
- Functional components only
- Props interface trước component
- Export named exports
- File name = component name (kebab-case)

#### **Component Structure**
```typescript
// ✅ Good: Typed, documented component
interface FriendListItemProps {
  friend: FriendResponse
  onPress?: (friend: FriendResponse) => void
  onCall?: (friend: FriendResponse) => void
}

/**
 * Displays a friend item with avatar, name, and action buttons
 */
export function FriendListItem({
  friend,
  onPress,
  onCall,
}: FriendListItemProps) {
  return (
    // JSX
  )
}

// ❌ Bad: No types, default export
export default function FriendListItem(props) {
  return // JSX
}
```

**Rules:**
- Interface name: `ComponentNameProps`
- Optional props với `?`
- Destructure props trong parameters
- Named export: `export function ComponentName`
- JSDoc comment mô tả component

---

### 8. 📏 General Code Style Rules

#### **Naming Conventions**
- **Files**: `kebab-case.ts/tsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`
- **Enums**: `PascalCase` with `UPPER_CASE` values

```typescript
// ✅ Good
export const MAX_FILE_SIZE = 5 * 1024 * 1024
export interface UserProfile { }
export enum FriendStatus { ACCEPTED = 'ACCEPTED' }
export function formatUserName(name: string): string { }
export function UserProfileCard() { }

// ❌ Bad
const max_file_size = 5000000
interface userprofile { }
enum friendStatus { accepted = 'accepted' }
function FormatUserName() { }
```

#### **Import Order**
```typescript
// 1. React & React Native
import React from 'react'
import { View, Text } from 'react-native'

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

// 3. Internal absolute imports (@/)
import { handleErrorApi } from '@/utils/error-handler'
import { useAuth } from '@/features/auth'

// 4. Relative imports
import { friendApi } from '../api'
import type { FriendResponse } from '../schemas'
```

#### **Code Organization**
```typescript
// 1. Types & Interfaces (nếu không trong file riêng)
interface ComponentProps { }

// 2. Constants
const MAX_ITEMS = 10

// 3. Component/Function definition
export function Component() {
  // 3.1. Hooks (React hooks first, custom hooks after)
  const [state, setState] = useState()
  const { data } = useQuery()
  
  // 3.2. Derived values
  const count = data?.length ?? 0
  
  // 3.3. Callbacks
  const handleClick = useCallback(() => { }, [])
  
  // 3.4. Effects
  useEffect(() => { }, [])
  
  // 3.5. Render logic
  if (loading) return <Loading />
  
  // 3.6. Return JSX
  return <View />
}

// 4. Helper functions (outside component)
function helperFunction() { }
```

---

### 9. 🚫 Anti-Patterns to Avoid

#### **❌ Don't:**
1. **Hardcode text** - Use i18n
```typescript
// ❌ Bad
<Text>Đồng ý</Text>

// ✅ Good
<Text>{t('friend.actions.accept')}</Text>
```

2. **Magic numbers** - Use named constants
```typescript
// ❌ Bad
if (password.length < 8) { }

// ✅ Good
const MIN_PASSWORD_LENGTH = 8
if (password.length < MIN_PASSWORD_LENGTH) { }
```

3. **Inline styles** - Use StyleSheet or theme
```typescript
// ❌ Bad
<View style={{ padding: 16, margin: 8 }} />

// ✅ Good (với theme)
<View style={{ padding: theme.spacing.md }} />
```

4. **Any type** - Type properly
```typescript
// ❌ Bad
function process(data: any) { }

// ✅ Good
function process<T>(data: T) { }
function process(data: User) { }
```

5. **Console.log** - Use proper logging
```typescript
// ❌ Bad
console.log('User data:', user)

// ✅ Good (development only)
if (__DEV__) {
  console.log('[UserProfile] User data:', user)
}
```

6. **Nested ternaries** - Use if/else or early returns
```typescript
// ❌ Bad
const text = status === 'pending' ? 'Pending' : status === 'accepted' ? 'Accepted' : 'Declined'

// ✅ Good
function getStatusText(status: string): string {
  if (status === 'pending') return 'Pending'
  if (status === 'accepted') return 'Accepted'
  return 'Declined'
}
```

7. **Large components** - Split into smaller ones
```typescript
// ❌ Bad: 500-line component
function FriendRequestScreen() {
  // Too much logic
  // Too many states
  // Too much JSX
}

// ✅ Good: Split into smaller components
function FriendRequestScreen() {
  return (
    <>
      <FriendRequestHeader />
      <FriendRequestTabs />
      <FriendRequestList />
    </>
  )
}
```

---

### 10. ✅ Code Review Checklist

Trước khi submit PR, kiểm tra:

- [ ] **TypeScript**: No `any` types, all functions typed
- [ ] **i18n**: No hardcoded text, all strings use `t()`
- [ ] **Error Handling**: All API calls wrapped with error handlers
- [ ] **Loading States**: Show loading for async operations
- [ ] **Query Keys**: Added to centralized keys factory
- [ ] **Exports**: Added to barrel `index.ts` files
- [ ] **Naming**: Follows naming conventions
- [ ] **Comments**: Complex logic has JSDoc comments
- [ ] **Cleanup**: useEffect cleanup functions added
- [ ] **Validation**: User inputs validated before API calls
- [ ] **Accessibility**: Proper labels, testIDs for testing
- [ ] **Performance**: useMemo/useCallback for expensive operations
- [ ] **Testing**: Unit tests for utilities, integration tests for features

---

## 📚 Related Documentation

- [React Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev/)
- [React i18next Documentation](https://react.i18next.com/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [date-fns Documentation](https://date-fns.org/)

---

**Last Updated**: March 3, 2026
**Maintainer**: Development Team
**Version**: 2.0.0
