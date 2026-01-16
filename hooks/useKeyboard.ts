import { useCallback, useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';

interface UseKeyboardReturn {
  keyboardVisible: boolean;
  keyboardHeight: number;
  dismissKeyboard: () => void;
}

export const useKeyboard = (): UseKeyboardReturn => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const handleKeyboardShow = (event: KeyboardEvent) => {
      setKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);
    };

    const handleKeyboardHide = () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  return {
    keyboardVisible,
    keyboardHeight,
    dismissKeyboard,
  };
};

export default useKeyboard;
