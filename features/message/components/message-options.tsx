import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, ScrollView, Alert, Switch, Modal, TextInput } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Text } from '@/components/ui/text'
import { useTheme } from '@/context/theme-context'
import { UserAvatar } from '@/components/common/user-avatar'
import { useBlockDetails, useMyProfile, useUserById } from '@/features/users/queries/use-queries'
import { BlockUserModal } from '@/features/users/components/block-user-modal'
import { useUnfriend } from '@/features/friend/queries/use-mutations'
import { HEADER } from '@/constants/theme'
import { useConversations, useMediaMessages, useClearConversationHistory, useDisbandGroup, useLeaveGroup, useUpdateGroupName } from '@/features/message/queries'
import Toast from 'react-native-toast-message'

const DIVIDER_COLOR_LIGHT = '#F0F0F0'
const DIVIDER_COLOR_DARK = 'rgba(255,255,255,0.07)'

interface MenuItemRowProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  destructive?: boolean
  isDark: boolean
  showChevron?: boolean
  rightNode?: React.ReactNode
}

function MenuItemRow({ icon, label, onPress, destructive, isDark, showChevron = true, rightNode }: MenuItemRowProps) {
  const textColor = destructive ? '#DC2626' : isDark ? '#DFE2E7' : '#111827'
  const iconColor = destructive ? '#DC2626' : isDark ? '#B6C1CF' : '#374151'

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.55}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: isDark ? '#1C1F24' : '#fff',
        borderBottomWidth: 1,
        borderBottomColor: isDark ? DIVIDER_COLOR_DARK : DIVIDER_COLOR_LIGHT
      }}
    >
      <Ionicons name={icon} size={20} color={iconColor} style={{ marginRight: 12 }} />
      <Text style={{ flex: 1, fontSize: 15, color: textColor }}>{label}</Text>
      {rightNode ??
        (showChevron ? <Ionicons name='chevron-forward' size={16} color={isDark ? '#3E444A' : '#C7C7CC'} /> : null)}
    </TouchableOpacity>
  )
}

