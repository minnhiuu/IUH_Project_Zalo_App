import { Ionicons } from '@expo/vector-icons'
import { ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Header, Text, Box, VStack, HStack, Divider } from '@/components/ui'
import { Pressable } from '@/components/ui/pressable'

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
    subtitle: '16 �i?m ph�o hoa ��m Giao th?a ?...',
    icon: 'play-circle',
    badge: 'red'
  },
  {
    id: '2',
    title: 'Trang tin t?ng h?p',
    subtitle: '',
    icon: 'newspaper'
  },
  {
    id: '3',
    title: 'Game Center',
    subtitle: 'Tam Qu?c ��ng Kh?i, Ti�n Ngh?ch',
    icon: 'game-controller'
  },
  {
    id: '4',
    title: 'D?ch v? �?i s?ng',
    subtitle: 'N?p �i?n tho?i, Tra h�a ��n, ...',
    icon: 'calendar'
  },
  {
    id: '5',
    title: 'Ti?n �ch t�i ch�nh',
    subtitle: 'Vay TPBank, M? th? VIB, Gi� v�ng, ...',
    icon: 'wallet'
  },
  {
    id: '6',
    title: 'T?m vi?c',
    subtitle: 'Tuy?n d?ng v� t?m vi?c l�m g?n b?n',
    icon: 'briefcase'
  },
  {
    id: '7',
    title: 'Tr? l? C�ng D�n S?',
    subtitle: 'AI h?i ��p th? t?c h�nh ch�nh c�ng',
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
    <Box style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <Header
        showSearch
        searchPlaceholder={t('discover.search')}
        showQRButton
      />

      {/* Services List */}
      <ScrollView style={{ flex: 1 }}>
        {SERVICES.map((service, index) => (
          <VStack key={service.id} space="xs">
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 }}>
              {/* Icon */}
              <Box style={{ width: 48, height: 48, backgroundColor: '#e0f2fe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name={service.icon as any} size={28} color="#0068FF" />
              </Box>

              {/* Content */}
              <VStack style={{ flex: 1 }} space="xs">
                <HStack space="sm" style={{ alignItems: 'center' }}>
                  <Text size="md" bold>
                    {service.title}
                  </Text>
                  {service.badge === 'red' && (
                    <Box style={{ width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4 }} />
                  )}
                </HStack>
                {service.subtitle && (
                  <Text style={{ color: '#6b7280', marginTop: 4 }} size="sm" numberOfLines={1}>
                    {service.subtitle}
                  </Text>
                )}
              </VStack>

              {/* Arrow */}
              <Ionicons name="chevron-forward" size={20} color="#8c8c8c" />
            </Pressable>

            {/* Divider */}
            {index < SERVICES.length - 1 && (
              <Divider style={{ marginLeft: 64 }} />
            )}
          </VStack>
        ))}
      </ScrollView>
    </Box>
  )
}
