import { Container, EmptyState, SearchTopBar } from '@/components'
import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'

export default function ContactsScreen() {
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
            <TouchableOpacity onPress={() => console.log('Add contact')}>
              <Ionicons name='person-add-outline' size={24} color='white' />
            </TouchableOpacity>
          </View>
        }
      />
      <View className='flex-1'>
        <EmptyState
          icon='people-outline'
          title='Chưa có liên hệ'
          description='Thêm bạn bè để bắt đầu trò chuyện'
          actionLabel='Thêm bạn'
          onAction={() => {
            // TODO: Navigate to add contact
          }}
        />
      </View>
    </Container>
  )
}
