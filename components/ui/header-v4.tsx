import { Ionicons } from '@expo/vector-icons'
import { View, TextInput, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { TextV4 as Text } from './text-v4'
import { HEADER, BRAND } from '@/constants/theme'

interface HeaderV4Props {
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
  onQRPress?: () => void
  onAddPress?: () => void
  onSettingsPress?: () => void
  onSearchPress?: () => void
  onBackPress?: () => void
}

export function HeaderV4({
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
  onQRPress,
  onAddPress,
  onSettingsPress,
  onSearchPress,
  onBackPress
}: HeaderV4Props) {
  const router = useRouter()

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress()
    } else {
      router.back()
    }
  }

  return (
    <View style={{ backgroundColor: HEADER.backgroundColor }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: HEADER.backgroundColor }}>
        <View
          style={{
            paddingHorizontal: HEADER.paddingHorizontal,
            paddingVertical: HEADER.paddingVertical,
            height: HEADER.height
          }}
        >
          <View className="flex-row items-center gap-3 h-full">
            {/* Back Button */}
            {showBackButton && (
              <Pressable onPress={handleBackPress} className="mr-1">
                <Ionicons name="chevron-back" size={24} color={HEADER.textColor} />
              </Pressable>
            )}

            {/* Search Icon or Title */}
            {showSearch ? (
              <>
                <Ionicons name="search" size={24} color={HEADER.textColor} />
                <View className="flex-1">
                  <TextInput
                    placeholder={searchPlaceholder}
                    placeholderTextColor={HEADER.searchPlaceholderColor}
                    className="text-white text-base"
                    style={{ color: HEADER.textColor }}
                    value={searchValue}
                    onChangeText={onSearchChange}
                  />
                </View>
              </>
            ) : (
              <View className="flex-1">
                <Text size="lg" weight="bold" className="text-white">
                  {title}
                </Text>
              </View>
            )}

            {/* Right Icons - All standardized to 24px */}
            {showSearchButton && (
              <Pressable onPress={onSearchPress}>
                <Ionicons name="search" size={24} color={HEADER.textColor} />
              </Pressable>
            )}

            {showQRButton && (
              <Pressable onPress={onQRPress}>
                <Ionicons name="qr-code-outline" size={24} color={HEADER.textColor} />
              </Pressable>
            )}

            {showAddButton && (
              <Pressable onPress={onAddPress}>
                <Ionicons name="add" size={24} color={HEADER.textColor} />
              </Pressable>
            )}

            {showSettingsButton && (
              <Pressable onPress={onSettingsPress}>
                <Ionicons name="settings-outline" size={24} color={HEADER.textColor} />
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  )
}
