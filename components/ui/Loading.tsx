import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

export function Loading({ size = 'large', color = '#0068FF', text }: LoadingProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size={size} color={color} />
      {text && <Text className="mt-3 text-text-secondary">{text}</Text>}
    </View>
  );
}

interface FullScreenLoadingProps extends LoadingProps {
  visible?: boolean;
  overlay?: boolean;
}

export function FullScreenLoading({
  visible = true,
  overlay = true,
  ...props
}: FullScreenLoadingProps) {
  if (!visible) return null;

  return (
    <View
      className={`
        absolute inset-0 items-center justify-center z-50
        ${overlay ? 'bg-black/30' : 'bg-white'}
      `}
    >
      <View className="bg-white rounded-2xl p-6 shadow-lg">
        <Loading {...props} />
      </View>
    </View>
  );
}

interface InlineLoadingProps {
  text?: string;
}

export function InlineLoading({ text = 'Loading...' }: InlineLoadingProps) {
  return (
    <View className="flex-row items-center justify-center py-4">
      <ActivityIndicator size="small" color="#0068FF" />
      <Text className="ml-2 text-text-secondary">{text}</Text>
    </View>
  );
}

export default Loading;
