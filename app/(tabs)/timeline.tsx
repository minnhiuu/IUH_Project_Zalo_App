import { Container, EmptyState, Header } from '@/components';
import React from 'react';
import { View } from 'react-native';

export default function TimelineScreen() {
  return (
    <Container safeAreaEdges={['top']}>
      <Header
        title="Nhật ký"
        rightIcon="create-outline"
        onRightPress={() => {
          // TODO: Create new post
        }}
      />
      <View className="flex-1">
        <EmptyState
          icon="images-outline"
          title="Chưa có bài viết"
          description="Chia sẻ khoảnh khắc của bạn với mọi người"
          actionLabel="Tạo bài viết"
          onAction={() => {
            // TODO: Navigate to create post
          }}
        />
      </View>
    </Container>
  );
}
