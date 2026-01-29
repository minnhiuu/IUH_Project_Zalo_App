# BondHub Mobile App 📱

Ứng dụng chat mobile được xây dựng với React Native & Expo, kết nối với BondHub Backend Microservices.

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Chạy Backend](#-chạy-backend)
- [Chạy Mobile App](#-chạy-mobile-app)
- [Cấu hình API](#-cấu-hình-api)
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

## 📁 Cấu trúc dự án

```
zalo-app-mobile/
├── app/                          # Screens (Expo Router)
│   ├── _layout.tsx              # Root layout
│   ├── (tabs)/                  # Tab navigation
│   │   ├── index.tsx            # Messages
│   │   ├── contacts.tsx         # Contacts
│   │   ├── discover.tsx         # Discover
│   │   ├── timeline.tsx         # Timeline
│   │   └── profile.tsx          # Profile
│   └── auth/                    # Auth screens
│       └── login.tsx
│
├── features/                     # Feature modules
│   └── auth/                    # Authentication feature
│       ├── api/                 # API calls
│       │   └── auth.api.ts
│       ├── components/          # Auth components
│       │   ├── login-form.tsx
│       │   └── logout-button.tsx
│       ├── hooks/               # Auth hooks
│       │   ├── use-auth.ts
│       │   ├── use-login.ts
│       │   ├── use-logout.ts
│       │   └── use-auth-init.ts
│       ├── queries/             # Query keys
│       │   └── auth.keys.ts
│       └── schemas/             # Validation
│           └── auth.schema.ts
│
├── components/                   # Shared components
│   └── ui/                      # UI primitives
│
├── config/                       # Configuration
│   └── apiConfig.ts             # API endpoints
│
├── i18n/                        # Internationalization
│   ├── index.ts
│   └── locales/
│       ├── en.json              # English
│       └── vi.json              # Vietnamese
│
├── lib/                         # Core utilities
│   ├── http.ts                  # Axios instance + interceptors
│   ├── react-query.ts           # Query client
│   └── utils.ts
│
├── store/                       # Global state
│   └── authStore.ts             # Auth Zustand store
│
├── types/                       # TypeScript types
│   ├── auth.types.ts
│   ├── user.types.ts
│   └── common.types.ts
│
└── utils/                       # Utility functions
    ├── storageUtils.ts
    └── jwt.ts
```

---

## 💻 Yêu cầu hệ thống

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
