import { View, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/context/theme-context'
import { useMyBlockedUsers } from '../queries/use-queries'
import { useUnblockUser } from '../queries/use-mutations'
import { SEMANTIC } from '@/constants/theme'
import { UserAvatar } from '@/components/common/user-avatar'

export function BlockedUsersList() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const { data: blockedUsers, isLoading } = useMyBlockedUsers()
  const unblockMutation = useUnblockUser()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color={SEMANTIC.primary} />
      </View>
    )
  }

  if (!blockedUsers || blockedUsers.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: isDark ? '#1C1F24' : '#F1F5F9',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}
        >
          <Ionicons name='ban-outline' size={40} color={isDark ? '#3E444A' : '#CBD5E1'} />
        </View>
        <Text style={{ fontSize: 16, color: isDark ? '#94A3B8' : '#64748B', textAlign: 'center' }}>
          {t('settings.privacy.noBlockedUsers')}
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Description like web/ios */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 13, color: isDark ? '#818C99' : '#64748B', lineHeight: 18 }}>
          {t('settings.privacy.blockListSubtitle') || 'Những người này sẽ không thể nhắn tin, gọi điện hoặc xem nhật ký của bạn tùy theo cài đặt chặn.'}
        </Text>
      </View>

      <View style={{ paddingVertical: 0 }}>
        {blockedUsers.map((item, index) => (
          <View
            key={item.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: isDark ? '#1C1F24' : '#fff',
              borderBottomWidth: 0.5,
              borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#F0F0F0'
            }}
          >
            <UserAvatar size='lg' source={item.avatar} name={item.fullName ? item.fullName : 'Unknown User'} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: isDark ? '#DFE2E7' : '#111827'
                }}
              >
                {item.fullName}
              </Text>
              {item.bio && (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 13,
                    color: isDark ? '#94A3B8' : '#64748B',
                    marginTop: 2
                  }}
                >
                  {item.bio}
                </Text>
              )}
            </View>

            {/* Blocked feature icons - matching web style (Right aligned before button) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
              {item.preference?.message && (
                <Ionicons
                  name='chatbubble-ellipses-outline'
                  size={18}
                  color={isDark ? '#818C99' : '#94A3B8'}
                  style={{ marginLeft: 10 }}
                />
              )}
              {item.preference?.call && (
                <Ionicons
                  name='call-outline'
                  size={18}
                  color={isDark ? '#818C99' : '#94A3B8'}
                  style={{ marginLeft: 10 }}
                />
              )}
              {item.preference?.story && (
                <Ionicons
                  name='camera-outline'
                  size={18}
                  color={isDark ? '#818C99' : '#94A3B8'}
                  style={{ marginLeft: 10 }}
                />
              )}
            </View>

            <TouchableOpacity
              onPress={() => unblockMutation.mutate(item.blockedUserId)}
              disabled={unblockMutation.isPending}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 14,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: isDark ? '#3E444A' : '#E2E8F0',
                backgroundColor: isDark ? 'transparent' : '#fff'
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isDark ? '#DFE2E7' : '#374151'
                }}
              >
                {t('settings.privacy.unblock')}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  )
}
