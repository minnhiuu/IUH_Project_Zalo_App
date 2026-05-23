import { View, TouchableOpacity, Text } from 'react-native'
import { MessageCircle, Users, Grid3x3, BookOpen, User } from 'lucide-react-native'

type BottomTabType = 'messages' | 'contacts' | 'explore' | 'feed' | 'profile'

interface BottomNavigationProps {
  activeTab: BottomTabType
  onTabChange: (tab: BottomTabType) => void
  unreadMessages?: number
  unreadNotifications?: number
}

const TABS: { id: BottomTabType; label: string; Icon: any }[] = [
  { id: 'messages', label: 'Tin nhắn', Icon: MessageCircle },
  { id: 'contacts', label: 'Danh bạ', Icon: Users },
  { id: 'explore', label: 'Khám phá', Icon: Grid3x3 },
  { id: 'feed', label: 'Tường nhà', Icon: BookOpen },
  { id: 'profile', label: 'Cá nhân', Icon: User }
]

export function BottomNavigation({
  activeTab,
  onTabChange,
  unreadMessages = 0,
  unreadNotifications = 0
}: BottomNavigationProps) {
  return (
    <View className='bg-white border-t border-blue-100 flex-row'>
      {TABS.map((tab) => {
        const Icon = tab.Icon
        const isActive = activeTab === tab.id
        let badgeCount = 0

        if (tab.id === 'messages') badgeCount = unreadMessages
        if (tab.id === 'feed') badgeCount = unreadNotifications

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className='flex-1 items-center justify-center py-3 relative'
            activeOpacity={0.7}
          >
            <Icon size={24} color={isActive ? '#3b82f6' : '#999'} />
            <Text
              className={`text-xs mt-1 font-medium ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {tab.label}
            </Text>

            {badgeCount > 0 && (
              <View className='absolute top-0 right-3 bg-red-500 rounded-full w-5 h-5 items-center justify-center'>
                <Text className='text-white text-xs font-bold'>
                  {badgeCount > 9 ? '9+' : badgeCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
