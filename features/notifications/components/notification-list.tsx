import React, { useMemo } from 'react'
import { View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { useMyNotificationsQuery } from '../queries/use-queries'
import { useMarkAsReadMutation, useMarkAllAsReadMutation } from '../queries/use-mutation'
import { NotificationItem } from './notification-item'
import type {
  NotificationGroupResponse,
  NotificationHistoryResponse,
  NotificationFlatHistoryResponse
} from '../schemas/notification.schema'

export type NotificationFilter = 'all' | 'unread'

interface NotificationListProps {
  filter: NotificationFilter
}

interface Section {
  title: string
  data: NotificationGroupResponse[]
}

function NotificationSkeleton() {
  return (
    <View style={{ paddingTop: 8 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 12
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: '#E5E7EB'
            }}
          />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ height: 14, backgroundColor: '#E5E7EB', borderRadius: 6, width: '70%' }} />
            <View style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, width: '40%' }} />
          </View>
        </View>
      ))}
    </View>
  )
}

export function NotificationList({ filter }: NotificationListProps) {
  const { t } = useTranslation()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMyNotificationsQuery(10, filter)
  const { mutate: markAsRead } = useMarkAsReadMutation()
  const { mutate: markAllAsRead } = useMarkAllAsReadMutation()

  const sections: Section[] = useMemo(() => {
    if (!data) return []

    if (filter === 'unread') {
      const allItems = data.pages.flatMap((page) => (page as NotificationFlatHistoryResponse).items ?? [])
      if (allItems.length === 0) return []
      return [{ title: t('notification.filter.unread'), data: allItems }]
    }

    const firstPage = data.pages[0] as NotificationHistoryResponse | undefined
    const newest = firstPage?.newest ?? []
    const today = firstPage?.today ?? []
    const previous = data.pages.flatMap((page) => (page as NotificationHistoryResponse).previous ?? [])

    const result: Section[] = []
    if (newest.length > 0) result.push({ title: t('notification.group.newest'), data: newest })
    if (today.length > 0) result.push({ title: t('notification.group.today'), data: today })
    if (previous.length > 0) result.push({ title: t('notification.group.previous'), data: previous })
    return result
  }, [data, filter, t])

  const allItems = useMemo(
    () =>
      sections.flatMap((s) => [
        { type: 'header' as const, title: s.title },
        ...s.data.map((d) => {
          const { type, ...rest } = d
          return { type: 'item' as const, ...rest }
        })
      ]),
    [sections]
  )

  const isEmpty = allItems.length === 0

  if (isLoading) return <NotificationSkeleton />

  return (
    <FlatList
      data={allItems}
      keyExtractor={(item, index) =>
        item.type === 'header' ? `header-${item.title}` : `item-${(item as any).id ?? index}`
      }
      contentContainerStyle={{ paddingBottom: 20 }}
      ListHeaderComponent={
        !isEmpty ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingHorizontal: 16,
              paddingTop: 6,
              paddingBottom: 2
            }}
          >
            <TouchableOpacity onPress={() => markAllAsRead()}>
              <Text style={{ fontSize: 14, color: '#0068FF', fontWeight: '500' }}>
                {t('notification.action.markAllRead')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 80,
            paddingHorizontal: 32
          }}
        >
          <Ionicons name='notifications-off-outline' size={64} color='#D1D5DB' />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#6B7280',
              marginTop: 16,
              textAlign: 'center'
            }}
          >
            {t('notification.empty.title')}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: '#9CA3AF',
              marginTop: 8,
              textAlign: 'center',
              lineHeight: 20
            }}
          >
            {t('notification.empty.description')}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        if (item.type === 'header') {
          return (
            <View
              style={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 6
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>{item.title}</Text>
            </View>
          )
        }
        const notification = item as NotificationGroupResponse & { type: 'item' }
        return (
          <NotificationItem
            notification={{ ...notification, type: notification.type }}
            onMarkAsRead={(id) => markAsRead(id)}
          />
        )
      }}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View style={{ paddingVertical: 16, alignItems: 'center' }}>
            <ActivityIndicator size='small' color='#0068FF' />
          </View>
        ) : null
      }
    />
  )
}
