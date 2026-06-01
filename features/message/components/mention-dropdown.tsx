import React, { useMemo } from 'react'
import { View, FlatList, TouchableOpacity, Keyboard } from 'react-native'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, BRAND } from '@/constants/theme'
import { Ionicons } from '@expo/vector-icons'

interface MentionDropdownProps {
  members: any[]
  query: string
  showAllMention?: boolean
  onSelect: (member: any) => void
  onClose: () => void
}

export function MentionDropdown({ members, query, showAllMention = false, onSelect, onClose }: MentionDropdownProps) {
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const isDark = colorScheme === 'dark'
  const colors = Colors[colorScheme]

  const filteredMembers = useMemo(() => {
    const q = query.toLowerCase()
    let filtered = members.filter((m) => {
      const name = (m.fullName || m.name || '').toLowerCase()
      return name.includes(q)
    })
    
    if (showAllMention && 'all'.includes(q)) {
      filtered = [
        {
          userId: 'all',
          fullName: 'All',
          isAll: true
        },
        ...filtered
      ]
    }
    return filtered
  }, [members, query, showAllMention])

  if (filteredMembers.length === 0) {
    return null
  }

  return (
    <View
      style={{
        maxHeight: 200,
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5
      }}
    >
      <View style={{ paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? '#111827' : '#F3F4F6' }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>
          {t('chat.mentionDropdown.instruction', { defaultValue: 'Nhắc đến thành viên' })}
        </Text>
        <TouchableOpacity onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.userId || item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          if (item.isAll) {
            return (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border }}
                onPress={() => onSelect(item)}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: BRAND.blue, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="people" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>@All</Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>{t('chat.mentionDropdown.notifyAll', { defaultValue: 'Nhắc tất cả mọi người' })}</Text>
                </View>
              </TouchableOpacity>
            )
          }

          return (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border }}
              onPress={() => onSelect(item)}
            >
              <View style={{ marginRight: 12 }}>
                <UserAvatar source={item.avatar} name={item.fullName || item.name} size="sm" />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>
                {item.fullName || item.name}
              </Text>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}
