import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image as ExpoImage } from 'expo-image'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { useTheme } from '@/context/theme-context'

interface GroupLinkCardProps {
  groupName: string
  groupAvatar?: string | null
  linkUrl: string
  onPress?: () => void
  onLongPress?: () => void
}

export function GroupLinkCard({
  groupName,
  groupAvatar,
  linkUrl,
  onPress,
  onLongPress
}: GroupLinkCardProps) {
  const { t } = useTranslation()
  const { isDark } = useTheme()

  const name = groupName || t('message.groupLink.defaultGroupName', { defaultValue: 'Nhóm' })

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onPress} 
      onLongPress={onLongPress}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: isDark ? '#EAF1FC' : '#1D2433' }]}>
          {t('message.groupLink.openToJoin', { defaultValue: 'Truy cập link để tham gia nhóm' })}
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1D4FA7' : '#1E63D0',
              borderColor: isDark ? '#2D69C8' : '#2D76E5'
            }
          ]}
        >
          <View style={styles.cardContent}>
            <View style={styles.avatarWrap}>
              {groupAvatar ? (
                <ExpoImage 
                  source={{ uri: groupAvatar }} 
                  style={styles.avatar} 
                  contentFit='cover' 
                />
              ) : (
                <Ionicons name='people' size={22} color='#9AA2AE' />
              )}
            </View>

            <View style={styles.infoWrap}>
              <Text style={styles.label}>
                {t('message.groupLink.groupLabel', { defaultValue: 'Nhóm' })}
              </Text>
              <Text style={styles.groupName} numberOfLines={1}>
                {name}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('message.groupLink.viewInfo', { defaultValue: 'Xem thông tin' })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    minWidth: 236,
    maxWidth: 276
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 92
  },
  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8ECF2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  infoWrap: {
    marginLeft: 10,
    flex: 1
  },
  label: {
    fontSize: 13,
    color: '#CFE0FF',
    marginBottom: 2
  },
  groupName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(0,0,0,0.08)'
  },
  footerText: {
    textAlign: 'center',
    paddingVertical: 9,
    color: '#D6E6FF',
    fontSize: 13,
    fontWeight: '700'
  }
})
