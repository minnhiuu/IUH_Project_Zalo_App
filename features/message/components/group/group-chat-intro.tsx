import React from 'react'
import { StyleSheet, View } from 'react-native'

import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'

type IntroMember = {
  userId: string
  fullName: string
  avatar: string | null
}

interface GroupChatIntroProps {
  groupName: string
  members: IntroMember[]
  isDark?: boolean
  texts?: {
    shareStory: string
    createdByYou: string
    waveHello: string
    qrJoin: string
  }
}

export function GroupChatIntro({ groupName, members, isDark = false, texts }: GroupChatIntroProps) {
  const topMembers = members.slice(0, 3)

  const palette = isDark
    ? {
        text: '#ECF2FB',
        subText: '#B8C3D3',
        card: '#1F2632',
        cardBorder: '#2E3746',
        chip: '#2A3443',
        actionChip: '#2A3647',
        qrText: '#AFC3DE'
      }
    : {
        text: '#172B4D',
        subText: '#667085',
        card: '#FFFFFF',
        cardBorder: '#DEE2E8',
        chip: '#F5F7FA',
        actionChip: '#F3F5FA',
        qrText: '#6E7B8A'
      }

  return (
    <View style={styles.wrap}>
      <View style={[styles.compactCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
        <View style={styles.compactAvatars}>
          {topMembers.map((member, index) => (
            <View key={`${member.userId}-compact`} style={[styles.compactAvatar, { marginLeft: index === 0 ? 0 : -12 }]}>
              <UserAvatar source={member.avatar || undefined} name={member.fullName || 'User'} size='sm' />
            </View>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.compactTitle, { color: palette.text }]} numberOfLines={1}>{groupName}</Text>
          <Text style={[styles.compactSubtitle, { color: palette.subText }]}>
            {texts?.shareStory || 'Bat dau chia se nhung cau chuyen thu vi cung nhau'}
          </Text>
        </View>
      </View>

      <View style={[styles.createdCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
        <View style={[styles.cameraCircle, { borderColor: palette.cardBorder }]}>
          <Text style={{ fontSize: 22, color: palette.subText }}>📷</Text>
        </View>

        <View style={styles.createdHeaderRow}>
          <Text style={[styles.createdTitle, { color: palette.text }]}>{groupName}</Text>
          <Text style={{ fontSize: 22, color: palette.subText }}>›</Text>
        </View>

        <Text style={[styles.createdSubtitle, { color: palette.subText }]}>
          {texts?.createdByYou || 'Ban vua tao nhom'}
        </Text>

        <View style={styles.createdAvatarsRow}>
          {topMembers.map((member, index) => (
            <View key={`${member.userId}-created`} style={[styles.createdAvatar, { marginLeft: index === 0 ? 0 : -8 }]}>
              <UserAvatar source={member.avatar || undefined} name={member.fullName || 'User'} size='sm' />
            </View>
          ))}
          <View style={[styles.addMemberChip, { backgroundColor: palette.actionChip }]}> 
            <Text style={{ fontSize: 16, color: '#2B87FF', fontWeight: '700' }}>👥+</Text>
          </View>
        </View>

        <View style={[styles.waveChip, { backgroundColor: palette.chip }]}> 
          <Text style={styles.waveEmoji}>👋</Text>
          <Text style={[styles.waveText, { color: palette.text }]}>{texts?.waveHello || 'Vay tay chao'}</Text>
        </View>

        <View style={[styles.qrRow, { borderTopColor: palette.cardBorder }]}> 
          <Text style={[styles.qrText, { color: palette.qrText }]}>{texts?.qrJoin || 'Xem ma QR tham gia nhom'}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 16
  },
  compactCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  compactAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14
  },
  compactAvatar: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 99
  },
  compactTitle: {
    fontSize: 17,
    fontWeight: '700'
  },
  compactSubtitle: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 21
  },
  createdCard: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden'
  },
  cameraCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 18
  },
  createdHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  createdTitle: {
    fontSize: 19,
    fontWeight: '700'
  },
  createdSubtitle: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 17
  },
  createdAvatarsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  createdAvatar: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 99
  },
  addMemberChip: {
    marginLeft: -8,
    width: 54,
    height: 34,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7E3F7'
  },
  waveChip: {
    marginTop: 12,
    alignSelf: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  waveEmoji: {
    fontSize: 27 / 1.1
  },
  waveText: {
    fontSize: 18,
    fontWeight: '700'
  },
  qrRow: {
    borderTopWidth: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qrText: {
    fontSize: 16,
    fontWeight: '500'
  }
})
