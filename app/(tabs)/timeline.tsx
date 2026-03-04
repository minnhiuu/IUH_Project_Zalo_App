import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Image, View } from 'react-native'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Header, Avatar, Text, Box, VStack, HStack, Card } from '@/components/ui'
import { AvatarImage } from '@/components/ui/avatar'
import { Pressable } from '@/components/ui/pressable'
import { SEMANTIC } from '@/constants/theme'

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
    name: 'Th�m kho?nh kh?c',
    avatar: '',
    hasStory: false
  },
  {
    id: '2',
    name: '��o Linh',
    avatar: 'https://i.pravatar.cc/150?img=10',
    hasStory: true
  },
  {
    id: '3',
    name: 'Nguy?n Duy�n',
    avatar: 'https://i.pravatar.cc/150?img=11',
    hasStory: true
  }
]

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: '��o Linh',
    avatar: 'https://i.pravatar.cc/150?img=10',
    time: '2 gi? tr�?c',
    content: 'N�m m?i an khang th?nh v�?ng m?i ng�?i nh�! ??',
    images: ['https://picsum.photos/400/300?random=1'],
    likes: 42,
    comments: 8
  },
  {
    id: '2',
    author: 'Nguy?n Duy�n',
    avatar: 'https://i.pravatar.cc/150?img=11',
    time: '4 gi? tr�?c',
    content: 'H�m nay th?i ti?t �?p qu�!',
    likes: 23,
    comments: 5
  }
]

export default function TimelineScreen() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'interested' | 'all'>('interested')

  return (
    <Box style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <Header showSearch searchPlaceholder={t('timeline.search')} />

      {/* Tabs */}
      <HStack style={{ borderBottomWidth: 1, borderBottomColor: '#e5e7eb', backgroundColor: '#ffffff' }}>
        <Pressable
          onPress={() => setActiveTab('interested')}
          style={[
            { flex: 1, paddingVertical: 12, alignItems: 'center' },
            activeTab === 'interested' && { borderBottomWidth: 2, borderBottomColor: '#3b82f6' }
          ]}
        >
          <Text bold style={{ color: activeTab === 'interested' ? '#3b82f6' : '#6b7280' }}>
            Quan tâm
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('all')}
          style={[
            { flex: 1, paddingVertical: 12, alignItems: 'center' },
            activeTab === 'all' && { borderBottomWidth: 2, borderBottomColor: '#3b82f6' }
          ]}
        >
          <Text bold style={{ color: activeTab === 'all' ? '#3b82f6' : '#6b7280' }}>
            Khác
          </Text>
        </Pressable>
      </HStack>

      <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {/* Banner */}
        <Card
          style={{ marginHorizontal: 16, marginTop: 16, borderRadius: 12, backgroundColor: '#ef4444', padding: 16 }}
        >
          <Text bold style={{ color: '#ffffff', fontSize: 18 }}>
            Cùng Zalo đón Tết
          </Text>
          <Text size='sm' style={{ color: '#ffffff', marginTop: 4 }}>
            Khám phá những trải nghiệm Tết thú vị
          </Text>
        </Card>

        {/* Create Post Section */}
        <Card style={{ marginTop: 12, padding: 16 }}>
          <Text bold size='md' style={{ marginBottom: 12 }}>
            Tết của bạn thế nào?
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Pressable style={{ alignItems: 'center', marginRight: 16 }}>
              <Box
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: '#e0f2fe',
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}
              >
                <Ionicons name='image-outline' size={28} color='#0068FF' />
              </Box>
              <Text size='xs' style={{ color: '#6b7280' }}>
                Ảnh/Video
              </Text>
            </Pressable>
            <Pressable style={{ alignItems: 'center', marginRight: 16 }}>
              <Box
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: '#e0f2fe',
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}
              >
                <Ionicons name='images-outline' size={28} color='#0068FF' />
              </Box>
              <Text size='xs' style={{ color: '#6b7280' }}>
                Album
              </Text>
            </Pressable>
            <Pressable style={{ alignItems: 'center', marginRight: 16 }}>
              <Box
                style={{
                  width: 64,
                  height: 64,
                  backgroundColor: '#e0f2fe',
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8
                }}
              >
                <Ionicons name='happy-outline' size={28} color='#0068FF' />
              </Box>
              <Text size='xs' style={{ color: '#6b7280' }}>
                Cảm xúc 24h
              </Text>
            </Pressable>
          </ScrollView>
        </Card>

        {/* Stories */}
        <Card style={{ marginTop: 12, paddingVertical: 12 }}>
          <Text bold size='md' style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            Khoảnh khắc
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16 }}>
            {MOCK_STORIES.map((story) => (
              <Pressable key={story.id} style={{ alignItems: 'center', marginRight: 16, width: 80 }}>
                {story.hasStory ? (
                  <Box
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      borderWidth: 2,
                      borderColor: '#3b82f6',
                      padding: 2,
                      marginBottom: 8
                    }}
                  >
                    <Avatar size='md'>
                      <AvatarImage source={{ uri: story.avatar }} />
                    </Avatar>
                  </Box>
                ) : (
                  <Box
                    style={{
                      width: 64,
                      height: 64,
                      backgroundColor: '#e0f2fe',
                      borderRadius: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8
                    }}
                  >
                    <Ionicons name='add' size={32} color='#0068FF' />
                  </Box>
                )}
                <Text size='xs' numberOfLines={2} style={{ textAlign: 'center' }}>
                  {story.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Card>

        {/* Posts Feed */}
        {MOCK_POSTS.map((post) => (
          <Card key={post.id} style={{ marginTop: 12, paddingBottom: 12 }}>
            {/* Post Header */}
            <HStack style={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' }} space='md'>
              <Avatar size='md'>
                <AvatarImage source={{ uri: post.avatar }} />
              </Avatar>
              <VStack style={{ flex: 1 }} space='xs'>
                <Text bold>{post.author}</Text>
                <Text style={{ color: '#6b7280' }} size='xs'>
                  {post.time}
                </Text>
              </VStack>
              <Pressable>
                <Ionicons name='ellipsis-horizontal' size={20} color={SEMANTIC.iconMuted} />
              </Pressable>
            </HStack>

            {/* Post Content */}
            <Text style={{ paddingHorizontal: 16, marginBottom: 12 }}>{post.content}</Text>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <Image source={{ uri: post.images[0] }} style={{ width: '100%', height: 256 }} resizeMode='cover' />
            )}

            {/* Post Actions */}
            <HStack
              style={{
                paddingHorizontal: 16,
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: '#e5e7eb',
                alignItems: 'center'
              }}
            >
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name='heart-outline' size={20} color={SEMANTIC.iconMuted} />
                <Text style={{ color: '#6b7280', marginLeft: 8 }} size='sm'>
                  {post.likes}
                </Text>
              </Pressable>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name='chatbubble-outline' size={20} color={SEMANTIC.iconMuted} />
                <Text style={{ color: '#6b7280', marginLeft: 8 }} size='sm'>
                  {post.comments}
                </Text>
              </Pressable>
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons name='share-outline' size={20} color={SEMANTIC.iconMuted} />
                <Text style={{ color: '#6b7280', marginLeft: 8 }} size='sm'>
                  Chia sẻ
                </Text>
              </Pressable>
            </HStack>
          </Card>
        ))}
      </ScrollView>
    </Box>
  )
}
