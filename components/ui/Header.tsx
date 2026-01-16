import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  centerComponent?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export function Header({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  leftComponent,
  rightComponent,
  centerComponent,
  transparent = false,
  className,
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`
        ${transparent ? '' : 'bg-white border-b border-border'}
        ${className || ''}
      `}
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between h-14 px-4">
        {/* Left */}
        <View className="flex-row items-center min-w-[60px]">
          {leftComponent ||
            (leftIcon && (
              <TouchableOpacity
                onPress={onLeftPress}
                className="p-2 -ml-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={leftIcon} size={24} color="#1A1A1A" />
              </TouchableOpacity>
            ))}
        </View>

        {/* Center */}
        <View className="flex-1 items-center">
          {centerComponent || (
            title && (
              <Text
                className="text-lg font-semibold text-text"
                numberOfLines={1}
              >
                {title}
              </Text>
            )
          )}
        </View>

        {/* Right */}
        <View className="flex-row items-center justify-end min-w-[60px]">
          {rightComponent ||
            (rightIcon && (
              <TouchableOpacity
                onPress={onRightPress}
                className="p-2 -mr-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={rightIcon} size={24} color="#1A1A1A" />
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </View>
  );
}

export default Header;
