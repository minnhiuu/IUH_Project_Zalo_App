import { Ionicons } from '@expo/vector-icons'
import { View, ScrollView, Pressable, Image } from 'react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, Avatar, Text } from '@/components/ui'

interface Story {
  id: string
  name: string
  avatar: string
  hasStory: boolean
}

interface Post {
  id: string
  author: string
  avatar: string
  time: string
  content: string
  images?: string[]
  likes: number
  comments: number
}

const MOCK_STORIES: Story[] = [
  {
    id: '1',
    name: 'Thêm khoảnh khắc',
    avatar: '',
    hasStory: false
  },
  {
    id: '2',
    name: 'Đào Linh',
    avatar: 'https://i.pravatar.cc/150?img=10',
    hasStory: true
  },
  {
    id: '3',
    name: 'Nguyễn Duyên',
    avatar: 'https://i.pravatar.cc/150?img=11',
    hasStory: true
  }
]

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: 'Đào Linh',
    avatar: 'https://i.pravatar.cc/150?img=10',
    time: '2 giờ trước',
    content: 'Năm mới an khang thịnh vượng mọi người nhé! 🎉',
    images: ['https://picsum.photos/400/300?random=1'],
    likes: 42,
    comments: 8
  },
  {
    id: '2',
    author: 'Nguyễn Duyên',
    avatar: 'https://i.pravatar.cc/150?img=11',
    time: '4 giờ trước',
    content: 'Hôm nay thời tiết đẹp quá!',
    likes: 23,
    comments: 5
  }
]

export default function TimelineScreen() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'interested' | 'all'>('interested')

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <Header
        showSearch
        searchPlaceholder={t('timeline.search')}
      />

      {/* Tabs */}
      <View className="flex-row border-b border-border bg-white">
        <Pressable
          onPress={() => setActiveTab('interested')}
          className={`flex-1 py-3 items-center ${
            activeTab === 'interested' ? 'border-b-2 border-primary' : ''
          }`}
        >
          <Text
            weight="medium"
            variant={activeTab === 'interested' ? 'primary' : 'muted'}
          >
            Quan tâm
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('all')}
          className={`flex-1 py-3 items-center ${
            activeTab === 'all' ? 'border-b-2 border-primary' : ''
          }`}
        >
          <Text
            weight="medium"
            variant={activeTab === 'all' ? 'primary' : 'muted'}
          >
            Khác
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        {/* Banner */}
        <Pressable className="bg-gradient-to-r from-red-500 to-red-600 p-4 mx-4 mt-4 rounded-xl active:opacity-80">
          <Text className="text-white font-bold text-lg">
            Cùng Zalo đón Tết
          </Text>
          <Text className="text-white text-sm mt-1">
            Khám phá những trải nghiệm Tết thú vị
          </Text>
        </Pressable>

        {/* Create Post Section */}
        <View className="bg-white mt-3 p-4">
          <Text weight="semibold" size="base" className="mb-3">
            Tết của bạn thế nào?
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable className="items-center mr-4">
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-2">
                <Ionicons name="image-outline" size={28} color="#0068FF" />
              </View>
              <Text size="xs" variant="muted">
                Ảnh/Video
              </Text>
            </Pressable>
            <Pressable className="items-center mr-4">
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-2">
                <Ionicons name="images-outline" size={28} color="#0068FF" />
              </View>
              <Text size="xs" variant="muted">
                Album
              </Text>
            </Pressable>
            <Pressable className="items-center mr-4">
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-2">
                <Ionicons name="happy-outline" size={28} color="#0068FF" />
              </View>
              <Text size="xs" variant="muted">
                Cảm xúc 24h
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Stories */}
        <View className="bg-white mt-3 py-3">
          <Text weight="semibold" size="base" className="px-4 mb-3">
            Khoảnh khắc
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {MOCK_STORIES.map((story) => (
              <Pressable key={story.id} className="items-center mr-4 w-20">
                {story.hasStory ? (
                  <View className="w-16 h-16 rounded-full border-2 border-primary p-0.5 mb-2">
                    <Avatar size="md" source={{ uri: story.avatar }} />
                  </View>
                ) : (
                  <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-2">
                    <Ionicons name="add" size={32} color="#0068FF" />
                  </View>
                )}
                <Text size="xs" numberOfLines={2} className="text-center">
                  {story.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Posts Feed */}
        {MOCK_POSTS.map((post) => (
          <View key={post.id} className="bg-white mt-3 pb-3">
            {/* Post Header */}
            <View className="flex-row items-center px-4 py-3">
              <Avatar size="md" source={{ uri: post.avatar }} />
              <View className="flex-1 ml-3">
                <Text weight="medium">{post.author}</Text>
                <Text variant="muted" size="xs">
                  {post.time}
                </Text>
              </View>
              <Pressable>
                <Ionicons name="ellipsis-horizontal" size={20} color="#8c8c8c" />
              </Pressable>
            </View>

            {/* Post Content */}
            <Text className="px-4 mb-3">{post.content}</Text>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <Image
                source={{ uri: post.images[0] }}
                className="w-full h-64"
                resizeMode="cover"
              />
            )}

            {/* Post Actions */}
            <View className="flex-row items-center px-4 mt-3 pt-3 border-t border-border">
              <Pressable className="flex-row items-center flex-1">
                <Ionicons name="heart-outline" size={20} color="#8c8c8c" />
                <Text variant="muted" size="sm" className="ml-2">
                  {post.likes}
                </Text>
              </Pressable>
              <Pressable className="flex-row items-center flex-1">
                <Ionicons name="chatbubble-outline" size={20} color="#8c8c8c" />
                <Text variant="muted" size="sm" className="ml-2">
                  {post.comments}
                </Text>
              </Pressable>
              <Pressable className="flex-row items-center flex-1">
                <Ionicons name="share-outline" size={20} color="#8c8c8c" />
                <Text variant="muted" size="sm" className="ml-2">
                  Chia sẻ
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
