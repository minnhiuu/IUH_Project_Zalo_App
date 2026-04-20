import { View, Text, TouchableOpacity } from 'react-native'

type TabType = 'following' | 'explore'

interface TabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function SocialFeedTabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <View className='bg-white border-b border-blue-100 flex-row'>
      <TouchableOpacity
        onPress={() => onTabChange('following')}
        className={`flex-1 py-3 border-b-2 ${
          activeTab === 'following'
            ? 'border-b-blue-600'
            : 'border-b-transparent'
        }`}
        activeOpacity={0.7}
      >
        <Text
          className={`text-center font-semibold ${
            activeTab === 'following'
              ? 'text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Quan tâm
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onTabChange('explore')}
        className={`flex-1 py-3 border-b-2 ${
          activeTab === 'explore'
            ? 'border-b-blue-600'
            : 'border-b-transparent'
        }`}
        activeOpacity={0.7}
      >
        <Text
          className={`text-center font-semibold ${
            activeTab === 'explore'
              ? 'text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Khác
        </Text>
      </TouchableOpacity>
    </View>
  )
}
