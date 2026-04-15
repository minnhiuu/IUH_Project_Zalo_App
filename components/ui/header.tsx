import { Ionicons } from '@expo/vector-icons'
import { View, TextInput, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from './text'
import { HEADER } from '@/constants/theme'
import { useTheme } from '@/context'

interface HeaderProps {
  // Search props
  showSearch?: boolean
  searchPlaceholder?: string
  onSearchChange?: (text: string) => void
  searchValue?: string

  // Title (for non-search headers)
  title?: string
  showBackButton?: boolean

  // Right icons
  showQRButton?: boolean
  showAddButton?: boolean
  showSettingsButton?: boolean
  showSearchButton?: boolean
  showBellButton?: boolean
  bellUnreadCount?: number
  onQRPress?: () => void
  onAddPress?: () => void
  onSettingsPress?: () => void
  onSearchPress?: () => void
  onBackPress?: () => void
  onBellPress?: () => void
}

export function Header({
  showSearch = true,
  searchPlaceholder = 'Tìm kiếm',
  onSearchChange,
  searchValue,
  title,
  showBackButton = false,
  showQRButton = false,
  showAddButton = false,
  showSettingsButton = false,
  showSearchButton = false,
  showBellButton = false,
  bellUnreadCount = 0,
  onQRPress,
  onAddPress,
  onSettingsPress,
  onSearchPress,
  onBackPress,
  onBellPress
}: HeaderProps) {
  const router = useRouter()
  const { isDark } = useTheme()
  const headerGradient = isDark ? HEADER.gradientColorsDark : HEADER.gradientColors

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  return (
    <LinearGradient colors={headerGradient}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
        <View
          style={{
            paddingHorizontal: HEADER.paddingHorizontal,
            height: HEADER.height
          }}
        >
          <View className='flex-row items-center gap-3 h-full'>
            {/* Back Button */}
            {showBackButton && (
              <Pressable onPress={handleBackPress} className='mr-1'>
                <Ionicons name='chevron-back' size={24} color={HEADER.textColor} />
              </Pressable>
            )}

            {/* Search Icon or Title */}
            {showSearch ? (
              <Pressable
                onPress={() => router.push('/search')}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name='search' size={24} color={HEADER.textColor} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text size='md' style={{ color: HEADER.searchPlaceholderColor }}>
                    {searchPlaceholder}
                  </Text>
                </View>
              </Pressable>
            ) : (
              <View className='flex-1'>
                <Text size='lg' bold={true} className='text-white'>
                  {title}
                </Text>
              </View>
            )}

            {/* Right Icons - All standardized to 24px */}
            {showSearchButton && (
              <Pressable onPress={onSearchPress}>
                <Ionicons name='search' size={24} color={HEADER.textColor} />
              </Pressable>
            )}

            {showQRButton && (
              <Pressable onPress={onQRPress}>
                <Ionicons name='qr-code-outline' size={24} color={HEADER.textColor} />
              </Pressable>
            )}

            {showAddButton && (
              <Pressable onPress={onAddPress}>
                <Ionicons name='add' size={24} color={HEADER.textColor} />
              </Pressable>
            )}

            {showSettingsButton && (
              <Pressable onPress={onSettingsPress}>
                <Ionicons name='settings-outline' size={24} color={HEADER.textColor} />
              </Pressable>
            )}

            {showBellButton && (
              <Pressable onPress={onBellPress} style={{ position: 'relative' }}>
                <Ionicons name='notifications-outline' size={24} color={HEADER.textColor} />
                {bellUnreadCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -6,
                      backgroundColor: '#ef4444',
                      borderRadius: 10,
                      minWidth: 18,
                      height: 18,
                      paddingHorizontal: 4,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1.5,
                      borderColor: '#fff'
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>
                      {bellUnreadCount > 99 ? '99+' : String(bellUnreadCount)}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}
