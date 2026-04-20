import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { UserAvatar } from '@/components/common/user-avatar'
import { Text } from '@/components/ui/text'
import type { SearchMemberResponse } from '@/features/message/schemas'
import { useTheme } from '@/context'

interface GroupMemberPickerItemProps {
  member: SearchMemberResponse
  subtitle?: string
  selected: boolean
  onPress: () => void
}

export function GroupMemberPickerItem({ member, subtitle, selected, onPress }: GroupMemberPickerItemProps) {
  const { isDark } = useTheme()

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View
        style={[
          styles.checkbox,
          { borderColor: isDark ? '#4E5866' : '#CBD2DB' },
          selected && styles.checkboxSelected
        ]}
      >
        {selected && <Ionicons name='checkmark' size={16} color='#FFFFFF' />}
      </View>

      <UserAvatar source={member.avatar || undefined} name={member.fullName || 'User'} size='xl' />

      <View style={[styles.content, { borderBottomColor: isDark ? '#2D3440' : '#E5E9EF' }]}>
        <Text style={styles.name} numberOfLines={1}>
          {member.fullName}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD2DB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxSelected: {
    borderColor: '#1977F3',
    backgroundColor: '#1977F3'
  },
  content: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E9EF',
    paddingBottom: 11,
    paddingTop: 2
  },
  name: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500'
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: '#7B8591'
  }
})
