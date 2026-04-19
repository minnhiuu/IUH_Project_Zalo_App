import React from 'react'
import { View, ScrollView, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '@/context'
import { HEADER } from '@/constants/theme'

interface SettingsDetailScreenProps {
  title: string
  children: React.ReactNode
}

export default function SettingsDetailScreen({ title, children }: SettingsDetailScreenProps) {
  const router = useRouter()
  const { colors, isDark } = useTheme()
  const headerGradient = isDark ? HEADER.gradientColorsDark : HEADER.gradientColors

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      {/* Header */}
      <LinearGradient colors={headerGradient}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: HEADER.paddingHorizontal,
              height: HEADER.height
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name='chevron-back' size={26} color={HEADER.textColor} />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: '600',
                color: HEADER.textColor,
                marginLeft: 4
              }}
            >
              {title}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Scrollable content */}
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
        {children}
      </ScrollView>
    </View>
  )
}
