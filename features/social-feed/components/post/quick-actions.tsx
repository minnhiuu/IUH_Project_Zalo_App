import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { Image as ImageIcon, Video as VideoIcon, FileText, Type } from 'lucide-react-native'

interface QuickActionsProps {
  onPhotoPress?: () => void
  onVideoPress?: () => void
  onAlbumPress?: () => void
  onTextPress?: () => void
}

export function QuickActions({
  onPhotoPress,
  onVideoPress,
  onAlbumPress,
  onTextPress
}: QuickActionsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className='bg-white px-4 py-3'
      scrollEventThrottle={16}
    >
      <TouchableOpacity
        onPress={onPhotoPress}
        className='flex-row items-center gap-2 bg-blue-50 rounded-full px-4 py-2.5 mr-2 border border-blue-200'
        activeOpacity={0.7}
      >
        <ImageIcon size={18} color='#10b981' />
        <Text className='text-sm text-gray-700 font-medium'>Ảnh</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onVideoPress}
        className='flex-row items-center gap-2 bg-blue-50 rounded-full px-4 py-2.5 mr-2 border border-blue-200'
        activeOpacity={0.7}
      >
        <VideoIcon size={18} color='#ec4899' />
        <Text className='text-sm text-gray-700 font-medium'>Video</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onAlbumPress}
        className='flex-row items-center gap-2 bg-blue-50 rounded-full px-4 py-2.5 mr-2 border border-blue-200'
        activeOpacity={0.7}
      >
        <FileText size={18} color='#3b82f6' />
        <Text className='text-sm text-gray-700 font-medium'>Album</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onTextPress}
        className='flex-row items-center gap-2 bg-blue-50 rounded-full px-4 py-2.5 border border-blue-200'
        activeOpacity={0.7}
      >
        <Type size={18} color='#f59e0b' />
        <Text className='text-sm text-gray-700 font-medium'>Nền chữ</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}
