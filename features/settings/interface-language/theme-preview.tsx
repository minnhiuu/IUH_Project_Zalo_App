import React from 'react'
import { View } from 'react-native'
import { BRAND } from '@/constants/theme'
import type { ThemeMode } from '@/context'

interface ThemePreviewProps {
  mode: ThemeMode
}

export function ThemePreview({ mode }: ThemePreviewProps) {
  const isLightPreview = mode === 'light'
  const isSystemPreview = mode === 'system'

  if (isSystemPreview) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
        {/* Light half */}
        <View style={{ flex: 1 }}>
          <View style={{ height: 16, backgroundColor: BRAND.blue }} />
          <View style={{ flex: 1, backgroundColor: '#E8EDF2', padding: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.blue, marginRight: 4 }} />
              <View style={{ height: 4, flex: 1, borderRadius: 2, backgroundColor: '#C7D0DC' }} />
            </View>
            <View style={{ height: 10, borderRadius: 3, backgroundColor: '#FFFFFF', marginBottom: 3 }} />
            <View style={{ height: 10, width: '80%', borderRadius: 3, backgroundColor: '#FFFFFF' }} />
          </View>
        </View>
        {/* Dark half */}
        <View style={{ flex: 1 }}>
          <View style={{ height: 16, backgroundColor: '#2C323A' }} />
          <View style={{ flex: 1, backgroundColor: '#22262B', padding: 5 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.blue, marginRight: 4 }} />
              <View style={{ height: 4, flex: 1, borderRadius: 2, backgroundColor: '#4A5060' }} />
            </View>
            <View style={{ height: 10, borderRadius: 3, backgroundColor: '#3E444A', marginBottom: 3 }} />
            <View style={{ height: 10, width: '80%', borderRadius: 3, backgroundColor: '#3E444A' }} />
          </View>
        </View>
      </View>
    )
  }

  const headerBg = isLightPreview ? BRAND.blue : '#3E444A'
  const bodyBg = isLightPreview ? '#E8EDF2' : '#22262B'
  const contentBg = isLightPreview ? '#FFFFFF' : '#3E444A'
  const lineBg = isLightPreview ? '#C7D0DC' : '#4A5060'

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 16, backgroundColor: headerBg }} />
      <View style={{ flex: 1, backgroundColor: bodyBg, padding: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.blue, marginRight: 4 }} />
          <View style={{ height: 4, flex: 1, borderRadius: 2, backgroundColor: lineBg }} />
        </View>
        <View style={{ height: 10, borderRadius: 3, backgroundColor: contentBg, marginBottom: 3 }} />
        <View style={{ height: 10, width: '80%', borderRadius: 3, backgroundColor: contentBg }} />
      </View>
    </View>
  )
}
