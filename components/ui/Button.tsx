import React from 'react';
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
} from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary active:bg-primary-600',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-secondary active:bg-secondary-dark',
    text: 'text-white',
  },
  outline: {
    container: 'bg-transparent border border-primary active:bg-primary-50',
    text: 'text-primary',
  },
  ghost: {
    container: 'bg-transparent active:bg-gray-100',
    text: 'text-primary',
  },
  danger: {
    container: 'bg-error active:bg-red-600',
    text: 'text-white',
  },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string }> = {
  sm: {
    container: 'px-3 py-2 rounded-lg',
    text: 'text-sm',
  },
  md: {
    container: 'px-4 py-3 rounded-xl',
    text: 'text-base',
  },
  lg: {
    container: 'px-6 py-4 rounded-xl',
    text: 'text-lg',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`
        flex-row items-center justify-center
        ${variantStyles[variant].container}
        ${sizeStyles[size].container}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
        ${className || ''}
      `}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#0068FF' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text
            className={`
              font-semibold
              ${variantStyles[variant].text}
              ${sizeStyles[size].text}
            `}
          >
            {children}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}

export default Button;
