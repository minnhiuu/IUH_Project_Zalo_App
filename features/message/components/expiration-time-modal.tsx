import React, { useState } from 'react'
import { View, TouchableOpacity, Modal, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { useTheme } from '@/context/theme-context'
import Toast from 'react-native-toast-message'

interface ExpirationTimeModalProps {
  visible: boolean
  onClose: () => void
  currentDays: number | null | undefined
  onSave: (days: number) => void
  isPending?: boolean
}

const OPTIONS = [
  { days: 0, labelKey: 'messages.disappearing.never' },
  { days: 1, labelKey: 'messages.disappearing.oneDay' },
  { days: 7, labelKey: 'messages.disappearing.sevenDays' },
  { days: 14, labelKey: 'messages.disappearing.fourteenDays' }
]

export function ExpirationTimeModal({
  visible,
  onClose,
  currentDays,
  onSave,
  isPending = false
}: ExpirationTimeModalProps) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [selectedDays, setSelectedDays] = useState<number>(currentDays ?? 0)

  React.useEffect(() => {
    if (visible) {
      setSelectedDays(currentDays ?? 0)
    }
  }, [visible, currentDays])

  const palette = isDark
    ? {
        overlay: 'rgba(0,0,0,0.55)',
        bg: '#1C2028',
        headerBg: '#232A34',
        text: '#EEF2F8',
        subText: '#97A3B6',
        divider: 'rgba(255,255,255,0.08)',
        selectedBg: 'rgba(63,140,255,0.12)',
        selectedBorder: '#3F8CFF',
        radio: '#3F8CFF',
        radioEmpty: '#4A5568',
        btnSave: '#3F8CFF',
        btnCancel: '#384457',
        btnSaveText: '#FFFFFF',
        btnCancelText: '#C8D1DE',
        iconColor: '#3F8CFF'
      }
    : {
        overlay: 'rgba(0,0,0,0.35)',
        bg: '#FFFFFF',
        headerBg: '#F8FAFC',
        text: '#111827',
        subText: '#6B7280',
        divider: '#F0F0F0',
        selectedBg: 'rgba(59,130,246,0.06)',
        selectedBorder: '#3B82F6',
        radio: '#3B82F6',
        radioEmpty: '#D1D5DB',
        btnSave: '#3B82F6',
        btnCancel: '#F3F4F6',
        btnSaveText: '#FFFFFF',
        btnCancelText: '#374151',
        iconColor: '#3B82F6'
      }

  const handleSave = () => {
    onSave(selectedDays)
  }

  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: palette.overlay, justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable
          style={{
            backgroundColor: palette.bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 34,
            maxHeight: '75%'
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <View style={{ alignItems: 'center', marginTop: 12, marginBottom: 4 }}>
            <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: palette.divider }} />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: palette.divider
            }}
          >
            <Ionicons name='timer-outline' size={24} color={palette.iconColor} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text }}>
              {t('messages.disappearing.title', { defaultValue: 'Tin nhắn tự xóa' })}
            </Text>
          </View>

          {/* Description */}
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
            <Text style={{ fontSize: 14, color: palette.subText, lineHeight: 20 }}>
              {t('messages.disappearing.description', { defaultValue: 'Các tin nhắn gửi mới sẽ tự động xóa với mọi người trong cuộc trò chuyện này sau thời gian được chọn.' })}
            </Text>
          </View>

          {/* Options */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 4 }}>
            {OPTIONS.map((opt) => {
              const isSelected = selectedDays === opt.days
              return (
                <TouchableOpacity
                  key={opt.days}
                  activeOpacity={0.7}
                  onPress={() => setSelectedDays(opt.days)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    marginVertical: 4,
                    borderRadius: 14,
                    backgroundColor: isSelected ? palette.selectedBg : (isDark ? '#232A34' : '#F8FAFC'),
                    borderWidth: 1,
                    borderColor: isSelected ? palette.selectedBorder : (isDark ? '#384457' : '#F1F5F9')
                  }}
                >
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    {opt.days > 0 ? (
                      <Ionicons
                        name='time-outline'
                        size={22}
                        color={isSelected ? palette.selectedBorder : palette.subText}
                        style={{ marginRight: 12 }}
                      />
                    ) : (
                      <Ionicons
                        name='close-circle-outline'
                        size={22}
                        color={isSelected ? palette.selectedBorder : palette.subText}
                        style={{ marginRight: 12 }}
                      />
                    )}
                    
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: isSelected ? '600' : '500',
                        color: isSelected ? palette.selectedBorder : palette.text
                      }}
                    >
                      {t(opt.labelKey)}
                    </Text>
                  </View>

                  {/* Radio */}
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: isSelected ? palette.radio : palette.radioEmpty,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: palette.radio
                        }}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Buttons */}
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 20,
              paddingTop: 12,
              gap: 12
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 23,
                backgroundColor: palette.btnCancel,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: palette.btnCancelText }}>
                {t('messages.disappearing.cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleSave}
              disabled={isPending}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 23,
                backgroundColor: palette.btnSave,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isPending ? 0.6 : 1
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: palette.btnSaveText }}>
                {isPending ? '...' : t('messages.disappearing.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
