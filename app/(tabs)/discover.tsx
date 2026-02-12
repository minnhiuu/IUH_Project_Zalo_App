import { Container, SearchTopBar } from '@/components'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

const DISCOVERY_ITEMS = [
  {
    id: 'video',
    icon: 'play-circle',
    color: '#FF3B30',
    title: 'Zalo Video',
    subtitle: '16 điểm pháo hoa đêm Giao thừa ở T...'
  },
  { id: 'news', icon: 'newspaper', color: '#0068FF', title: 'News hub', subtitle: '' },
  {
    id: 'game',
    icon: 'game-controller',
    color: '#FF9500',
    title: 'Game Center',
    subtitle: 'Tam Quốc Động Khởi, Tiên Nghịch'
  },
  { id: 'life', icon: 'apps', color: '#FFCC00', title: 'Life services', subtitle: 'Mobile top up, Pay bills, ...' },
  {
    id: 'finance',
    icon: 'grid',
    color: '#5856D6',
    title: 'Financial utilities',
    subtitle: 'TPBank loans, VIB cards, Gold price, ...'
  },
  { id: 'jobs', icon: 'briefcase', color: '#007AFF', title: 'Find jobs', subtitle: 'Post and find jobs near you' },
  {
    id: 'gov',
    icon: 'business',
    color: '#FF2D55',
    title: 'e-Government Assistant',
    subtitle: 'AI assistant for public administration'
  },
  { id: 'mini', icon: 'flash', color: '#34C759', title: 'Mini Apps', subtitle: '' }
]

export default function DiscoverScreen() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <Container safeAreaEdges={[]}>
      <SearchTopBar
        searchQuery=''
        setSearchQuery={() => {}}
        placeholder={t('search.placeholder')}
        onPress={() => router.push('/search')}
        showQr={true}
        onQrPress={() => console.log('QR')}
      />

      <ScrollView className='flex-1 bg-gray-50' showsVerticalScrollIndicator={false}>
        <View className='bg-white'>
          {DISCOVERY_ITEMS.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                className='flex-row items-center px-4 py-3'
                onPress={() => console.log('Pressed', item.title)}
              >
                <View
                  style={{ backgroundColor: item.color }}
                  className='w-10 h-10 rounded-lg items-center justify-center mr-3'
                >
                  <Ionicons name={item.icon as any} size={24} color='white' />
                </View>
                <View className='flex-1 justify-center'>
                  <Text className='text-gray-900 text-base font-medium'>{item.title}</Text>
                  {item.subtitle ? (
                    <Text className='text-gray-500 text-xs' numberOfLines={1}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name='chevron-forward' size={20} color='#CCC' />
              </TouchableOpacity>
              {index < DISCOVERY_ITEMS.length - 1 && <View className='h-[0.5px] bg-gray-100 ml-16' />}
            </React.Fragment>
          ))}
        </View>
        <View className='h-10' />
      </ScrollView>
    </Container>
  )
}
