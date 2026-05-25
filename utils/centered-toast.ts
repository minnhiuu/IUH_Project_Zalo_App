import { Dimensions } from 'react-native'
import Toast from 'react-native-toast-message'
import type { CenteredToastVariant } from '@/components/common'

interface CenteredToastOptions {
  type?: CenteredToastVariant
  text1: string
  text2?: string
  visibilityTime?: number
}

export const showCenteredToast = ({
  type = 'error',
  text1,
  text2,
  visibilityTime = 2200
}: CenteredToastOptions) => {
  const message = text2 || text1

  Toast.show({
    type: 'centered',
    text1,
    text2: message,
    props: {
      variant: type
    },
    position: 'top',
    topOffset: Math.round(Dimensions.get('window').height * 0.42),
    visibilityTime
  })
}
