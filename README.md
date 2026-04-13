# BondHub Mobile App 📱

Ứng dụng chat mobile được xây dựng với React Native & Expo, kết nối với BondHub Backend Microservices.

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án chi tiết](#-cấu-trúc-dự-án-chi-tiết)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Cấu hình môi trường](#-cấu-hình-môi-trường)
- [Scripts và Commands](#-scripts-và-commands)
- [Chạy Backend](#-chạy-backend)
- [Chạy Mobile App](#-chạy-mobile-app)
- [Cấu hình API](#-cấu-hình-api)
- [Kiến trúc & Patterns](#-kiến-trúc--patterns)
- [Tính năng đã triển khai](#-tính-năng-đã-triển-khai)

---

## 🎯 Tổng quan

BondHub Mobile là ứng dụng chat nhắn tin tương tự Zalo, được xây dựng theo kiến trúc feature-based với:

- **Authentication**: Đăng nhập, đăng ký, refresh token tự động
- **i18n**: Đa ngôn ngữ (Tiếng Việt, Tiếng Anh)
- **Offline-first**: Lưu trữ local với AsyncStorage & SecureStore
- **Real-time**: WebSocket cho tin nhắn real-time (coming soon)

---

## 🛠 Công nghệ sử dụng

| Công nghệ             | Phiên bản | Mục đích               |
| --------------------- | --------- | ---------------------- |
| **Expo**              | 54        | Framework React Native |
| **React Native**      | 0.81      | Mobile framework       |
| **TypeScript**        | 5.x       | Type safety            |
| **Expo Router**       | 6         | File-based routing     |
| **NativeWind**        | 4.x       | TailwindCSS cho RN     |
| **Zustand**           | 5.x       | State management       |
| **TanStack Query**    | 5.x       | Server state & caching |
| **Axios**             | 1.x       | HTTP client            |
| **i18next**           | 25.x      | Internationalization   |
| **expo-secure-store** | 15.x      | Secure token storage   |

---

## 📁 Cấu trúc dự án chi tiết

```
zalo-app-mobile/
├── 📱 app/                              # Expo Router - File-based routing
│   ├── _layout.tsx                     # Root layout (khởi tạo providers)
│   │
│   ├── (tabs)/                         # Tab navigation group
│   │   ├── _layout.tsx                # Tab bar configuration
│   │   ├── index.tsx                  # Home/Messages tab
│   │   ├── contacts.tsx               # Danh bạ
│   │   ├── discover.tsx               # Khám phá
│   │   ├── timeline.tsx               # Timeline
│   │   └── profile.tsx                # Trang cá nhân
│   │
│   ├── auth/                          # Authentication flows
│   │   ├── _layout.tsx               # Auth layout (stack navigator)
│   │   ├── index.tsx                 # Welcome screen
│   │   ├── login.tsx                 # Màn hình đăng nhập
│   │   ├── register.tsx              # Đăng ký
│   │   ├── forgot-password.tsx       # Quên mật khẩu
│   │   └── verify-otp.tsx            # Xác thực OTP
│   │
│   ├── settings/                      # Settings screens
│   │   └── index.tsx
│   │
│   ├── friend-requests/               # Lời mời kết bạn
│   │   └── index.tsx
│   │
│   └── qr/                            # QR Code features
│       ├── index.tsx                  # QR Scanner
│       └── confirm.tsx                # Xác nhận kết bạn
│
├── 🎯 features/                         # Feature-based architecture
│   │
│   ├── auth/                          # 🔐 Authentication Feature
│   │   ├── api/
│   │   │   ├── auth.api.ts           # Login, register, refresh APIs
│   │   │   └── index.ts
│   │   │
│   │   ├── components/
│   │   │   ├── login-form.tsx        # Form đăng nhập (với validation)
│   │   │   ├── register-form.tsx     # Form đăng ký
│   │   │   ├── forgot-password-form.tsx
│   │   │   ├── logout-button.tsx
│   │   │   └── welcome-screen.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-auth.ts           # Hook truy cập auth store
│   │   │   ├── use-login.ts          # Login mutation
│   │   │   ├── use-logout.ts         # Logout handler
│   │   │   └── use-auth-init.ts      # Initialize auth state
│   │   │
│   │   ├── queries/
│   │   │   ├── keys.ts               # React Query keys
│   │   │   ├── use-mutations.ts      # Login/Register mutations
│   │   │   └── use-queries.ts        # Validate token query
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.schema.ts        # Zod validation schemas
│   │   │   ├── auth.types.ts         # TypeScript types
│   │   │   └── index.ts
│   │   │
│   │   └── i18n/
│   │       └── locales/              # Feature-specific translations
│   │           ├── en.json
│   │           └── vi.json
│   │
│   └── user/                          # 👤 User Feature
│       ├── api/
│       │   └── user.api.ts           # Get profile, update, search
│       ├── queries/
│       │   ├── keys.ts
│       │   ├── use-mutations.ts
│       │   └── use-queries.ts
│       └── schemas/
│           └── user.schema.ts
│
├── 🧩 components/                       # Shared UI Components
│   ├── index.ts
│   ├── loading-screen.tsx             # Full screen loader
│   ├── welcome-screen.tsx
│   │
│   └── ui/                            # UI Primitives (Gluestack UI)
│       ├── button-v4.tsx             # Custom button
│       ├── input-v4.tsx              # Custom input
│       ├── text-v4.tsx               # Typography
│       ├── avatar-v4.tsx             # Avatar component
│       ├── card-v4.tsx
│       ├── header-v4.tsx
│       ├── examples.tsx
│       └── gluestack-ui-provider/
│           └── index.tsx             # Theme provider
│
├── ⚙️ config/                           # Cấu hình ứng dụng
│   ├── apiConfig.ts                   # 🔥 API Base URLs
│   ├── axiosInstance.ts               # Deprecated - dùng lib/http.ts
│   └── index.ts
│
├── 🌍 i18n/                             # Internationalization
│   ├── index.ts                       # i18next setup
│   └── locales/
│       ├── en.json                    # English translations
│       └── vi.json                    # Tiếng Việt
│
├── 🔧 lib/                              # Core Libraries
│   ├── http.ts                        # 🔥 Axios instance + interceptors
│   ├── react-query.ts                 # 🔥 QueryClient config
│   ├── utils.ts                       # Tailwind merge utilities
│   └── index.ts
│
├── 💾 store/                            # Zustand Global State
│   ├── authStore.ts                   # 🔥 Auth state (user, tokens)
│   └── index.ts
│
├── 📝 types/                            # TypeScript Definitions
│   ├── common.types.ts                # Common types
│   └── index.ts
│
├── 🛠 utils/                            # Utility Functions
│   ├── storageUtils.ts                # AsyncStorage wrapper
│   ├── jwt.ts                         # JWT decode/validate
│   ├── error-handler.ts               # Error formatting
│   ├── dateUtils.ts                   # Date formatting
│   ├── stringUtils.ts
│   └── validationUtils.ts
│
├── 🪝 hooks/                            # Custom React Hooks
│   ├── use-color-scheme.ts            # Dark mode
│   ├── use-theme-color.ts
│   ├── useDebounce.ts
│   ├── useKeyboard.ts
│   └── useLoading.ts
│
├── 🎨 assets/
│   └── images/                        # App icons & splash
│
├── 🔐 context/
│   ├── theme-context.tsx              # Theme provider
│   └── index.ts
│
├── 📄 Các file cấu hình
│   ├── .env                           # 🔥 Environment variables
│   ├── app.json                       # Expo configuration
│   ├── package.json                   # Dependencies & scripts
│   ├── tsconfig.json                  # TypeScript config
│   ├── tailwind.config.js             # Tailwind CSS
│   ├── babel.config.js                # Babel transformer
│   ├── metro.config.js                # Metro bundler
│   ├── eslint.config.js               # ESLint rules
│   ├── .prettierrc                    # Code formatting
│   └── global.css                     # Global Tailwind styles
│
└── 📚 docs/                             # Documentation
```

### 🔥 Files quan trọng cần hiểu

| File                                  | Mô tả                         | Điểm chính                                       |
| ------------------------------------- | ----------------------------- | ------------------------------------------------ |
| **`lib/http.ts`**                     | Axios instance & interceptors | Request/response interceptor, auto refresh token |
| **`store/authStore.ts`**              | Zustand auth state            | User info, tokens, persist config                |
| **`config/apiConfig.ts`**             | API endpoints                 | BASE_URL theo môi trường                         |
| **`app/_layout.tsx`**                 | Root layout                   | Setup providers (QueryClient, i18n, auth)        |
| **`features/auth/hooks/use-auth.ts`** | Auth hook                     | Login/logout logic, token management             |
| **`.env`**                            | Environment variables         | API URL, Socket URL                              |

---

## ⚙️ Cấu hình môi trường

### 📄 File `.env`

```dotenv
# API Configuration
EXPO_PUBLIC_API_URL=http://192.168.1.19:8080/api
EXPO_PUBLIC_SOCKET_URL=http://192.168.1.19:8080
EXPO_PUBLIC_ENV=development
```

**Lưu ý:**

- Thay `192.168.1.19` bằng IP máy tính của bạn
- Android Emulator: dùng `http://10.0.2.2:8080`
- iOS Simulator: dùng `http://localhost:8080`
- Thiết bị thật: dùng IP thực của máy tính (cùng WiFi)

### 📄 File `config/apiConfig.ts`

```typescript
import Constants from 'expo-constants'

type Environment = 'development' | 'staging' | 'production'

interface ApiConfigType {
  apiUrl: string
  socketUrl: string
  timeout: number
}

// 🔥 Lấy từ .env
const ENV = (Constants.expoConfig?.extra?.env || 'development') as Environment

const API_CONFIG: Record<Environment, ApiConfigType> = {
  development: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/api',
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL || 'http://10.0.2.2:8080',
    timeout: 30000 // 30s
  },
  staging: {
    apiUrl: 'https://staging-api.bondhub.com/api',
    socketUrl: 'https://staging-api.bondhub.com',
    timeout: 30000
  },
  production: {
    apiUrl: 'https://api.bondhub.com/api',
    socketUrl: 'https://api.bondhub.com',
    timeout: 30000
  }
}

export const currentConfig = API_CONFIG[ENV]

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    VALIDATE: '/auth/validate',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp'
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    SEARCH: '/user/search',
    UPDATE_AVATAR: '/user/avatar',
    CHANGE_PASSWORD: '/user/change-password'
  },
  MESSAGE: {
    CONVERSATIONS: '/message/conversations',
    SEND: '/message/send',
    MESSAGES: '/message/:conversationId'
  },
  FRIEND: {
    LIST: '/friend/list',
    REQUESTS: '/friend/requests',
    SEND_REQUEST: '/friend/request',
    ACCEPT_REQUEST: '/friend/accept',
    REJECT_REQUEST: '/friend/reject'
  },
  NOTIFICATION: {
    LIST: '/notification/list',
    READ: '/notification/:id/read',
    READ_ALL: '/notification/read-all'
  }
}
```

### 📄 File `lib/http.ts` - Axios Instance

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { currentConfig } from '@/config/apiConfig'
import { useAuthStore } from '@/store/authStore'
import { refreshToken } from '@/features/auth/api/auth.api'

// 🔥 Tạo Axios instance
export const http = axios.create({
  baseURL: currentConfig.apiUrl,
  timeout: currentConfig.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 🔥 Request Interceptor - Attach token
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState()

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// 🔥 Response Interceptor - Handle 401 & Refresh Token
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config

    // 🔥 Auto refresh token khi 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return http(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const { refreshToken: rToken, setTokens, clearAuth } = useAuthStore.getState()

      if (!rToken) {
        clearAuth()
        return Promise.reject(error)
      }

      try {
        const response = await refreshToken(rToken)
        const newAccessToken = response.data.access_token

        setTokens(newAccessToken, rToken)
        processQueue(null, newAccessToken)

        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken
        return http(originalRequest)
      } catch (err) {
        processQueue(err, null)
        clearAuth()
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default http
```

### 📄 File `store/authStore.ts` - Zustand Store

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

interface User {
  id: string
  phoneNumber: string
  displayName?: string
  avatar?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  // Actions
  setUser: (user: User) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  updateUser: (updates: Partial<User>) => void
}

// 🔥 Lưu token vào SecureStore
const saveTokensToSecureStore = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync('accessToken', accessToken)
  await SecureStore.setItemAsync('refreshToken', refreshToken)
}

const clearTokensFromSecureStore = async () => {
  await SecureStore.deleteItemAsync('accessToken')
  await SecureStore.deleteItemAsync('refreshToken')
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: true })
      },

      setTokens: async (accessToken, refreshToken) => {
        await saveTokensToSecureStore(accessToken, refreshToken)
        set({ accessToken, refreshToken, isAuthenticated: true })
      },

      clearAuth: async () => {
        await clearTokensFromSecureStore()
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        })
      },

      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } })
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // ⚠️ Không lưu tokens vào AsyncStorage (dùng SecureStore)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
```

### 📄 File `lib/react-query.ts` - React Query Config

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000 // 10 minutes
    },
    mutations: {
      retry: 1
    }
  }
})
```

### 📄 File `app.json` - Expo Config

```json
{
  "expo": {
    "name": "zalo-app-mobile",
    "slug": "zalo-app-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "zaloappmobile",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
}
```

---

## 📜 Scripts và Commands

### Package.json Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "expo lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "reset-project": "node ./scripts/reset-project.js"
  }
}
```

### Các lệnh thường dùng

```bash
# 🚀 Development
npm start                    # Khởi động Expo Dev Server
npm run android              # Chạy trên Android Emulator
npm run ios                  # Chạy trên iOS Simulator
npm run web                  # Chạy trên web browser

# 🧹 Maintenance
npm run format               # Format code với Prettier
npm run lint                 # Kiểm tra lỗi ESLint
npx expo start -c            # Clear cache và start
npx expo install --check     # Kiểm tra dependencies

# 🔧 Advanced
npx expo start --tunnel      # Dùng tunnel (khi không cùng WiFi)
npx expo start --offline     # Chạy offline mode
npx expo prebuild            # Generate native code
npx expo doctor              # Kiểm tra config

# 📦 Build
eas build --platform android  # Build APK (cần Expo EAS)
eas build --platform ios      # Build IPA

# 🧪 Testing
npm test                     # Chạy tests (nếu có)
```

---

## 🏗 Kiến trúc & Patterns

### Cho Mobile Development

- **Node.js**: 18.x hoặc cao hơn
- **npm/yarn**: npm 9+ hoặc yarn 1.22+
- **Expo CLI**: `npm install -g expo-cli`
- **Android Studio** (cho Android): API Level 33+
- **Xcode** (cho iOS, chỉ macOS): 14+

### Cho Backend

- **Java JDK**: 21+
- **Maven**: 3.8+ (hoặc dùng wrapper `mvnw`)
- **Docker & Docker Compose**: Cho infrastructure services

### Thiết bị test

- **Android**:
  - Android Emulator (Android Studio)
  - Hoặc thiết bị thật với Expo Go
- **iOS**:
  - iOS Simulator (Xcode, chỉ macOS)
  - Hoặc thiết bị thật với Expo Go

---

## 🚀 Hướng dẫn cài đặt

### 1. Clone dự án

```bash
git clone <repository-url>
cd CongNgheMoi_Project
```

### 2. Cài đặt dependencies cho Mobile

```bash
cd zalo-app-mobile
npm install
```

---

## 🔧 Chạy Backend

Backend sử dụng kiến trúc Microservices với Spring Boot. Cần khởi động theo đúng thứ tự.

### Bước 1: Khởi động Infrastructure (Docker)

```bash
cd IUH_Project_Zalo_BE

# Khởi động PostgreSQL, MongoDB, Redis, RabbitMQ
docker-compose up -d postgres mongodb redis rabbitmq
```

Kiểm tra services đã chạy:

```bash
docker-compose ps
```

### Bước 2: Build dự án

```bash
# Windows
mvnw.cmd clean install -DskipTests

# Linux/macOS
./mvnw clean install -DskipTests
```

### Bước 3: Khởi động các services (theo thứ tự)

> ⚠️ **Quan trọng**: Mỗi service chạy trong một terminal riêng. Chờ service trước khởi động xong mới chạy service tiếp theo.

**Terminal 1 - Config Server (Port 8888):**

```bash
cd config-server
..\mvnw spring-boot:run
```

> ⏳ Chờ thấy log: "Started ConfigServerApplication"

**Terminal 2 - Discovery Server (Port 8761):**

```bash
cd discovery-server
..\mvnw spring-boot:run
```

> ⏳ Chờ thấy log: "Started DiscoveryServerApplication"
>
> ✅ Kiểm tra: http://localhost:8761

**Terminal 3 - Auth Service (Port 8084):**

```bash
cd auth-service
..\mvnw spring-boot:run
```

**Terminal 4 - User Service (Port 8081):**

```bash
cd user-service
..\mvnw spring-boot:run
```

**Terminal 5 - API Gateway (Port 8080):**

```bash
cd api-gateway
..\mvnw spring-boot:run
```

### Bước 4: Verify Backend

| Kiểm tra         | URL                                   | Kết quả mong đợi                 |
| ---------------- | ------------------------------------- | -------------------------------- |
| Eureka Dashboard | http://localhost:8761                 | Hiển thị các services đã đăng ký |
| Gateway Health   | http://localhost:8080/actuator/health | `{"status": "UP"}`               |

**Test Login API:**

```bash
curl -X POST http://localhost:8080/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\": \"0901234567\", \"password\": \"123456\"}"
```

### Bảng Port Services

| Service              | Port | Mô tả                           |
| -------------------- | ---- | ------------------------------- |
| **API Gateway**      | 8080 | Entry point cho tất cả requests |
| User Service         | 8081 | Quản lý user profile            |
| Message Service      | 8082 | Xử lý tin nhắn                  |
| Notification Service | 8083 | Push notifications              |
| Auth Service         | 8084 | Authentication & JWT            |
| Eureka Server        | 8761 | Service discovery               |
| Config Server        | 8888 | Centralized config              |

---

## 📱 Chạy Mobile App

### Bước 1: Cấu hình API URL

Mở file `config/apiConfig.ts` và cấu hình đúng API URL:

```typescript
const API_CONFIG: Record<Environment, ApiConfigType> = {
  development: {
    // 👇 Chọn 1 trong các options sau:

    // Option 1: Android Emulator
    apiUrl: 'http://10.0.2.2:8080',

    // Option 2: iOS Simulator
    // apiUrl: 'http://localhost:8080',

    // Option 3: Thiết bị thật (thay YOUR_IP)
    // apiUrl: 'http://192.168.1.100:8080',

    socketUrl: 'http://10.0.2.2:8082'
  }
  // ...
}
```

> 💡 **Tìm IP máy tính của bạn:**
>
> ```bash
> # Windows
> ipconfig
> # Tìm dòng "IPv4 Address"
>
> # macOS/Linux
> ifconfig | grep inet
> ```

### Bước 2: Khởi động Expo

```bash
cd zalo-app-mobile

# Khởi động development server
npm start
```

### Bước 3: Chạy trên thiết bị

#### Android Emulator

```bash
npm run android
```

Hoặc nhấn `a` trong Expo terminal

#### iOS Simulator (macOS only)

```bash
npm run ios
```

Hoặc nhấn `i` trong Expo terminal

#### Thiết bị thật (Expo Go)

1. Cài app **Expo Go** từ App Store / Google Play
2. Đảm bảo điện thoại và máy tính **cùng mạng WiFi**
3. Scan QR code hiển thị trong terminal
4. App sẽ tự động load

---

## ⚙️ Cấu hình API

### API Endpoints

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login', // POST - Đăng nhập
    REGISTER: '/auth/register', // POST - Đăng ký
    REFRESH: '/auth/refresh', // POST - Refresh token
    VALIDATE: '/auth/validate' // GET  - Validate token
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    SEARCH: '/user/search'
  },
  MESSAGE: {
    CONVERSATIONS: '/message/conversations',
    SEND: '/message/send'
  }
}
```

### Request/Response Format

**Login Request:**

```json
POST /auth/login
Content-Type: application/json

{
  "phoneNumber": "0901234567",
  "password": "123456"
}
```

**Login Response (Success):**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 3600
  },
  "message": null,
  "timestamp": "2026-01-22T10:00:00Z"
}
```

---

## ✅ Tính năng đã triển khai

### Authentication ✓

- [x] Đăng nhập với số điện thoại
- [x] Lưu token an toàn với SecureStore
- [x] Auto refresh token khi sắp hết hạn
- [x] Interceptor xử lý 401 tự động
- [x] Đăng xuất (clear local tokens)
- [x] Form validation với i18n messages

### Internationalization (i18n) ✓

- [x] Tiếng Việt (vi)
- [x] Tiếng Anh (en)
- [x] Auto detect ngôn ngữ thiết bị
- [x] Error messages đa ngôn ngữ

### State Management ✓

- [x] Zustand store cho auth state
- [x] Persist với AsyncStorage
- [x] React Query cho server state
- [x] Optimistic updates

### UI/UX ✓

- [x] NativeWind (TailwindCSS)
- [x] Toast notifications
- [x] Loading states
- [x] Error handling

---

## 🐛 Troubleshooting

### 1. Network Error / Cannot connect to API

**Triệu chứng:** App báo lỗi network hoặc timeout

**Giải pháp:**

- Kiểm tra backend đã chạy: http://localhost:8080/actuator/health
- Với Android Emulator, dùng `10.0.2.2` thay vì `localhost`
- Kiểm tra firewall không chặn port 8080

### 2. Expo Go không load được app

**Triệu chứng:** QR code scan nhưng app không load

**Giải pháp:**

- Đảm bảo điện thoại và PC cùng mạng WiFi
- Thử: `npx expo start --tunnel`
- Restart Expo: `npx expo start -c` (clear cache)

### 3. Login thất bại

**Triệu chứng:** Nhập đúng thông tin nhưng báo lỗi

**Giải pháp:**

- Kiểm tra Auth Service đã chạy (port 8084)
- Kiểm tra user đã tồn tại trong database
- Xem log của Auth Service để debug

### 4. Token refresh loop

**Triệu chứng:** App liên tục gọi refresh token

**Giải pháp:**

- Clear app data: Settings → Apps → Expo Go → Clear Data
- Hoặc logout và login lại

---

## 📝 Scripts

```bash
# Development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web

# Lint code
npm run lint

# Clear cache and start
npx expo start -c

# Reset project
npm run reset-project
```

---

## 🏗 Kiến trúc & Patterns

### 1. Feature-based Architecture

Dự án sử dụng **Feature-based folder structure** thay vì layer-based:

```
✅ GOOD (Feature-based)
features/
├── auth/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   └── queries/
└── user/
    ├── api/
    └── components/

❌ BAD (Layer-based)
src/
├── components/     # Tất cả components
├── hooks/          # Tất cả hooks
└── api/            # Tất cả APIs
```

**Ưu điểm:**

- Dễ scale khi thêm tính năng mới
- Code liên quan gom lại 1 chỗ
- Dễ refactor/xóa feature

### 2. State Management Strategy

```
┌─────────────────────────────────────────┐
│           Component Tree                │
├─────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  Local State │  │  Server State   │ │
│  │  (useState)  │  │ (React Query)   │ │
│  └──────────────┘  └─────────────────┘ │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     Global State (Zustand)      │   │
│  │  - Auth (user, tokens)          │   │
│  │  - Theme                        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Nguyên tắc:**

- **Local State**: UI state (modal open/close, form inputs)
- **Zustand**: Global app state (auth, theme, settings)
- **React Query**: Server data (API responses, caching)

### 3. Data Flow

```
Component
    ↓
Custom Hook (use-auth.ts)
    ↓
React Query (useMutation/useQuery)
    ↓
API Layer (auth.api.ts)
    ↓
Axios Instance (lib/http.ts)
    ↓
Backend API (Spring Boot)
```

### 4. Token Refresh Flow

```
1. User login
   → Save access_token (SecureStore) ✓
   → Save refresh_token (SecureStore) ✓
   → Save user (AsyncStorage via Zustand) ✓

2. API call
   → Interceptor attach Bearer token
   → Request sent

3. Token expired (401)
   → Interceptor catch 401
   → Call /auth/refresh with refresh_token
   → Save new tokens
   → Retry original request

4. Refresh token expired
   → Clear all auth data
   → Redirect to login
```

### 5. Form Validation với Zod

```typescript
// Schema
import { z } from 'zod'

export const loginSchema = z.object({
  phoneNumber: z.string().min(10).max(11),
  password: z.string().min(6)
})

// Component sử dụng
const handleSubmit = (data: LoginFormData) => {
  // Data đã được validate bởi Zod
  loginMutation.mutate(data)
}
```

### 6. Error Handling

```typescript
// Centralized error handler
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    return message || 'Đã có lỗi xảy ra'
  }
  return 'Lỗi không xác định'
}

// Usage in component
import Toast from 'react-native-toast-message'

try {
  await login(data)
} catch (error) {
  const message = handleApiError(error)
  Toast.show({ type: 'error', text1: message })
}
```

### 7. Internationalization (i18n)

```typescript
// Component usage
import { useTranslation } from 'react-i18next'

const { t, i18n } = useTranslation()

<Text>{t('auth.login')}</Text>

// Đổi ngôn ngữ
i18n.changeLanguage('en')
```

### 8. Routing với Expo Router

```typescript
// File-based routing
app/
├── _layout.tsx           → /
├── (tabs)/
│   ├── index.tsx        → / (home)
│   └── profile.tsx      → /profile
└── auth/
    ├── login.tsx        → /auth/login
    └── register.tsx     → /auth/register

// Navigation
import { router } from 'expo-router'

router.push('/auth/login')
router.replace('/') // No back
router.back()
```

---

## 📚 Tài liệu tham khảo

- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [NativeWind](https://www.nativewind.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Query](https://tanstack.com/query)
- [i18next](https://www.i18next.com/)

---

## 👥 Team

**IUH - Công Nghệ Mới Project**

## 📄 License

MIT License - Dự án phục vụ mục đích học tập.
