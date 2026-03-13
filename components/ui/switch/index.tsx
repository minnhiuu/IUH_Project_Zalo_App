'use client';
import React from 'react';
import { Switch as RNSwitch, SwitchProps } from 'react-native';

type SwitchSize = 'sm' | 'md' | 'lg';

type ISwitchProps = Omit<SwitchProps, 'disabled'> & {
  size?: SwitchSize;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  isHovered?: boolean;
  defaultValue?: boolean;
  onToggle?: (value: boolean) => void;
};

const Switch = React.forwardRef<RNSwitch, ISwitchProps>(
  function Switch({ 
    size = 'md', 
    isDisabled = false,
    defaultValue,
    onToggle,
    onValueChange,
    ...props 
  }, ref) {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? false);
    
    const handleValueChange = (value: boolean) => {
      setInternalValue(value);
      onValueChange?.(value);
      onToggle?.(value);
    };

    const getScaleTransform = () => {
      switch (size) {
        case 'sm':
          return [{ scale: 0.75 }];
        case 'lg':
          return [{ scale: 1.25 }];
        case 'md':
        default:
          return [];
      }
    };

    return (
      <RNSwitch
        ref={ref}
        disabled={isDisabled}
        value={props.value ?? internalValue}
        onValueChange={handleValueChange}
        {...props}
        style={[
          props.style,
          { transform: getScaleTransform() },
        ]}
      />
    );
  }
);

Switch.displayName = 'Switch';
export { Switch };
