import React, { useState } from 'react'
import {
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Text } from '@/components/ui/text'
import { useTheme } from '@/context/theme-context'
import { useMyProfile } from '@/features/users/queries/use-queries'
import { useUpdateProfile, useUpdateAvatar } from '@/features/users/queries/use-mutations'
import { profileEditSchema } from '@/features/users/schemas/user.schema'
import { Gender } from '@/constants/enum'
import { format, parseISO } from 'date-fns'

export default function EditProfileScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isDark } = useTheme()

  const { data: myProfile, isLoading } = useMyProfile()
  const updateProfileMutation = useUpdateProfile()
  const updateAvatarMutation = useUpdateAvatar()

  const [fullName, setFullName] = useState(myProfile?.fullName || '')
  const [dob, setDob] = useState(myProfile?.dob || '')
  const [gender, setGender] = useState<Gender>(myProfile?.gender || Gender.Male)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [tempDate, setTempDate] = useState({ day: 1, month: 1, year: 2000 })
  const [errors, setErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (myProfile) {
      setFullName(myProfile.fullName)
      setDob(myProfile.dob)
      setGender(myProfile.gender)

      // Parse existing date for date picker
      if (myProfile.dob) {
        const date = parseISO(myProfile.dob)
        setTempDate({
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear()
        })
      }
    }
  }, [myProfile])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    })

    if (!result.canceled) {
      const uri = result.assets[0].uri
      const formData = new FormData()
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'avatar.jpg'
      } as any)

      updateAvatarMutation.mutate(formData)
    }
  }

  const handleDateConfirm = () => {
    const dateString = `${tempDate.year}-${String(tempDate.month).padStart(2, '0')}-${String(tempDate.day).padStart(2, '0')}`
    setDob(dateString)
    setShowDatePicker(false)
  }

  const handleSave = () => {
    try {
      // Validate using Zod
      profileEditSchema.parse({
        fullName,
        dob,
        gender
      })

      setErrors({})

      // Submit update
      updateProfileMutation.mutate(
        {
          fullName,
          dob,
          gender
        },
        {
          onSuccess: () => {
            router.back()
          }
        }
      )
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = t(err.message)
        })
        setErrors(newErrors)
      }
    }
  }

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ''
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy')
    } catch {
      return dateString
    }
  }

  if (isLoading || !myProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='#0068FF' />
      </View>
    )
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate()
  }

  const days = Array.from({ length: getDaysInMonth(tempDate.month, tempDate.year) }, (_, i) => i + 1)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121416' : '#F3F4F6' }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#0068FF' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name='arrow-back' size={24} color='#fff' />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', color: '#fff' }}>
            {t('profile.editProfile.title')}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ backgroundColor: isDark ? '#22262B' : '#fff', padding: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: 100, alignItems: 'flex-start', paddingTop: 8 }}>
              <TouchableOpacity onPress={pickImage} style={{ position: 'relative' }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: isDark ? '#2C323A' : '#E5E7EB',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {myProfile.avatar ? (
                    <Image
                      source={{ uri: myProfile.avatar }}
                      style={{ width: 80, height: 80, borderRadius: 40 }}
                    />
                  ) : (
                    <Ionicons name='person' size={50} color={isDark ? '#6B7280' : '#9CA3AF'} />
                  )}
                </View>
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: isDark ? '#22262B' : '#fff'
                  }}
                >
                  <Ionicons name='camera' size={16} color='#666' />
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              {/* Name Input */}
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#2C323A' : '#E5E7EB'
                  }}
                >
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder={t('profile.editProfile.fullName')}
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: isDark ? '#DFE2E7' : '#111827',
                      paddingVertical: 0,
                      paddingRight: 8
                    }}
                  />
                  <TouchableOpacity onPress={() => setFullName('')}>
                    <Ionicons name='pencil-outline' size={22} color={isDark ? '#B6C1CF' : '#6B7280'} />
                  </TouchableOpacity>
                </View>
                {errors.fullName && (
                  <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.fullName}</Text>
                )}
              </View>

              {/* Date Input */}
              <View style={{ marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#2C323A' : '#E5E7EB'
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: dob ? (isDark ? '#DFE2E7' : '#111827') : isDark ? '#6B7280' : '#9CA3AF',
                      paddingRight: 8
                    }}
                  >
                    {dob ? formatDisplayDate(dob) : t('profile.editProfile.dob')}
                  </Text>
                  <Ionicons name='pencil-outline' size={22} color={isDark ? '#B6C1CF' : '#6B7280'} />
                </TouchableOpacity>
                {errors.dob && <Text style={{ color: '#EF4444', fontSize: 13, marginTop: 4 }}>{errors.dob}</Text>}
              </View>

              {/* Gender Selection */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  gap: 40,
                  marginTop: 24
                }}
              >
                <TouchableOpacity
                  onPress={() => setGender(Gender.Male)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: gender === Gender.Male ? '#0068FF' : isDark ? '#6B7280' : '#D1D5DB',
                      backgroundColor: gender === Gender.Male ? '#0068FF' : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {gender === Gender.Male && <Ionicons name='checkmark' size={18} color='#fff' />}
                  </View>
                  <Text style={{ fontSize: 16, color: isDark ? '#DFE2E7' : '#111827' }}>
                    {t('profile.editProfile.male')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setGender(Gender.Female)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: gender === Gender.Female ? '#0068FF' : isDark ? '#6B7280' : '#D1D5DB',
                      backgroundColor: gender === Gender.Female ? '#0068FF' : 'transparent',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {gender === Gender.Female && <Ionicons name='checkmark' size={18} color='#fff' />}
                  </View>
                  <Text style={{ fontSize: 16, color: isDark ? '#DFE2E7' : '#111827' }}>
                    {t('profile.editProfile.female')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={updateProfileMutation.isPending}
          style={{
            marginTop: 40,
            marginBottom: 12,
            paddingVertical: 10,
            borderRadius: 25,
            backgroundColor: '#0068FF',
            alignItems: 'center'
          }}
        >
          {updateProfileMutation.isPending ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff', letterSpacing: 2 }}>
              {t('profile.editProfile.save')}
            </Text>
          )}
        </TouchableOpacity>
        </View>

        
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType='slide'>
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#22262B' : '#fff',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingBottom: Platform.OS === 'ios' ? 34 : 16
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#2C323A' : '#E5E7EB'
              }}
            >
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={{ fontSize: 16, color: '#0068FF' }}>{t('profile.editProfile.cancel')}</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: '600', color: isDark ? '#DFE2E7' : '#111827' }}>
                {t('profile.editProfile.selectDate')}
              </Text>
              <TouchableOpacity onPress={handleDateConfirm}>
                <Text style={{ fontSize: 16, color: '#0068FF', fontWeight: '600' }}>
                  {t('profile.editProfile.confirm')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Pickers */}
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 16,
                paddingVertical: 16
              }}
            >
              <ScrollView
                style={{ flex: 1, maxHeight: 200 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 80 }}
              >
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    onPress={() => setTempDate({ ...tempDate, day })}
                    style={{
                      paddingVertical: 12,
                      alignItems: 'center'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tempDate.day === day ? 18 : 16,
                        fontWeight: tempDate.day === day ? '600' : '400',
                        color:
                          tempDate.day === day
                            ? '#0068FF'
                            : isDark
                              ? '#DFE2E7'
                              : '#111827'
                      }}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView
                style={{ flex: 1, maxHeight: 200 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 80 }}
              >
                {months.map((month) => (
                  <TouchableOpacity
                    key={month}
                    onPress={() => setTempDate({ ...tempDate, month })}
                    style={{
                      paddingVertical: 12,
                      alignItems: 'center'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tempDate.month === month ? 18 : 16,
                        fontWeight: tempDate.month === month ? '600' : '400',
                        color:
                          tempDate.month === month
                            ? '#0068FF'
                            : isDark
                              ? '#DFE2E7'
                              : '#111827'
                      }}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView
                style={{ flex: 1, maxHeight: 200 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 80 }}
              >
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setTempDate({ ...tempDate, year })}
                    style={{
                      paddingVertical: 12,
                      alignItems: 'center'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tempDate.year === year ? 18 : 16,
                        fontWeight: tempDate.year === year ? '600' : '400',
                        color:
                          tempDate.year === year
                            ? '#0068FF'
                            : isDark
                              ? '#DFE2E7'
                              : '#111827'
                      }}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
