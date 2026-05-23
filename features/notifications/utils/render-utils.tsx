import React from 'react'
import { Text } from 'react-native'

export const renderHtmlText = (html: string, baseStyle?: object) => {
  if (!html) return null
  const parts = html.split(/(<b>.*?<\/b>)/g)
  return parts.map((part, index) => {
    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      return (
        <Text key={index} style={[baseStyle, { fontWeight: 'bold' }]}>
          {part.replace(/<\/?b>/g, '')}
        </Text>
      )
    }
    return (
      <Text key={index} style={baseStyle}>
        {part}
      </Text>
    )
  })
}

export const getTimeAgo = (dateStr: string, t: any): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return t('friend.time.minutesAgo', { count: 1 })
  if (diffMin < 60) return t('friend.time.minutesAgo', { count: diffMin })
  if (diffHr < 24) return t('friend.time.hoursAgo', { count: diffHr })
  if (diffDay < 7) return t('friend.time.daysAgo', { count: diffDay })
  return date.toLocaleDateString('vi-VN')
}
