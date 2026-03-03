import { tva } from '@gluestack-ui/nativewind-utils';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
const baseStyle = isWeb ? 'flex flex-col relative z-0' : '';

export const cardStyle = tva({
  base: `${baseStyle} flex-col bg-card border border-border rounded-xl shadow-sm`,
  variants: {
    size: {
      default: 'p-4 gap-6',
      sm: 'p-3 gap-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});
