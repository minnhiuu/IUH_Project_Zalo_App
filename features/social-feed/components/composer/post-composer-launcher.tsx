import { View, TouchableOpacity, Text } from 'react-native'
import { UserAvatar } from '@/components/common/user-avatar'
import { useSocialText } from '../../i18n/use-social-text'

interface PostComposerLauncherProps {
  userAvatar?: string | null
  userName?: string
  onPress?: () => void
}

export function PostComposerLauncher({
  userAvatar,
  userName,
  onPress
}: PostComposerLauncherProps) {
  const { text } = useSocialText()

  return (
    <View className='bg-white px-0 py-0'>
      <TouchableOpacity
        onPress={onPress}
        className='bg-gray-100 rounded-full p-3 flex-row items-center gap-3 border border-blue-200 mx-4'
        activeOpacity={0.7}
      >
        <UserAvatar 
          source={userAvatar || undefined}
          name={userName || 'User'}
          size='md'
        />

        <Text className='flex-1 text-gray-600 text-sm'>
          {text.launcher.prompt}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
