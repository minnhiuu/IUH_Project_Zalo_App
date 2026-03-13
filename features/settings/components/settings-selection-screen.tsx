import React from 'react'
import SettingsDetailScreen from '@/components/settings-detail-screen'

interface SettingsSelectionScreenProps {
  title: string
  children: React.ReactNode
}

export function SettingsSelectionScreen({ title, children }: SettingsSelectionScreenProps) {
  return <SettingsDetailScreen title={title}>{children}</SettingsDetailScreen>
}
