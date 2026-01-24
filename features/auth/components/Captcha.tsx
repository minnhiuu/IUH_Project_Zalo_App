import React, { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authI18n from '../i18n';

interface CaptchaProps {
  value: string;
  onValueChange: (value: string) => void;
  isValid?: boolean;
  language?: 'vi' | 'en';
}

const CAPTCHA_CODES = [
  'ABCD',
  'EFGH', 
  'IJKL',
  'MNOP',
  'QRST',
  'UVWX',
  'YZAB',
  'CDEF',
  '1234',
  '5678',
  '9012',
  'AB12',
  'CD34',
  'EF56',
  'GH78',
  'IJ90'
];

const Captcha: React.FC<CaptchaProps> = ({
  value,
  onValueChange,
  isValid = true,
  language = 'vi'
}) => {
  const [currentCode, setCurrentCode] = useState('');
  const { t } = authI18n;

  useEffect(() => {
    generateNewCode();
  }, []);

  const generateNewCode = () => {
    const randomIndex = Math.floor(Math.random() * CAPTCHA_CODES.length);
    const newCode = CAPTCHA_CODES[randomIndex];
    setCurrentCode(newCode);
    onValueChange(''); // Clear input when code changes
  };

  const handleRefresh = () => {
    generateNewCode();
    Alert.alert(
      t('login.refreshCaptcha'),
      language === 'vi' ? 'Mã xác minh mới đã được tạo' : 'New verification code generated'
    );
  };

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg px-3 py-3">
          {/* CAPTCHA Code Display */}
          <View className="bg-white border border-gray-300 rounded px-3 py-2 mr-3">
            <Text 
              style={{
                fontFamily: 'monospace',
                fontSize: 16,
                letterSpacing: 2,
                color: '#333',
                fontWeight: '600'
              }}
            >
              {currentCode}
            </Text>
          </View>

          {/* Refresh Button */}
          <Pressable
            onPress={handleRefresh}
            className="p-2"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="refresh" size={20} color="#666" />
          </Pressable>
        </View>
      </View>

      {/* Validation Message */}
      {!isValid && (
        <Text className="text-red-500 text-sm mt-1">
          {t('validation.captchaInvalid')}
        </Text>
      )}
    </View>
  );
};

export default Captcha;