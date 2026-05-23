import { View, Text, TouchableOpacity, Modal, FlatList, ScrollView } from 'react-native'
import { X, AlertCircle, Flag, Laugh, Heart, ThumbsDown } from 'lucide-react-native'
import { useState } from 'react'

interface ReportDialogProps {
  visible: boolean
  postId?: string
  onClose: () => void
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam', icon: AlertCircle },
  { id: 'misleading', label: 'Thông tin sai lệch', icon: AlertCircle },
  { id: 'inappropriate', label: 'Nội dung không phù hợp', icon: Flag },
  { id: 'harassment', label: 'Qu騷rào', icon: Heart },
  { id: 'violence', label: 'Bạo lực', icon: AlertCircle },
  { id: 'other', label: 'Khác', icon: ThumbsDown },
]

export function ReportDialog({
  visible,
  postId,
  onClose
}: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [step, setStep] = useState<'reason' | 'confirm'>('reason')

  const handleSubmit = () => {
    if (selectedReason) {
      setStep('confirm')
    }
  }

  const handleReset = () => {
    setSelectedReason(null)
    setStep('reason')
  }

  return (
    <Modal
      visible={visible}
      animationType='slide'
      onRequestClose={() => {
        handleReset()
        onClose()
      }}
      transparent={false}
    >
      <View className='flex-1 bg-black'>
        {/* Header */}
        <View className='flex-row items-center justify-between p-4 border-b border-zinc-800'>
          <Text className='text-white font-bold text-lg'>Báo cáo bài viết</Text>
          <TouchableOpacity
            onPress={() => {
              handleReset()
              onClose()
            }}
          >
            <X size={24} color='white' />
          </TouchableOpacity>
        </View>

        {step === 'reason' ? (
          <>
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
              <View className='p-4'>
                <Text className='text-zinc-400 text-sm mb-4'>
                  Tại sao bạn muốn báo cáo bài viết này?
                </Text>

                {REPORT_REASONS.map((reason) => {
                  const Icon = reason.icon
                  return (
                    <TouchableOpacity
                      key={reason.id}
                      onPress={() => setSelectedReason(reason.id)}
                      className={`flex-row items-center gap-4 p-4 rounded-lg mb-2 ${
                        selectedReason === reason.id
                          ? 'bg-red-500/20 border border-red-500'
                          : 'bg-zinc-900 border border-zinc-800'
                      }`}
                    >
                      <Icon
                        size={24}
                        color={
                          selectedReason === reason.id ? '#ef4444' : '#71717a'
                        }
                      />
                      <Text
                        className={`text-sm font-medium ${
                          selectedReason === reason.id
                            ? 'text-red-500'
                            : 'text-zinc-300'
                        }`}
                      >
                        {reason.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </ScrollView>

            {/* Button */}
            <View className='p-4 border-t border-zinc-800 flex-row gap-3'>
              <TouchableOpacity
                onPress={() => {
                  handleReset()
                  onClose()
                }}
                className='flex-1 py-3 rounded-lg border border-zinc-700'
              >
                <Text className='text-white text-center font-semibold'>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!selectedReason}
                onPress={handleSubmit}
                className={`flex-1 py-3 rounded-lg ${
                  selectedReason ? 'bg-red-600' : 'bg-red-600/50'
                }`}
              >
                <Text className='text-white text-center font-semibold'>Tiếp</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View className='flex-1 justify-center items-center p-8'>
              <View className='w-16 h-16 rounded-full bg-green-500/20 items-center justify-center mb-4'>
                <Text className='text-4xl'>✓</Text>
              </View>
              <Text className='text-white font-bold text-xl text-center mb-2'>
                Cảm ơn bạn
              </Text>
              <Text className='text-zinc-400 text-center text-sm'>
                Chúng tôi sẽ xem xét báo cáo của bạn trong thời gian sớm nhất
              </Text>
            </View>

            {/* Button */}
            <View className='p-4 border-t border-zinc-800'>
              <TouchableOpacity
                onPress={() => {
                  handleReset()
                  onClose()
                }}
                className='py-3 rounded-lg bg-blue-500'
              >
                <Text className='text-white text-center font-semibold'>Xong</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  )
}
