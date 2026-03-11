import React, { useState } from 'react'
import { View, TextInput, TouchableOpacity, Switch, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { useTheme } from '@/context/theme-context'
import { useMyProfile } from '@/features/users/queries/use-queries'
import { useUpdateBio } from '@/features/users/queries/use-mutations'

const MAX_BIO_LENGTH = 100

export default function EditBioScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isDark } = useTheme()
  const { data: myProfile } = useMyProfile()
  const updateBio = useUpdateBio()

  const [bio, setBio] = useState(myProfile?.bio || '')
  const [shareToJournal, setShareToJournal] = useState(false)

  const handleSave = () => {
    updateBio.mutate(
      bio,
      {
        onSuccess: () => {
          router.back()
        }
      }
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121416' : '#F3F4F6' }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: isDark ? '#22262B' : '#fff',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#2C323A' : '#E5E7EB'
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name='chevron-back' size={24} color={isDark ? '#DFE2E7' : '#111827'} />
          </TouchableOpacity>

          <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#DFE2E7' : '#111827' }}>
            {t('profile.editBio.title')}
          </Text>

          <TouchableOpacity 
            onPress={handleSave} 
            disabled={updateBio.isPending}
            style={{ padding: 4, opacity: updateBio.isPending ? 0.5 : 1 }}
          >
            {updateBio.isPending ? (
              <ActivityIndicator size='small' color='#0068FF' />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#0068FF' }}>
                {t('common.save').toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Bio Input Section */}
            <View style={{ backgroundColor: isDark ? '#22262B' : '#fff', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
              <TextInput
                value={bio}
                onChangeText={(text) => {
                  if (text.length <= MAX_BIO_LENGTH) {
                    setBio(text)
                  }
                }}
                placeholder={t('profile.editBio.placeholder')}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                multiline
                textAlignVertical='top'
                maxLength={MAX_BIO_LENGTH}
                style={{
                  fontSize: 15,
                  color: isDark ? '#DFE2E7' : '#111827',
                  minHeight: 120,
                  lineHeight: 22,
                  paddingVertical: 0
                }}
              />

              {/* Character Counter */}
              <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
                <Text style={{ fontSize: 13, color: isDark ? '#6B7280' : '#9CA3AF' }}>
                  {t('profile.editBio.characterCount', { current: bio.length, max: MAX_BIO_LENGTH })}
                </Text>
              </View>
            </View>

            {/* Share to Journal Section */}
            <View
              style={{
                backgroundColor: isDark ? '#22262B' : '#fff',
                marginTop: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isDark ? '#2C323A' : '#F3F4F6',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Ionicons name='document-text-outline' size={18} color={isDark ? '#B6C1CF' : '#6B7280'} />
                </View>
                <Text style={{ fontSize: 15, color: isDark ? '#DFE2E7' : '#111827' }}>
                  {t('profile.editBio.shareToJournal')}
                </Text>
              </View>

              <Switch
                value={shareToJournal}
                onValueChange={setShareToJournal}
                trackColor={{ false: isDark ? '#3E444A' : '#D1D5DB', true: '#0068FF' }}
                thumbColor='#fff'
                ios_backgroundColor={isDark ? '#3E444A' : '#D1D5DB'}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}
