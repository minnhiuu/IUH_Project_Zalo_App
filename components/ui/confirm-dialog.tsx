import React from 'react'
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'

export interface ConfirmDialogProps {
  /** Whether the dialog is visible */
  visible: boolean
  /** Optional title for the dialog */
  title?: string
  /** The main message content */
  message: string
  /** Text for the confirm button */
  confirmText?: string
  /** Text for the cancel button */
  cancelText?: string
  /** If true, the confirm button uses destructive (red) coloring */
  destructive?: boolean
  /** Callback fired when the confirm button is pressed */
  onConfirm: () => void
  /** Callback fired when the cancel button or backdrop is pressed */
  onCancel: () => void
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  return (
    <Modal transparent visible={visible} animationType='fade' onRequestClose={onCancel}>
      {/* Dimmed Backdrop */}
      <View className='flex-1 items-center justify-center px-6' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableWithoutFeedback onPress={onCancel}>
          <View className='absolute inset-0' />
        </TouchableWithoutFeedback>

        {/* Dialog Card */}
        <View className='w-full max-w-[340px] rounded-[24px] bg-background p-6 shadow-lg border border-border'>
          {title ? <Text className='text-[19px] font-bold text-foreground mb-3 text-center'>{title}</Text> : null}

          <Text className='text-base text-muted-foreground text-center mb-6 leading-6'>{message}</Text>

          {/* Action Buttons */}
          <View className='flex-row gap-3'>
            <TouchableOpacity
              activeOpacity={0.7}
              className='flex-1 py-3.5 rounded-xl bg-secondary items-center justify-center'
              onPress={onCancel}
            >
              <Text className='text-[15px] font-semibold text-foreground'>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              className={`flex-1 py-3.5 rounded-xl items-center justify-center ${
                destructive ? 'bg-destructive' : 'bg-primary'
              }`}
              onPress={onConfirm}
            >
              <Text
                className={`text-[15px] font-semibold ${
                  destructive ? 'text-destructive-foreground' : 'text-primary-foreground'
                }`}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
