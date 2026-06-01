import { Ionicons } from '@expo/vector-icons'
import { ScrollView, Image, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Header, Text, Box, VStack, HStack, Divider } from '@/components/ui'
import { SEMANTIC } from '@/constants/theme'

interface Service {
  id: string
  title: string
  subtitle: string
  icon: string
  iconColor: string
  badge?: string | number
  rightImage?: string
}

const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Zalo Video',
    subtitle: '[Xem nhiều] Ăn hàng 5K ở chợ',
    icon: 'play',
    iconColor: '#F54254',
    badge: 'red',
    rightImage: 'https://picsum.photos/id/1025/100/100'
  },
  {
    id: '2',
    title: 'Trang tin tổng hợp',
    subtitle: '',
    icon: 'newspaper-outline',
    iconColor: '#EA4335'
  },
  {
    id: '3',
    title: 'Game Center',
    subtitle: 'Tam Quốc Động Khởi, Tiên Nghịch',
    icon: 'game-controller-outline',
    iconColor: '#FBBC05'
  },
  {
    id: '4',
    title: 'Dịch vụ đời sống',
    subtitle: 'Nạp điện thoại, Tra hóa đơn, ...',
    icon: 'home-outline',
    iconColor: '#34A853'
  },
  {
    id: '5',
    title: 'Tiện ích tài chính',
    subtitle: 'Vay TPBank, Mở thẻ VIB, Giá vàng, ...',
    icon: 'apps-outline',
    iconColor: '#EA4335'
  },
  {
    id: '6',
    title: 'Tìm việc',
    subtitle: 'Tuyển dụng và tìm việc làm gần bạn',
    icon: 'briefcase-outline',
    iconColor: '#4285F4'
  },
  {
    id: '7',
    title: 'Trợ lý Công Dân Số',
    subtitle: 'AI hỏi đáp thủ tục hành chính công',
    icon: 'business-outline',
    iconColor: '#4285F4'
  },
  {
    id: '8',
    title: 'Mini App',
    subtitle: '',
    icon: 'flash-outline',
    iconColor: '#4285F4'
  }
]

export default function DiscoverScreen() {
  const { t } = useTranslation()

  return (
    <Box style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <Header showSearch searchPlaceholder={t('discover.search')} showQRButton />

      {/* Services List */}
      <ScrollView style={{ flex: 1 }}>
        {SERVICES.map((service, index) => (
          <VStack key={service.id} space='xs'>
            <TouchableOpacity
              activeOpacity={0.7}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 }}
            >
              {/* Icon */}
              <Box
                style={{
                  width: 48,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12
                }}
              >
                <Ionicons name={service.icon as any} size={28} color={service.iconColor} />
              </Box>

              {/* Content */}
              <VStack style={{ flex: 1 }} space='xs'>
                <HStack space='sm' style={{ alignItems: 'center' }}>
                  <Text size='md' bold>
                    {service.title}
                  </Text>
                  {service.badge === 'red' && (
                    <Box style={{ width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4 }} />
                  )}
                </HStack>
                {service.subtitle ? (
                  <Text style={{ color: '#6b7280', marginTop: 4 }} size='sm' numberOfLines={1}>
                    {service.subtitle}
                  </Text>
                ) : null}
              </VStack>

              {/* Right Side */}
              <HStack space='sm' style={{ alignItems: 'center' }}>
                {service.rightImage && (
                  <Image
                    source={{ uri: service.rightImage }}
                    style={{ width: 44, height: 44, borderRadius: 8, marginLeft: 8 }}
                  />
                )}
                {/* Arrow */}
                <Ionicons name='chevron-forward' size={20} color={SEMANTIC.iconMuted} />
              </HStack>
            </TouchableOpacity>

            {/* Divider */}
            {index < SERVICES.length - 1 && <Divider style={{ marginLeft: 64 }} />}
          </VStack>
        ))}
      </ScrollView>
    </Box>
  )
}
