# Zalo Clone Mobile App 📱

A mobile application clone of Zalo built with React Native & Expo.

## Tech Stack

- **Framework:** React Native with Expo
- **Styling:** NativeWind (TailwindCSS for React Native)
- **State Management:** Zustand
- **Data Fetching:** TanStack React Query
- **Navigation:** Expo Router (file-based routing)
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client

## Project Structure

```
zalo-app-mobile/
├── app/                    # Screens (file-based routing)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Messages screen
│   │   ├── contacts.tsx   # Contacts screen
│   │   ├── discover.tsx   # Discover screen
│   │   ├── timeline.tsx   # Timeline screen
│   │   └── profile.tsx    # Profile screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   ├── Container.tsx
│   │   ├── Divider.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Header.tsx
│   │   ├── Input.tsx
│   │   ├── ListItem.tsx
│   │   └── Loading.tsx
│   └── index.ts
├── config/               # App configuration
│   ├── apiConfig.ts     # API endpoints config
│   └── axiosInstance.ts # Axios setup with interceptors
├── constants/           # App constants
│   └── theme.ts        # Colors, fonts, spacing
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── service/            # API services
├── store/              # Zustand stores
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zalo-app-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on device/emulator:
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

## Development Guidelines

### Adding New Screens

1. Create a new file in `app/` directory
2. The file name becomes the route path
3. Export a default React component

### Adding New Components

1. Create component in `components/ui/` for base components
2. Create component in `components/` for feature-specific components
3. Export from `components/index.ts`

### Adding API Services

1. Create service file in `service/`
2. Use `axiosInstance` for HTTP requests
3. Define types in `types/`
4. Export from `service/index.ts`

### Adding State (Zustand)

1. Create store file in `store/`
2. Use `create` from zustand
3. Export from `store/index.ts`

## Styling with NativeWind

Use TailwindCSS classes directly in `className` prop:

```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-lg font-bold text-primary">Hello World</Text>
</View>
```

Custom colors defined in `tailwind.config.js`:
- `primary` - Zalo blue (#0068FF)
- `secondary` - Purple accent
- `text`, `text-secondary`, `text-tertiary`
- `background`, `background-secondary`
- `success`, `warning`, `error`, `info`

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on Web
- `npm run lint` - Run ESLint

## Contributing

1. Create a new branch for your feature
2. Follow the existing code structure
3. Write clean, documented code
4. Test on both Android and iOS
5. Create a pull request

## License

This project is for educational purposes only.

# IUH_Project_Zalo_App
