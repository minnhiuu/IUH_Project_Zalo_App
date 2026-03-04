'use client';
import React from 'react';
import { Platform, View, ViewProps } from 'react-native';

type DividerOrientation = 'vertical' | 'horizontal';

type IDividerProps = ViewProps & {
  className?: string;
  orientation?: DividerOrientation;
};

const Divider = React.forwardRef<React.ComponentRef<typeof View>, IDividerProps>(
  function Divider({ className, orientation = 'horizontal', style, ...props }, ref) {
    const dividerStyle = {
      backgroundColor: '#e5e7eb',
      ...(orientation === 'vertical' ? { width: 1, height: '100%' } : { height: 1, width: '100%' }),
    };

    return (
      <View
        ref={ref}
        style={[dividerStyle, style]}
        aria-orientation={orientation}
        role={Platform.OS === 'web' ? 'separator' : undefined}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider };
