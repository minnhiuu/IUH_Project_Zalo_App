import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { TextInput, TouchableOpacity, View, TextInputProps } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme, useSemanticColors } from '@/context/theme-context'

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
    const insets = useSafeAreaInsets()
    const { isDark } = useTheme()
    const semantic = useSemanticColors()

    const InputContainer = onPress ? TouchableOpacity : View
    const inputContainerProps = onPress ? { onPress, activeOpacity: 0.9 } : {}

    const gradientColors = isDark ? ([semantic.input, semantic.divider] as const) : (['#0068FF', '#0055DD'] as const) // Blue gradient for light mode

    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[{ paddingTop: insets.top }, containerStyle]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56 }}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={{ padding: 4, marginRight: 8 }}>
              <Ionicons name='arrow-back' size={24} color='white' />
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
              <Ionicons name='qr-code' size={22} color='white' />
            </TouchableOpacity>
          )}
          {rightAction && <View style={{ marginLeft: 12 }}>{rightAction}</View>}
        </View>
      </LinearGradient>
    )
  }
)

SearchHeader.displayName = 'SearchHeader'
