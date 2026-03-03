'use client';
import React from 'react';
import { View, Pressable, TextInput, TextInputProps, ViewProps, PressableProps } from 'react-native';

type IInputProps = ViewProps & {
  className?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
};

const Input = React.forwardRef<View, IInputProps>(
  function Input({ className, style, children, isDisabled, ...props }, ref) {
    return (
      <View
        ref={ref}
        style={[
          {
            height: 36,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#e5e7eb',
            backgroundColor: 'transparent',
            paddingHorizontal: 12,
            gap: 8,
          },
          isDisabled && { opacity: 0.5 },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }
);

type IInputIconProps = ViewProps & {
  className?: string;
  as?: React.ComponentType<any>;
  height?: number;
  width?: number;
};

const InputIcon = React.forwardRef<View, IInputIconProps>(
  function InputIcon({ className, as: AsComponent, style, ...props }, ref) {
    if (AsComponent) {
      return <AsComponent {...props} style={[{ width: 16, height: 16 }, style]} />;
    }
    return (
      <View
        ref={ref}
        style={[{
          justifyContent: 'center',
          alignItems: 'center',
          height: 16,
          width: 16,
        }, style]}
        {...props}
      />
    );
  }
);

type IInputSlotProps = PressableProps & {
  className?: string;
};

const InputSlot = React.forwardRef<View, IInputSlotProps>(
  function InputSlot({ className, style, ...props }, ref) {
    return (
      <Pressable
        ref={ref as any}
        style={(state) => [
          {
            justifyContent: 'center',
            alignItems: 'center',
          },
          typeof style === 'function' ? style(state) : style,
        ]}
        {...props}
      />
    );
  }
);

type IInputFieldProps = TextInputProps & {
  className?: string;
  type?: 'text' | 'password';
};

const InputField = React.forwardRef<TextInput, IInputFieldProps>(
  function InputField({ className, style, type, ...props }, ref) {
    return (
      <TextInput
        ref={ref}
        secureTextEntry={type === 'password'}
        style={[{
          flex: 1,
          fontSize: 14,
          paddingVertical: 4,
          height: '100%',
        }, style]}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
InputIcon.displayName = 'InputIcon';
InputSlot.displayName = 'InputSlot';
InputField.displayName = 'InputField';

export { Input, InputField, InputIcon, InputSlot };
