import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { TextInput, TouchableOpacity, View, TextInputProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme, useSemanticColors } from '@/context/theme-context'
import { HEADER } from '@/constants/theme'

interface SearchHeaderProps extends TextInputProps {
  onBack?: () => void
  onQrPress?: () => void
  onClear?: () => void
  showQr?: boolean
  backgroundColor?: string
  containerStyle?: object
  onPress?: () => void
  rightAction?: React.ReactNode
}

export const SearchHeader = React.forwardRef<TextInput, SearchHeaderProps>(
  (
    {
      value,
      onChangeText,
      placeholder,
      onBack,
      onQrPress,
      onClear,
      showQr = true,
      backgroundColor,
      containerStyle,
      onPress,
      rightAction,
      ...props
    },
    ref
  ) => {
    const { isDark } = useTheme()
    const semantic = useSemanticColors()

    const InputContainer = onPress ? TouchableOpacity : View
    const inputContainerProps = onPress ? { onPress, activeOpacity: 0.9 } : {}

    const gradientColors = isDark ? HEADER.gradientColorsDark : HEADER.gradientColors

    return (
      <LinearGradient colors={gradientColors} style={containerStyle}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: HEADER.paddingHorizontal,
              height: HEADER.height
            }}
          >
            {onBack && (
              <TouchableOpacity onPress={onBack} style={{ paddingRight: 10 }}>
                <Ionicons name='chevron-back' size={24} color='white' />
              </TouchableOpacity>
            )}

            <InputContainer
              style={{
                flex: 1,
                height: 40,
                backgroundColor: isDark ? semantic.backgroundSecondary : 'rgba(255, 255, 255, 0.22)',
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 10
              }}
              {...inputContainerProps}
            >
              <Ionicons name='search' size={18} color='white' style={{ marginRight: 8 }} />
              <TextInput
                ref={ref}
                style={{
                  flex: 1,
                  height: '100%',
                  color: 'white',
                  fontSize: 16,
                  padding: 0
                }}
                placeholder={placeholder}
                placeholderTextColor='rgba(255, 255, 255, 0.7)'
                value={value}
                onChangeText={onChangeText}
                returnKeyType='search'
                editable={!onPress}
                selectionColor={semantic.primary}
                pointerEvents={onPress ? 'none' : 'auto'}
                {...props}
              />
              {value && value.length > 0 && onClear && (
                <TouchableOpacity onPress={onClear} style={{ padding: 4 }}>
                  <Ionicons name='close-circle' size={18} color='rgba(255, 255, 255, 0.6)' />
                </TouchableOpacity>
              )}
            </InputContainer>

            {showQr && (
              <TouchableOpacity onPress={onQrPress} style={{ padding: 8, marginLeft: 8 }}>
                <Ionicons name='qr-code-outline' size={24} color='white' />
              </TouchableOpacity>
            )}
            {rightAction && <View style={{ marginLeft: 12 }}>{rightAction}</View>}
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }
)

SearchHeader.displayName = 'SearchHeader'
