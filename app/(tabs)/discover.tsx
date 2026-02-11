import { Ionicons } from '@expo/vector-icons'
import { View, ScrollView, Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Header, Text } from '@/components/ui'

interface Service {
  id: string
  title: string
  subtitle: string
  icon: string
  badge?: string | number
}

const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Zalo Video',
    subtitle: '16 điểm pháo hoa đêm Giao thừa ở...',
    icon: 'play-circle',
    badge: 'red'
  },
  {
    id: '2',
    title: 'Trang tin tổng hợp',
    subtitle: '',
    icon: 'newspaper'
  },
  {
    id: '3',
    title: 'Game Center',
    subtitle: 'Tam Quốc Đông Khởi, Tiên Nghịch',
    icon: 'game-controller'
  },
  {
    id: '4',
    title: 'Dịch vụ đời sống',
    subtitle: 'Nạp điện thoại, Tra hóa đơn, ...',
    icon: 'calendar'
  },
  {
    id: '5',
    title: 'Tiện ích tài chính',
    subtitle: 'Vay TPBank, Mở thẻ VIB, Giá vàng, ...',
    icon: 'wallet'
  },
  {
    id: '6',
    title: 'Tìm việc',
    subtitle: 'Tuyển dụng và tìm việc làm gần bạn',
    icon: 'briefcase'
  },
  {
    id: '7',
    title: 'Trợ lý Công Dân Số',
    subtitle: 'AI hỗi đáp thủ tục hành chính công',
    icon: 'cube'
  },
  {
    id: '8',
    title: 'Mini App',
    subtitle: '',
    icon: 'flash'
  }
]

export default function DiscoverScreen() {
  const { t } = useTranslation()

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <Header
        showSearch
        searchPlaceholder={t('discover.search')}
        showQRButton
      />

      {/* Services List */}
      <ScrollView className="flex-1">
        {SERVICES.map((service, index) => (
          <View key={service.id}>
            <Pressable className="flex-row items-center px-4 py-4 active:bg-gray-100">
              {/* Icon */}
              <View className="w-12 h-12 bg-primary/10 rounded-lg items-center justify-center mr-3">
                <Ionicons name={service.icon as any} size={28} color="#0068FF" />
              </View>

              {/* Content */}
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text size="base" weight="medium">
                    {service.title}
                  </Text>
                  {service.badge === 'red' && (
                    <View className="w-2 h-2 bg-destructive rounded-full" />
                  )}
                </View>
                {service.subtitle && (
                  <Text variant="muted" size="sm" numberOfLines={1} className="mt-1">
                    {service.subtitle}
                  </Text>
                )}
              </View>

              {/* Arrow */}
              <Ionicons name="chevron-forward" size={20} color="#8c8c8c" />
            </Pressable>

            {/* Divider */}
            {index < SERVICES.length - 1 && (
              <View className="h-px bg-border ml-16" />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}
