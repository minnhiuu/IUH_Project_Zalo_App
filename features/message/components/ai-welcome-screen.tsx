import React from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/text'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'

interface AiWelcomeScreenProps {
  avatarUrl?: string
  onSelect: (text: string) => void
}

export function AiWelcomeScreen({ avatarUrl, onSelect }: AiWelcomeScreenProps) {
  const { t } = useTranslation()
  const isDark = useColorScheme() === 'dark'

  const welcomeSuggestions = [
    { id: 'profile', emoji: '👤', text: t('chat.aiWindow.suggestions.profile', 'Tôi có thể làm gì?') },
    { id: 'friends', emoji: '👥', text: t('chat.aiWindow.suggestions.friends', 'Giúp tôi tìm bạn bè') },
    { id: 'internet', emoji: '🌐', text: t('chat.aiWindow.suggestions.internet', 'Tìm kiếm trên mạng') }
  ]

  return (
    <View className="flex-1 items-center justify-center px-6 py-10">
      <View className="w-16 h-16 mb-4">
        <Image
          source={typeof avatarUrl === 'number' ? avatarUrl : { uri: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=ai-assistant-001` }}
          className="w-full h-full rounded-full border border-black/5"
          resizeMode="cover"
        />
      </View>
      <Text className="text-xl font-bold mb-2 text-center text-foreground">
        {t('chat.aiWindow.title', 'Bondhub AI')}
      </Text>
      <Text className="text-sm mb-6 text-center text-muted-foreground max-w-[280px]">
        {t('chat.aiWindow.welcomeDescription', 'Trợ lý ảo AI của bạn. Hãy hỏi tôi bất cứ điều gì!')}
      </Text>
      
      <View className="w-full max-w-[320px] flex-col gap-2">
        {welcomeSuggestions.map(({ id, emoji, text }) => (
          <TouchableOpacity
            key={id}
            onPress={() => onSelect(text)}
            activeOpacity={0.7}
            className={`flex-row items-center gap-3 px-4 py-3 rounded-xl border ${
              isDark 
                ? 'border-blue-800 bg-blue-950/40' 
                : 'border-blue-200 bg-blue-50'
            }`}
          >
            <Text className="text-base">{emoji}</Text>
            <Text className={`text-sm font-medium ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              {text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