export default function MessageOptionsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id, name, isFriend: isFriendString, conversationId } = useLocalSearchParams<{ id: string; name: string; isFriend: string; conversationId?: string }>()
  const { isDark } = useTheme()
  const [blockModalVisible, setBlockModalVisible] = useState(false)
  const { data: recentMedia = [] } = useMediaMessages(conversationId ?? '', ['IMAGE', 'VIDEO'], 0, 100, !!conversationId)
  const [isBestFriend, setIsBestFriend] = useState(false)
  const [pinChat, setPinChat] = useState(false)
  const [muteNotification, setMuteNotification] = useState(false)
  const [hideConversation, setHideConversation] = useState(false)
  const isFriend = isFriendString === 'true'
  const isGroup = !isFriend
  const unfriend = useUnfriend()
  const { mutate: clearHistory } = useClearConversationHistory()
  const { mutate: disbandGroup } = useDisbandGroup()
  const { mutate: leaveGroup } = useLeaveGroup()
  const { mutate: updateGroupName } = useUpdateGroupName()
  const [renameVisible, setRenameVisible] = useState(false)
  const [renameValue, setRenameValue] = useState('')

  const { data: myProfile } = useMyProfile()
  const { data: userProfile } = useUserById(id as string)
  const { data: allConversations = [] } = useConversations(0, 100, true)
  const isOwner = myProfile?.id === id
  const { data: blockDetails } = useBlockDetails(id as string, !!id)
  const activeConversation = allConversations.find((c) => c.id === conversationId)
  const myGroupRole = String(
    activeConversation?.members?.find((m) => m.userId === myProfile?.id)?.role || 'MEMBER'
  ).toUpperCase()
  const canManageGroup = myGroupRole === 'OWNER' || myGroupRole === 'ADMIN'
  const rawGroupName = String(activeConversation?.name || '').trim()
  const isUnnamedGroup = !rawGroupName
  const groupName = (rawGroupName || (name as string) || t('message.groupCreate.defaultGroupName')) as string
  const groupTitle = isUnnamedGroup ? t('message.groupOptions.setGroupName') : groupName
  const groupAvatar = activeConversation?.avatar || null
  const groupMembersCount = activeConversation?.members?.length || 0

  const quickActions = useMemo(
    () => [
      { key: 'search', icon: 'search-outline' as const, label: t('profile.chatOptions.searchMessages') },
      { key: 'profile', icon: 'person-outline' as const, label: t('profile.chatOptions.profile') },
      { key: 'wallpaper', icon: 'brush-outline' as const, label: t('profile.chatOptions.changeWallpaper') },
      { key: 'mute', icon: 'notifications-outline' as const, label: t('profile.chatOptions.muteNotification') }
    ],
    [t]
  )

  const handleUnfriend = () => {
    Alert.alert(t('profile.menu.unfriendConfirm.title'), t('profile.menu.unfriendConfirm.message', { name }), [
      {
        text: t('profile.menu.unfriendConfirm.cancel'),
        style: 'cancel'
      },
      {
        text: t('profile.menu.unfriendConfirm.confirm'),
        onPress: () => {
          if (!id) return
          unfriend.mutate(id, {
            onSuccess: () => {
              router.push('/(tabs)')
            }
          })
        },
        style: 'destructive'
      }
    ])
  }

  const bg = isDark ? '#121416' : '#F3F4F6'
  const cardBg = isDark ? '#1C1F24' : '#fff'
  const headerGradient = isDark ? HEADER.gradientColorsDark : HEADER.gradientColors

  const groupPalette = isDark
    ? {
        bg: '#14181F',
        card: '#1D232C',
        section: '#222A34',
        divider: 'rgba(255,255,255,0.08)',
        text: '#EEF2F8',
        subText: '#AAB4C4',
        icon: '#B8C2D1',
        iconBg: '#2B3441',
        switchFalse: '#3A4656',
        switchTrue: '#3F8CFF'
      }
    : {
        bg: '#F2F2F3',
        card: '#FFFFFF',
        section: '#F6F6F7',
        divider: '#ECEDEF',
        text: '#141B2D',
        subText: '#7B8794',
        icon: '#8C97A3',
        iconBg: '#F1F2F4',
        switchFalse: '#E5E7EB',
        switchTrue: '#4B93FF'
      }

  const onClearHistory = () => {
    if (!conversationId) return
    Alert.alert(t('message.groupOptions.clearHistory'), t('message.conversationOptions.clearHistoryMessage'), [
      { text: t('message.groupOptions.cancel'), style: 'cancel' },
      {
        text: t('message.groupOptions.confirm'),
        style: 'destructive',
        onPress: () => clearHistory(conversationId)
      }
    ])
  }

  const onLeaveGroup = () => {
    if (!conversationId) return
    Alert.alert(t('message.groupOptions.leaveGroup'), t('message.groupOptions.leaveGroupConfirm'), [
      { text: t('message.groupOptions.cancel'), style: 'cancel' },
      {
        text: t('message.groupOptions.confirm'),
        style: 'destructive',
        onPress: () => {
          leaveGroup(
            { conversationId },
            {
              onSuccess: () => {
                Toast.show({ type: 'success', text1: t('message.groupOptions.leaveSuccess') })
                router.replace('/(tabs)' as any)
              }
            }
          )
        }
      }
    ])
  }

  const onDisbandGroup = () => {
    if (!conversationId) return
    Alert.alert(
      t('message.groupSettings.disbandGroup', { defaultValue: 'Giải tán nhóm' }),
      t('message.groupOptions.disbandConfirm', { defaultValue: 'Bạn có chắc muốn giải tán nhóm này?' }),
      [
        { text: t('message.groupOptions.cancel'), style: 'cancel' },
        {
          text: t('message.groupOptions.confirm'),
          style: 'destructive',
          onPress: () => {
            disbandGroup(conversationId, {
              onSuccess: () => {
                Toast.show({ type: 'success', text1: t('message.groupSettings.disbandSuccess') })
                router.replace('/(tabs)' as any)
              }
            })
          }
        }
      ]
    )
  }

  const openRenameGroup = () => {
    if (!conversationId) return
    setRenameValue(rawGroupName)
    setRenameVisible(true)
  }

  const submitRenameGroup = () => {
    if (!conversationId) return
    const nextName = renameValue.trim()
    if (!nextName) {
      Toast.show({ type: 'error', text1: t('message.groupOptions.renameEmpty') })
      return
    }
    updateGroupName(
      { conversationId, name: nextName },
      {
        onSuccess: () => {
          setRenameVisible(false)
          Toast.show({ type: 'success', text1: t('message.groupOptions.renameSuccess') })
        }
      }
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <LinearGradient colors={headerGradient}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: HEADER.paddingHorizontal,
              height: HEADER.height
            }}
          >
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={{ paddingRight: 10 }}>
              <Ionicons name='chevron-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={{ flex: 1, fontSize: 17, fontWeight: '600', color: '#fff' }} numberOfLines={1}>
              {t('profile.chatOptions.title')}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }}>
        {isGroup ? (
          <>
            <View
              style={{
                backgroundColor: groupPalette.card,
                paddingTop: 14,
                paddingBottom: 10,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: groupPalette.divider
              }}
            >
              <View style={{ position: 'relative' }}>
                {groupAvatar ? (
                  <UserAvatar source={groupAvatar} name={groupName} size='3xl' />
                ) : (
                  <View
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 44,
                      backgroundColor: groupPalette.iconBg,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Ionicons name='people' size={34} color={groupPalette.icon} />
                  </View>
                )}
                <View
                  style={{
                    position: 'absolute',
                    right: 4,
                    bottom: 4,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: groupPalette.card,
                    borderWidth: 1,
                    borderColor: groupPalette.divider,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name='camera-outline' size={13} color={groupPalette.icon} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <Text style={{ fontSize: 19, fontWeight: '700', color: groupPalette.text }} numberOfLines={1}>
                  {groupTitle}
                </Text>
                {canManageGroup ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                      marginLeft: 8,
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: groupPalette.iconBg,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onPress={openRenameGroup}
                  >
                    <Ionicons name='pencil-outline' size={16} color={groupPalette.icon} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={{ flexDirection: 'row', marginTop: 14, paddingHorizontal: 10 }}>
                {[
                  { icon: 'search-outline' as const, label: t('message.groupOptions.searchMessages') },
                  { icon: 'brush-outline' as const, label: t('message.groupOptions.changeWallpaper') },
                  { icon: 'notifications-outline' as const, label: t('message.groupOptions.muteNotifications') }
                , ...(canManageGroup ? [{ icon: 'person-add-outline' as const, label: t('message.groupOptions.addMember') }] : [])].map((action) => (
                  <TouchableOpacity key={action.label} style={{ width: canManageGroup ? '25%' : '33.333%', alignItems: 'center' }} activeOpacity={0.72}>
                    <View
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: 23,
                        backgroundColor: groupPalette.iconBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 6
                      }}
                    >
                      <Ionicons name={action.icon} size={21} color={groupPalette.text} />
                    </View>
                    <Text style={{ fontSize: 12, textAlign: 'center', color: groupPalette.text, lineHeight: 16 }}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ height: 9, backgroundColor: groupPalette.section }} />

            <View style={{ backgroundColor: groupPalette.card }}>
              <MenuItemRow icon='information-circle-outline' label={t('message.groupOptions.addDescription')} onPress={() => {}} isDark={isDark} />
            </View>

            <View style={{ marginTop: 8, backgroundColor: groupPalette.card, paddingBottom: 8 }}>
              <MenuItemRow icon='folder-open-outline' label={t('message.groupOptions.mediaFilesLinks')} onPress={() => {}} isDark={isDark} />
              <View
                style={{
                  marginHorizontal: 16,
                  marginBottom: 8,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: isDark ? '#252E3A' : '#F4F6F9',
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontSize: 13, color: groupPalette.subText }}>
                  {t('message.groupOptions.latestMediaHint')}
                </Text>
              </View>
              <MenuItemRow icon='calendar-outline' label={t('message.groupOptions.groupCalendar')} onPress={() => {}} isDark={isDark} />
              <MenuItemRow icon='attach-outline' label={t('message.groupOptions.pinnedMessages')} onPress={() => {}} isDark={isDark} />
              <MenuItemRow icon='bar-chart-outline' label={t('message.groupOptions.polls')} onPress={() => {}} isDark={isDark} />
            </View>

            <View style={{ marginTop: 8, backgroundColor: groupPalette.card }}>
              {canManageGroup ? (
                <MenuItemRow
                  icon='settings-outline'
                  label={t('message.groupOptions.groupSettings')}
                  onPress={() => {
                    if (!conversationId) return
                    router.push({
                      pathname: '/group/settings' as any,
                      params: {
                        conversationId,
                        name: groupName
                      }
                    })
                  }}
                  isDark={isDark}
                />
              ) : null}
              <MenuItemRow
                icon='people-outline'
                label={t('message.groupOptions.viewMembers', { count: groupMembersCount })}
                onPress={() => {
                  if (!conversationId) return
                  router.push({
                    pathname: '/group/members' as any,
                    params: {
                      conversationId,
                      name: groupName
                    }
                  })
                }}
                isDark={isDark}
              />
              {canManageGroup ? (
                <MenuItemRow
                  icon='person-add-outline'
                  label={t('message.groupOptions.approveNewMembers')}
                  onPress={() => {
                    if (!conversationId) return
                    router.push({
                      pathname: '/group/members' as any,
                      params: {
                        conversationId,
                        name: groupName
                      }
                    })
                  }}
                  isDark={isDark}
                />
              ) : null}
              <MenuItemRow
                icon='link-outline'
                label={t('message.groupOptions.groupLink')}
                onPress={() => {
                  if (!conversationId) return
                  router.push({
                    pathname: '/group/link' as any,
                    params: {
                      conversationId,
                      name: groupName,
                      canManage: canManageGroup ? 'true' : 'false'
                    }
                  })
                }}
                isDark={isDark}
                rightNode={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: groupPalette.subText, fontSize: 12 }}>{t('message.groupOptions.off')}</Text>
                    <Ionicons name='chevron-forward' size={16} color={isDark ? '#3E444A' : '#C7C7CC'} />
                  </View>
                }
              />
            </View>

            <View style={{ marginTop: 8, backgroundColor: groupPalette.card }}>
              <MenuItemRow
                icon='attach-outline'
                label={t('message.groupOptions.pinConversation')}
                onPress={() => setPinChat((v) => !v)}
                isDark={isDark}
                showChevron={false}
                rightNode={
                  <Switch
                    value={pinChat}
                    onValueChange={setPinChat}
                    trackColor={{ false: groupPalette.switchFalse, true: groupPalette.switchTrue }}
                    thumbColor='#fff'
                  />
                }
              />
              <MenuItemRow
                icon='eye-off-outline'
                label={t('message.groupOptions.hideConversation')}
                onPress={() => setHideConversation((v) => !v)}
                isDark={isDark}
                showChevron={false}
                rightNode={
                  <Switch
                    value={hideConversation}
                    onValueChange={setHideConversation}
                    trackColor={{ false: groupPalette.switchFalse, true: groupPalette.switchTrue }}
                    thumbColor='#fff'
                  />
                }
              />
              <MenuItemRow icon='person-circle-outline' label={t('message.groupOptions.personalSettings')} onPress={() => {}} isDark={isDark} />
            </View>

            <View style={{ marginTop: 8, backgroundColor: groupPalette.card }}>
              <MenuItemRow icon='warning-outline' label={t('message.groupOptions.report')} onPress={() => {}} isDark={isDark} />
              <MenuItemRow icon='pie-chart-outline' label={t('message.groupOptions.storage')} onPress={() => {}} isDark={isDark} />
              <MenuItemRow icon='trash-outline' label={t('message.groupOptions.clearHistory')} onPress={onClearHistory} isDark={isDark} />
              {myGroupRole === 'OWNER' ? (
                <MenuItemRow
                  icon='alert-circle-outline'
                  label={t('message.groupSettings.disbandGroup')}
                  onPress={onDisbandGroup}
                  destructive
                  isDark={isDark}
                />
              ) : null}
              <MenuItemRow icon='log-out-outline' label={t('message.groupOptions.leaveGroup')} onPress={onLeaveGroup} destructive isDark={isDark} />
            </View>
          </>
        ) : (
        <>
        <View style={{ backgroundColor: cardBg, paddingTop: 18, paddingBottom: 16, alignItems: 'center' }}>
          <View
            style={{
              borderRadius: 56,
              padding: 2,
              backgroundColor: '#fff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6
            }}
          >
            <UserAvatar
              source={userProfile?.avatar || null}
              name={(name as string) || userProfile?.fullName || ''}
              size='3xl'
            />
          </View>
          <Text style={{ marginTop: 14, fontSize: 22, fontWeight: '700', color: isDark ? '#F8FAFC' : '#111827' }}>
            {(name as string) || userProfile?.fullName || ''}
          </Text>

          <View style={{ flexDirection: 'row', marginTop: 18, paddingHorizontal: 10 }}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                style={{ width: '25%', alignItems: 'center' }}
                activeOpacity={0.7}
                onPress={() => {
                  if (action.key === 'mute') setMuteNotification((v) => !v)
                }}
              >
                <View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: isDark ? '#2A2F36' : '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8
                  }}
                >
                  <Ionicons name={action.icon} size={27} color={isDark ? '#D0D6DD' : '#111827'} />
                </View>
                <Text
                  style={{ fontSize: 14, textAlign: 'center', color: isDark ? '#D0D6DD' : '#1F2937', lineHeight: 18 }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 8, backgroundColor: cardBg }}>
          <MenuItemRow
            icon='create-outline'
            label={t('profile.menu.changeNickname')}
            onPress={() => {}}
            isDark={isDark}
          />
          <MenuItemRow
            icon='star-outline'
            label={t('profile.menu.markAsBestFriend')}
            onPress={() => {}}
            isDark={isDark}
            showChevron={false}
            rightNode={
              <Switch
                value={isBestFriend}
                onValueChange={setIsBestFriend}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor='#fff'
              />
            }
          />
          <MenuItemRow
            icon='time-outline'
            label={t('profile.chatOptions.sharedJournal')}
            onPress={() => {}}
            isDark={isDark}
          />
        </View>

        <View
          style={{ marginTop: 10, backgroundColor: cardBg, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (!conversationId) return
              router.push({
                pathname: '/media-storage' as any,
                params: { conversationId, name }
              })
            }}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}
          >
            <Ionicons
              name='images-outline'
              size={22}
              color={isDark ? '#D0D6DD' : '#6B7280'}
              style={{ marginRight: 14 }}
            />
            <Text style={{ flex: 1, fontSize: 18, color: isDark ? '#F1F5F9' : '#1F2937' }}>
              {t('profile.chatOptions.mediaFilesLinks')}
            </Text>
            <Ionicons name='chevron-forward' size={18} color={isDark ? '#3E444A' : '#C7C7CC'} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {Array.from({ length: 5 }).map((_, idx) => {
              const msg = recentMedia[idx]
              const url = msg?.attachments?.[0]?.url
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={url ? 0.8 : 1}
                  onPress={() => {
                    if (!conversationId) return
                    router.push({ pathname: '/media-storage' as any, params: { conversationId, name } })
                  }}
                  style={{ flex: 1, aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: isDark ? '#2A2F36' : '#ECEFF3' }}
                >
                  {url ? (
                    <>
                      <ExpoImage
                        source={{ uri: url }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit='cover'
                        cachePolicy='memory-disk'
                      />
                      {msg.type === 'VIDEO' && (
                        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name='play-circle' size={22} color='rgba(255,255,255,0.9)' />
                        </View>
                      )}
                    </>
                  ) : null}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={{ marginTop: 10, backgroundColor: cardBg }}>
          <MenuItemRow
            icon='people-outline'
            label={t('profile.chatOptions.createGroupWithUser', { name })}
            onPress={() => {}}
            isDark={isDark}
          />
          <MenuItemRow
            icon='person-add-outline'
            label={t('profile.chatOptions.addUserToGroup', { name })}
            onPress={() => {}}
            isDark={isDark}
          />
          <MenuItemRow
            icon='people-circle-outline'
            label={t('profile.chatOptions.viewCommonGroups')}
            onPress={() => {}}
            isDark={isDark}
          />
        </View>

        <View style={{ marginTop: 10, backgroundColor: cardBg }}>
          <MenuItemRow
            icon='pin-outline'
            label={t('profile.chatOptions.pinConversation')}
            onPress={() => setPinChat((v) => !v)}
            isDark={isDark}
            showChevron={false}
            rightNode={
              <Switch
                value={pinChat}
                onValueChange={setPinChat}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor='#fff'
              />
            }
          />
          {!isOwner && (
            <MenuItemRow
              icon='ban-outline'
              label={blockDetails ? t('settings.privacy.blockSettings') : t('settings.privacy.manageBlock')}
              onPress={() => setBlockModalVisible(true)}
              destructive
              isDark={isDark}
            />
          )}
          {isFriend && !isOwner && (
            <MenuItemRow
              icon='person-remove-outline'
              label={t('profile.menu.unfriend')}
              onPress={handleUnfriend}
              destructive
              isDark={isDark}
            />
          )}
        </View>
        </>
        )}
      </ScrollView>

      <Modal visible={renameVisible} transparent animationType='fade' onRequestClose={() => setRenameVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: isDark ? '#1E2530' : '#FFFFFF', borderRadius: 14, padding: 14 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#EEF2F8' : '#111827' }}>{t('message.groupOptions.renameTitle')}</Text>
            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder={t('message.groupOptions.renamePlaceholder')}
              placeholderTextColor={isDark ? '#97A3B6' : '#9CA3AF'}
              style={{
                marginTop: 12,
                borderWidth: 1,
                borderColor: isDark ? '#384457' : '#D1D5DB',
                borderRadius: 10,
                height: 42,
                paddingHorizontal: 12,
                color: isDark ? '#EEF2F8' : '#111827'
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14, gap: 10 }}>
              <TouchableOpacity onPress={() => setRenameVisible(false)}>
                <Text style={{ color: isDark ? '#C8D1DE' : '#6B7280', fontSize: 14 }}>{t('message.groupOptions.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitRenameGroup}>
                <Text style={{ color: '#228BE6', fontSize: 14, fontWeight: '700' }}>{t('message.groupOptions.renameSave')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BlockUserModal
        key={`block-modal-${id}-${!!blockDetails}`}
        userId={id as string}
        userName={name as string}
        visible={blockModalVisible}
        onClose={() => setBlockModalVisible(false)}
        isBlocked={!!blockDetails}
        currentPreference={blockDetails?.preference}
      />
    </View>
  )
}
