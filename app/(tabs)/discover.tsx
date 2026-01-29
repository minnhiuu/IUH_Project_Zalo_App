import { Container, Divider, Header, ListItem } from '@/components'
import React from 'react'
import { ScrollView, View } from 'react-native'

export default function DiscoverScreen() {
  return (
    <Container safeAreaEdges={['top']}>
      <Header title='Khám phá' />
      <ScrollView className='flex-1'>
        <View className='py-2'>
          <ListItem
            leftIcon='game-controller-outline'
            title='Mini Game'
            subtitle='Chơi game cùng bạn bè'
            onPress={() => {
              // TODO: Navigate to mini games
            }}
          />
          <Divider />
          <ListItem
            leftIcon='musical-notes-outline'
            title='Zalo Music'
            subtitle='Nghe nhạc và chia sẻ'
            onPress={() => {
              // TODO: Navigate to music
            }}
          />
          <Divider />
          <ListItem
            leftIcon='storefront-outline'
            title='Mua sắm'
            subtitle='Khám phá sản phẩm'
            onPress={() => {
              // TODO: Navigate to shopping
            }}
          />
          <Divider />
          <ListItem
            leftIcon='newspaper-outline'
            title='Tin tức'
            subtitle='Đọc tin mới nhất'
            onPress={() => {
              // TODO: Navigate to news
            }}
          />
        </View>
      </ScrollView>
    </Container>
  )
}
