import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, Href, useLocalSearchParams } from 'expo-router'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'

// Mock conversation data
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    name: 'CMM',
    avatar: null,
    lastMessage: 'Trần Ngọc Huyền: đi nhắc nhờ quài',
    time: '3 giây',
    unread: 2,
    isPinned: false,
    badge: 'TÔI TÀI GIỎI\nBẠN CŨNG TẠM'
  },
  {
    id: '2',
    name: 'Trần Ngọc Huyền',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Bạn: [Sticker]',
    time: '54 phút',
    unread: 0,
    isPinned: false
  },
  {
    id: '3',
    name: 'Media Box',
    avatar: null,
    lastMessage: 'Báo Mới: Vượt qua U23 Hàn Quốc,...',
    time: '',
    unread: 1,
    isPinned: false,
    isOfficial: true
  },
  {
    id: '4',
    name: 'kim cuong rach',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: '[Sticker]',
    time: '3 giờ',
    unread: 0,
    isPinned: true,
    pinnedBy: 'koutachan1147'
  },
  {
    id: '5',
    name: 'My Documents',
    avatar: null,
    lastMessage: 'Bạn: [Hình ảnh]',
    time: '3 giờ',
    unread: 0,
    isPinned: false,
    isCloud: true
  },
  {
    id: '6',
    name: 'Gia đình là số 1',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Nguyễn Huy Hoàng: [Video] 00:55',
    time: '3 giờ',
    unread: 0,
    isPinned: false,
    isMuted: true
  },
  {
    id: '7',
    name: 'Bộ 4 8 tính :)',
    avatar: 'https://i.pravatar.cc/150?img=4',
    lastMessage: 'Đào Linh: cut',
    time: '4 giờ',
    unread: 0,
    isPinned: false
  },
  {
    id: '8',
    name: 'Zalopay',
    avatar: null,
    lastMessage: 'x2 quà khi nạp game hôm nay',
    time: '7 giờ',
    unread: 0,
    isPinned: false,
    isOfficial: true,
    isVerified: true
  },
  {
    id: '9',
    name: 'Tứ Đại Nghiện Sĩ',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Chương: đừng ề nha',
    time: '13 giờ',
    unread: 0,
    isPinned: false,
    isMuted: true
  }
]

// Avatar component
const ConversationAvatar = ({ conversation }: { conversation: (typeof MOCK_CONVERSATIONS)[0] }) => {
  if (conversation.badge) {
    return (
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#FEF9C3',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text
          style={{
            fontSize: 8,
            textAlign: 'center',
            color: '#A16207',
            fontWeight: 'bold',
            paddingHorizontal: 4
          }}
        >
          {conversation.badge}
        </Text>
      </View>
    )
  }

  if (conversation.isCloud) {
    return (
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#3B82F6',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Ionicons name='cloud' size={28} color='white' />
      </View>
    )
  }

  if (conversation.isOfficial) {
    return (
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          backgroundColor: '#A855F7',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <Ionicons name='cube' size={28} color='white' />
      </View>
    )
  }

  if (conversation.avatar) {
    return <Image source={{ uri: conversation.avatar }} style={{ width: 56, height: 56, borderRadius: 28 }} />
  }

  // Default avatar with initials
  const initials = conversation.name.charAt(0).toUpperCase()
  const colors = ['#3B82F6', '#22C55E', '#A855F7', '#F97316', '#EC4899']
  const colorIndex = conversation.name.length % colors.length

  return (
    <View
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors[colorIndex],
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{initials}</Text>
    </View>
  )
}

// Conversation item component
const ConversationItem = ({
  conversation,
  onPress
}: {
  conversation: (typeof MOCK_CONVERSATIONS)[0]
  onPress: () => void
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white'
      }}
    >
      {/* Avatar */}
      <View style={{ position: 'relative' }}>
        <ConversationAvatar conversation={conversation} />
        {conversation.isVerified && (
          <View
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              backgroundColor: '#3B82F6',
              borderRadius: 10,
              width: 20,
              height: 20,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: 'white'
            }}
          >
            <Ionicons name='checkmark' size={12} color='white' />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }} numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280' }}>{conversation.time}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 2
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              marginRight: 8
            }}
          >
            {conversation.pinnedBy && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 4
                }}
              >
                <Ionicons name='pin' size={12} color='#666' />
                <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 2 }}>{conversation.pinnedBy}</Text>
              </View>
            )}
            <Text
              style={{
                fontSize: 14,
                color: conversation.unread > 0 ? '#111827' : '#6B7280',
                fontWeight: conversation.unread > 0 ? '500' : '400'
              }}
              numberOfLines={1}
            >
              {!conversation.pinnedBy && conversation.lastMessage}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {conversation.isMuted && (
              <Ionicons name='notifications-off' size={14} color='#999' style={{ marginRight: 4 }} />
            )}
            {conversation.unread > 0 && (
              <View
                style={{
                  backgroundColor: '#EF4444',
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 6
                }}
              >
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{conversation.unread}</Text>
              </View>
            )}
            {conversation.unread === 0 && !conversation.isMuted && conversation.isOfficial && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#EF4444'
                }}
              />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function MessagesScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (params.qrLoginSuccess === 'true') {
      Toast.show({
        type: 'success',
        text1: t('auth.qrScanner.confirmScreen.loginSuccess'),
        visibilityTime: 3000
      })

      // Clear the parameter to avoid re-showing toast on re-renders
      router.setParams({ qrLoginSuccess: undefined })
    }
  }, [params.qrLoginSuccess, t, router])

  const handleConversationPress = (conversationId: string) => {
    // TODO: Navigate to chat screen
    console.log('Open conversation:', conversationId)
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header with Gradient covering status bar */}
      <LinearGradient
        colors={['#0068FF', '#0055DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10
          }}
        >
          <TouchableOpacity style={{ marginRight: 12 }}>
            <Ionicons name='search' size={24} color='white' />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 16, opacity: 0.9 }}>Tìm kiếm</Text>
          </View>
          <TouchableOpacity style={{ marginLeft: 12 }} onPress={() => router.push('/qr' as Href)}>
            <Ionicons name='qr-code' size={22} color='white' />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 16 }}>
            <Ionicons name='add' size={28} color='white' />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Conversation List */}
      <FlatList
        data={MOCK_CONVERSATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem conversation={item} onPress={() => handleConversationPress(item.id)} />
        )}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 0.5, backgroundColor: '#F3F4F6', marginLeft: 76 }} />}
      />
    </View>
  )
}
