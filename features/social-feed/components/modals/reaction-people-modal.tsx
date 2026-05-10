import { View, Text, TouchableOpacity, Modal, FlatList, ScrollView } from 'react-native'
import { X, Heart, ThumbsUp, Smile } from 'lucide-react-native'
import { useState } from 'react'

interface ReactionPeopleModalProps {
  visible: boolean
  postId?: string
  onClose: () => void
}

const REACTION_TABS = [
  { id: 'all', label: 'Tất cả', icon: null },
  { id: 'like', label: '👍 Thích', emoji: '👍' },
  { id: 'love', label: '❤️ Yêu', emoji: '❤️' },
  { id: 'haha', label: '😂 Haha', emoji: '😂' },
  { id: 'wow', label: '😮 Wow', emoji: '😮' },
  { id: 'sad', label: '😢 Buồn', emoji: '😢' },
  { id: 'angry', label: '😠 Giận', emoji: '😠' },
]

const MOCK_REACTIONS = [
  { id: '1', name: 'Ngô Linh', avatar: 'https://via.placeholder.com/40?text=NL', reaction: 'like' },
  { id: '2', name: 'Đoàn Lân', avatar: 'https://via.placeholder.com/40?text=DL', reaction: 'love' },
  { id: '3', name: 'Cẩm Thuỷ', avatar: 'https://via.placeholder.com/40?text=CT', reaction: 'haha' },
  { id: '4', name: 'Minh Tâm', avatar: 'https://via.placeholder.com/40?text=MT', reaction: 'like' },
  { id: '5', name: 'Thanh Vân', avatar: 'https://via.placeholder.com/40?text=TV', reaction: 'love' },
  { id: '6', name: 'Hương Giang', avatar: 'https://via.placeholder.com/40?text=HG', reaction: 'wow' },
]

export function ReactionPeopleModal({
  visible,
  postId,
  onClose
}: ReactionPeopleModalProps) {
  const [selectedTab, setSelectedTab] = useState('all')

  const filteredReactions =
    selectedTab === 'all'
      ? MOCK_REACTIONS
      : MOCK_REACTIONS.filter((r) => r.reaction === selectedTab)

  return (
    <Modal
      visible={visible}
      animationType='slide'
      onRequestClose={onClose}
      transparent={false}
    >
      <View className='flex-1 bg-black'>
        {/* Header */}
        <View className='flex-row items-center justify-between p-4 border-b border-zinc-800'>
          <Text className='text-white font-bold text-lg'>Những người phản ứng</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color='white' />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className='border-b border-zinc-800'
          scrollEventThrottle={16}
        >
          {REACTION_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setSelectedTab(tab.id)}
              className={`px-4 py-3 border-b-2 ${
                selectedTab === tab.id
                  ? 'border-b-blue-500'
                  : 'border-b-transparent'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedTab === tab.id
                    ? 'text-blue-500'
                    : 'text-zinc-500'
                }`}
              >
                {tab.emoji ? `${tab.emoji} ${tab.label}` : tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reactions List */}
        <FlatList
          data={filteredReactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className='flex-row items-center justify-between p-4 border-b border-zinc-800'
              activeOpacity={0.7}
            >
              <View className='flex-row items-center gap-3 flex-1'>
                <View className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600' />
                <View className='flex-1'>
                  <Text className='text-white font-semibold text-sm'>
                    {item.name}
                  </Text>
                </View>
              </View>
              <Text className='text-xl'>{REACTION_TABS.find((t) => t.id === item.reaction)?.emoji}</Text>
            </TouchableOpacity>
          )}
          scrollIndicatorInsets={{ right: 1 }}
        />
      </View>
    </Modal>
  )
}
