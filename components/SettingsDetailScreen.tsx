import React from 'react'
import { ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { Box, Header } from '@/components/ui'

interface SettingsDetailScreenProps {
  title: string
  children: React.ReactNode
}

export default function SettingsDetailScreen({ title, children }: SettingsDetailScreenProps) {
  const router = useRouter()

  return (
    <Box className="flex-1 bg-background-secondary">
      <Header title={title} showBackButton={true} onBackPress={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
    </Box>
  )
}
