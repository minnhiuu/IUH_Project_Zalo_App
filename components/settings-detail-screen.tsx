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
        <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
            {/* Header */}
            <View 
                style={{ 
                    backgroundColor: headerBg,
                    borderBottomWidth: 0.5,
                    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                }}
            >
                <SafeAreaView edges={['top']} style={{ backgroundColor: headerBg }}>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 8,
                            height: 56,
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
                            <Ionicons name="chevron-back" size={26} color={HEADER.textColor} />
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
