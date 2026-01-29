import { Container, EmptyState, Header } from '@/components'
import React from 'react'
import { View } from 'react-native'

export default function ContactsScreen() {
  return (
    <Container safeAreaEdges={['top']}>
      <Header
        title='Danh bạ'
        rightIcon='person-add-outline'
        onRightPress={() => {
          // TODO: Implement add contact
        }}
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
