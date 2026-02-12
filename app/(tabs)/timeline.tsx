import { Container, EmptyState, SearchTopBar } from '@/components'
import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'

export default function TimelineScreen() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <Container safeAreaEdges={[]}>
      <SearchTopBar
        searchQuery=''
        setSearchQuery={() => {}}
        placeholder={t('search.placeholder')}
        onPress={() => router.push('/search')}
        showQr={false}
        rightAction={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => console.log('Create post')}>
              <Ionicons name='create-outline' size={24} color='white' />
            </TouchableOpacity>
          </View>
        }
      />
      <View className='flex-1'>
        <EmptyState
          icon='images-outline'
          title='Chưa có bài viết'
          description='Chia sẻ khoảnh khắc của bạn với mọi người'
          actionLabel='Tạo bài viết'
          onAction={() => {
            // TODO: Navigate to create post
          }}
        />
      </View>
    </Container>
  )
}
