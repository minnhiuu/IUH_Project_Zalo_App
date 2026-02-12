'use client';
import React from 'react';
import { Pressable as RNPressable, PressableProps, StyleProp, ViewStyle } from 'react-native';

type IPressableProps = PressableProps & {
  className?: string;
};

const Pressable = React.forwardRef<
  React.ComponentRef<typeof RNPressable>,
  IPressableProps
>(function Pressable({ className, style, disabled, ...props }, ref) {
  return (
    <RNPressable
      {...props}
      ref={ref}
      disabled={disabled}
      // Fix lỗi ở đây: Kiểm tra nếu style là function thì gọi function đó
      style={(state) => [
        typeof style === 'function' ? style(state) : style,
        disabled && { opacity: 0.4 },
      ]}
    />
  );
});

Pressable.displayName = 'Pressable';
export { Pressable };