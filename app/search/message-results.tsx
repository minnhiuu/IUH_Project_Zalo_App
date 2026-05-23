import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { HEADER } from '@/constants/theme'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { FileSearchResult } from '@/features/search/components/files/file-item'
import { MessageFilterChips } from '@/features/search/components/messages/message-filter-chips'
import { MessageSearchResult } from '@/features/search/components/messages/message-item'
import { useInfiniteSearchConversationMessages } from '@/features/search/queries'
import { MessageSearchFilter, MessageSearchResponse } from '@/features/search/schemas'

const isFileResult = (item: MessageSearchResponse) =>
  item.type?.toUpperCase() === 'FILE' || (item.hasAttachment && !item.hasLink)

const toRouteParam = (value: unknown) => {
  if (value === null || value === undefined) return undefined
  return String(value)
}

const routeParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [key, toRouteParam(value)] as const)
      .filter((entry): entry is [string, string] => entry[1] !== undefined)
  )

export default function SearchMessageResultsScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const params = useLocalSearchParams<{
    conversationId?: string
    title?: string
    keyword?: string
    filters?: string
  }>()

  const initialFilters = useMemo(
    () =>
      (params.filters || '')
        .split(',')
        .filter((item): item is MessageSearchFilter => item === 'link' || item === 'file'),
    [params.filters]
  )
  const [filters, setFilters] = useState<MessageSearchFilter[]>(initialFilters)
  const conversationId = params.conversationId || ''
  const keyword = params.keyword || ''

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteSearchConversationMessages(conversationId, keyword, filters)

  const items = data?.pages.flatMap((page) => page.data) ?? []
  const hasActiveFilters = filters.length > 0

  const openMessage = (item: MessageSearchResponse) => {
    const itemConversationId = toRouteParam(item.conversationId)
    const messageId = toRouteParam(item.messageId)
    if (!itemConversationId || !messageId) return

    router.push({
      pathname: '/chat/[id]',
      params: routeParams({
        id: itemConversationId,
        conversationId: itemConversationId,
        aroundMessageId: messageId,
        name: params.title,
        searchKeyword: keyword,
        isSearchMode: 'true'
      })
    } as any)
  }

  return (
    <View className='flex-1 bg-background'>
      <LinearGradient colors={HEADER.gradientColors}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View className='h-14 flex-row items-center px-4'>
            <TouchableOpacity onPress={() => router.back()} className='pr-3 py-2'>
              <Ionicons name='chevron-back' size={24} color='white' />
            </TouchableOpacity>
            <Text className='text-white text-xl font-semibold flex-1' numberOfLines={1}>
              {params.title || t('search.unknownConversation')}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <MessageFilterChips
        filters={filters}
        onFiltersChange={setFilters}
        labels={{ link: t('search.filters.link'), file: t('search.filters.file') }}
        className='px-4 py-2 bg-background'
      />

      {isLoading ? (
        <View className='py-10 items-center'>
          <ActivityIndicator size='large' color='#0068FF' />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.messageId}
          renderItem={({ item }) =>
            isFileResult(item) ? (
              <FileSearchResult item={item} searchQuery={keyword} onPress={openMessage} compact />
            ) : (
              <MessageSearchResult item={item} searchQuery={keyword} onPress={openMessage} compact />
            )
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage()
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            hasActiveFilters ? (
              <View className='py-28 px-4 items-center'>
                <Text className='text-muted-foreground text-base text-center'>{t('search.noFilteredResults')}</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className='py-4'>
                <ActivityIndicator color='#0068FF' />
              </View>
            ) : null
          }
        />
      )}
    </View>
  )
}
