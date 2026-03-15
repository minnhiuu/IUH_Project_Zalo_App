import React, { useMemo } from 'react'
import { View, FlatList, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { useMyNotificationsQuery } from '../queries/use-queries'
import { useMarkAsReadMutation } from '../queries/use-mutation'
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
    <View className='pt-2'>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} className='flex-row items-center px-4 py-3 gap-3'>
          <View className='w-[52px] h-[52px] rounded-full bg-gray-200' />
          <View className='flex-1 gap-2'>
            <View className='h-3.5 bg-gray-200 rounded-md w-[70%]' />
            <View className='h-3 bg-gray-200 rounded-md w-[40%]' />
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

  if (isLoading) return <NotificationSkeleton />

  return (
    <FlatList
      data={allItems}
      keyExtractor={(item, index) =>
        item.type === 'header' ? `header-${item.title}` : `item-${(item as any).id ?? index}`
      }
      contentContainerStyle={{ paddingBottom: 20 }}
      ListEmptyComponent={
        <View className='flex-1 items-center justify-center pt-20 px-8'>
          <Ionicons name='notifications-off-outline' size={64} color='#D1D5DB' />
          <Text className='text-lg font-bold text-gray-400 mt-4 text-center'>{t('notification.empty.title')}</Text>
          <Text className='text-sm text-gray-400 mt-2 text-center leading-5'>
            {t('notification.empty.description')}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        if (item.type === 'header') {
          return (
            <View className='px-4 pt-4 pb-1.5'>
              <Text className='text-base font-bold text-gray-900'>{item.title}</Text>
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
          <View className='py-4 items-center'>
            <ActivityIndicator size='small' color='#0068FF' />
          </View>
        ) : null
      }
    />
  )
}
