import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
    badge: 'TÔI TÀI GIỎI\nBẠN CŨNG TẠM',
  },
  {
    id: '2',
    name: 'Trần Ngọc Huyền',
    avatar: 'https://i.pravatar.cc/150?img=1',
    lastMessage: 'Bạn: [Sticker]',
    time: '54 phút',
    unread: 0,
    isPinned: false,
  },
  {
    id: '3',
    name: 'Media Box',
    avatar: null,
    lastMessage: 'Báo Mới: Vượt qua U23 Hàn Quốc,...',
    time: '',
    unread: 1,
    isPinned: false,
    isOfficial: true,
  },
  {
    id: '4',
    name: 'kim cuong rach',
    avatar: 'https://i.pravatar.cc/150?img=2',
    lastMessage: '[Sticker]',
    time: '3 giờ',
    unread: 0,
    isPinned: true,
    pinnedBy: 'koutachan1147',
  },
  {
    id: '5',
    name: 'My Documents',
    avatar: null,
    lastMessage: 'Bạn: [Hình ảnh]',
    time: '3 giờ',
    unread: 0,
    isPinned: false,
    isCloud: true,
  },
  {
    id: '6',
    name: 'Gia đình là số 1',
    avatar: 'https://i.pravatar.cc/150?img=3',
    lastMessage: 'Nguyễn Huy Hoàng: [Video] 00:55',
    time: '3 giờ',
    unread: 0,
    isPinned: false,
    isMuted: true,
  },
  {
    id: '7',
    name: 'Bộ 4 8 tính :)',
    avatar: 'https://i.pravatar.cc/150?img=4',
    lastMessage: 'Đào Linh: cut',
    time: '4 giờ',
    unread: 0,
    isPinned: false,
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
    isVerified: true,
  },
  {
    id: '9',
    name: 'Tứ Đại Nghiện Sĩ',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Chương: đừng ề nha',
    time: '13 giờ',
    unread: 0,
    isPinned: false,
    isMuted: true,
  },
];

// Avatar component
const ConversationAvatar = ({ conversation }: { conversation: typeof MOCK_CONVERSATIONS[0] }) => {
  if (conversation.badge) {
    return (
      <View className="w-14 h-14 rounded-full bg-yellow-100 items-center justify-center">
        <Text className="text-[8px] text-center text-yellow-700 font-bold px-1">
          {conversation.badge}
        </Text>
      </View>
    );
  }

  if (conversation.isCloud) {
    return (
      <View className="w-14 h-14 rounded-full bg-blue-500 items-center justify-center">
        <Ionicons name="cloud" size={28} color="white" />
      </View>
    );
  }

  if (conversation.isOfficial) {
    return (
      <View className="w-14 h-14 rounded-xl bg-purple-500 items-center justify-center overflow-hidden">
        <Ionicons name="cube" size={28} color="white" />
      </View>
    );
  }

  if (conversation.avatar) {
    return (
      <Image
        source={{ uri: conversation.avatar }}
        className="w-14 h-14 rounded-full"
      />
    );
  }

  // Default avatar with initials
  const initials = conversation.name.charAt(0).toUpperCase();
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
  const colorIndex = conversation.name.length % colors.length;

  return (
    <View className={`w-14 h-14 rounded-full ${colors[colorIndex]} items-center justify-center`}>
      <Text className="text-white text-xl font-bold">{initials}</Text>
    </View>
  );
};

// Conversation item component
const ConversationItem = ({ conversation, onPress }: { 
  conversation: typeof MOCK_CONVERSATIONS[0];
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3 bg-white active:bg-gray-50"
    >
      {/* Avatar */}
      <View className="relative">
        <ConversationAvatar conversation={conversation} />
        {conversation.isVerified && (
          <View className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full w-5 h-5 items-center justify-center border-2 border-white">
            <Ionicons name="checkmark" size={12} color="white" />
          </View>
        )}
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {conversation.name}
          </Text>
          <Text className="text-xs text-gray-500">{conversation.time}</Text>
        </View>
        <View className="flex-row items-center justify-between mt-0.5">
          <View className="flex-row items-center flex-1 mr-2">
            {conversation.pinnedBy && (
              <View className="flex-row items-center mr-1">
                <Ionicons name="pin" size={12} color="#666" />
                <Text className="text-xs text-gray-500 ml-0.5">{conversation.pinnedBy}</Text>
              </View>
            )}
            <Text 
              className={`text-sm ${conversation.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
              numberOfLines={1}
            >
              {!conversation.pinnedBy && conversation.lastMessage}
            </Text>
          </View>
          <View className="flex-row items-center">
            {conversation.isMuted && (
              <Ionicons name="notifications-off" size={14} color="#999" style={{ marginRight: 4 }} />
            )}
            {conversation.unread > 0 && (
              <View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
                <Text className="text-white text-xs font-bold">{conversation.unread}</Text>
              </View>
            )}
            {conversation.unread === 0 && !conversation.isMuted && conversation.isOfficial && (
              <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleConversationPress = (conversationId: string) => {
    // TODO: Navigate to chat screen
    console.log('Open conversation:', conversationId);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header with Gradient covering status bar */}
      <LinearGradient
        colors={['#0068FF', '#0055DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        {/* Search Bar */}
        <View className="flex-row items-center px-4 py-2.5">
          <TouchableOpacity className="mr-3">
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-base opacity-90">Tìm kiếm</Text>
          </View>
          <TouchableOpacity className="ml-3">
            <Ionicons name="qr-code" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="ml-4">
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Conversation List */}
      <FlatList
        data={MOCK_CONVERSATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={() => handleConversationPress(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <View className="h-[0.5px] bg-gray-100 ml-[76px]" />
        )}
      />
    </View>
  );
}
