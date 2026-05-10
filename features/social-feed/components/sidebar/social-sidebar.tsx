import { View, TouchableOpacity, Text, ScrollView } from 'react-native'
import { Home, Users, Share2, Bookmark, Clock } from 'lucide-react-native'

interface SocialSidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const MENU_ITEMS = [
  { id: 'feed', label: 'Feed', icon: Home },
  { id: 'friends', label: 'Friends', icon: Users },
  { id: 'reels', label: 'Reels', icon: Share2 },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'memories', label: 'Memories', icon: Clock }
]

export function SocialSidebar({ activeTab = 'feed', onTabChange }: SocialSidebarProps) {
  return (
    <ScrollView className='bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700'>
      <View className='py-2'>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onTabChange?.(item.id)}
              className={`flex-row items-center gap-3 px-4 py-3 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                  : 'border-l-4 border-l-transparent'
              }`}
              activeOpacity={0.7}
            >
              <Icon
                size={20}
                color={isActive ? '#3b82f6' : '#666'}
              />
              <Text
                className={`text-base font-medium ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </ScrollView>
  )
}
