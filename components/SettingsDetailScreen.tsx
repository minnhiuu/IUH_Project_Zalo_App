import React from 'react'
import { View, ScrollView, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTheme } from '@/context'
import { HEADER } from '@/constants/theme'

interface SettingsDetailScreenProps {
  title: string
  children: React.ReactNode
}

export default function SettingsDetailScreen({ title, children }: SettingsDetailScreenProps) {
  const router = useRouter()
  const { isDark, colors } = useTheme()
  const headerBg = isDark ? colors.background : HEADER.backgroundColor

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f2f7' }}>
      {/* Header — mirrors the Header component's back+title mode */}
      <View style={{ backgroundColor: headerBg }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: headerBg }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: HEADER.paddingHorizontal,
              paddingVertical: HEADER.paddingVertical,
              height: HEADER.height,
              gap: 12,
            }}
          >
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 4 }}>
              <Ionicons name="chevron-back" size={24} color={HEADER.textColor} />
            </TouchableOpacity>
            <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: HEADER.textColor }}>
              {title}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  )
}
