import React from 'react'
import { Box, ScrollView } from '@gluestack-ui/themed'
import { useRouter } from 'expo-router'
import { Header } from '@/components/ui'

interface SettingsDetailScreenProps {
  title: string
  children: React.ReactNode
}

export default function SettingsDetailScreen({ title, children }: SettingsDetailScreenProps) {
  const router = useRouter()

  return (
    <Box flex={1} bg='$backgroundLight100'>
      <Header title={title} leftIcon='arrow-back' onLeftPress={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
    </Box>
  )
}
