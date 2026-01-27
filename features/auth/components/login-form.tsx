import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Application from 'expo-application';

import { useLoginMutation } from '../queries';

const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate: login, isPending } = useLoginMutation();

  // Form state
  const [activeTab, setActiveTab] = useState<'email' | 'qr'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Refs
  const passwordRef = useRef<TextInput>(null);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {};
    
    if (!email.trim()) {
      newErrors.email = t('auth.validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('auth.validation.emailInvalid');
    }
    
    if (!password.trim()) {
      newErrors.password = t('auth.validation.passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('auth.validation.passwordMinLength');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, t]);

  // Handle login
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;
    
    // Get device ID based on platform
    let deviceId = 'device-' + Date.now();
    try {
      if (Platform.OS === 'ios') {
        const iosId = await Application.getIosIdForVendorAsync();
        deviceId = iosId || 'ios-' + Date.now();
      } else {
        // Only call getAndroidId on Android
        const androidModule = Application as any;
        if (typeof androidModule.getAndroidId === 'function') {
          deviceId = androidModule.getAndroidId() || 'android-' + Date.now();
        }
      }
    } catch (error) {
      console.warn('Failed to get device ID:', error);
      deviceId = `${Platform.OS}-${Date.now()}`;
    }
    
    login({
      email: email.trim(),
      password,
      deviceId,
      deviceType: 'MOBILE', // Backend only accepts WEB or MOBILE
    });
  }, [validateForm, login, email, password]);

  // Handle login without password (OTP)
  const handleLoginWithoutPassword = useCallback(() => {
    if (!email.trim()) {
      setErrors({ email: t('auth.validation.emailRequired') });
      return;
    }
    
    Toast.show({
      type: 'info',
      text1: t('auth.login.otpSent'),
      text2: t('auth.login.checkPhone'),
    });
  }, [email, t]);

  // Render Email Tab Content
  const renderEmailTab = () => (
    <View className="flex-1 px-4">
      {/* Email Input */}
      <View className="mb-3">
        <View 
          className={`flex-row items-center bg-gray-100 rounded-full px-4 h-12 ${
            errors.email ? 'border border-red-500' : ''
          }`}
        >
          <Ionicons name="mail-outline" size={20} color="#666" />
          <TextInput
            placeholder={t('auth.login.emailPlaceholder')}
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            className="flex-1 text-base text-gray-800 ml-3"
          />
        </View>
        {errors.email && (
          <Text className="text-red-500 text-xs mt-1 ml-4">{errors.email}</Text>
        )}
      </View>

      {/* Password Input */}
      <View className="mb-6">
        <View 
          className={`flex-row items-center bg-gray-100 rounded-full px-4 h-12 ${
            errors.password ? 'border border-red-500' : ''
          }`}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#666" />
          <TextInput
            ref={passwordRef}
            placeholder={t('auth.login.passwordPlaceholder')}
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
            }}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            className="flex-1 text-base text-gray-800 ml-3"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            className="pl-2"
          >
            <Text className="text-gray-500 text-sm">
              {showPassword ? t('auth.login.hide') : t('auth.login.show')}
            </Text>
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text className="text-red-500 text-xs mt-1 ml-4">{errors.password}</Text>
        )}
      </View>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={isPending}
        className={`h-12 rounded-full justify-center items-center mb-4 ${
          isPending ? 'bg-blue-300' : 'bg-[#0068FF]'
        }`}
        activeOpacity={0.8}
      >
        {isPending ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-sm">
            {t('auth.login.loginWithPassword')}
          </Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-gray-500 text-sm">{t('auth.login.or')}</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      {/* Login without Password Button */}
      <TouchableOpacity
        onPress={handleLoginWithoutPassword}
        className="h-12 rounded-full justify-center items-center border-2 border-gray-800 mb-6"
        activeOpacity={0.8}
      >
        <Text className="text-gray-800 font-bold text-sm">
          {t('auth.login.loginWithoutPassword')}
        </Text>
      </TouchableOpacity>

      {/* Links */}
      <View className="gap-y-3">
        <TouchableOpacity 
          onPress={() => {
            router.push('/auth/forgot-password' as any);
          }}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-[#0068FF] text-sm">{t('auth.login.forgotPassword')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'Coming soon',
              text2: 'Facebook login will be available soon',
            });
          }}
          activeOpacity={0.6}
        >
          <Ionicons name="logo-facebook" size={18} color="#1877f2" />
          <Text className="text-[#0068FF] text-sm ml-2">{t('auth.login.loginWithFacebook')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render QR Tab Content
  const renderQRTab = () => (
    <View className="flex-1 items-center justify-center px-5 py-10">
      <View className="w-48 h-48 bg-white border-2 border-gray-200 rounded-xl items-center justify-center mb-6">
        <Ionicons name="qr-code" size={120} color="#333" />
      </View>
      <Text className="text-gray-600 text-center text-base px-6 leading-6">
        {t('auth.login.qrInstruction')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          {/* Logo */}
          <View className="items-center pt-8 pb-4">
            <Text 
              className="text-[#0068FF]"
              style={{ 
                fontSize: 42, 
                fontWeight: 'bold', 
                fontStyle: 'italic',
              }}
            >
              Zalo
            </Text>
          </View>

          {/* Tab Navigation */}
          <View className="flex-row mx-4 mb-4 border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setActiveTab('email')}
              className={`flex-1 py-3 ${
                activeTab === 'email' ? 'border-b-2 border-[#0068FF]' : ''
              }`}
            >
              <Text 
                className={`text-center font-semibold text-xs ${
                  activeTab === 'email' ? 'text-[#0068FF]' : 'text-gray-500'
                }`}
              >
                {t('auth.login.emailTab')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveTab('qr')}
              className={`flex-1 py-3 ${
                activeTab === 'qr' ? 'border-b-2 border-[#0068FF]' : ''
              }`}
            >
              <Text 
                className={`text-center font-semibold text-xs ${
                  activeTab === 'qr' ? 'text-[#0068FF]' : 'text-gray-500'
                }`}
              >
                {t('auth.login.qrTab')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'email' ? renderEmailTab() : renderQRTab()}

          {/* Register Link */}
          <View className="flex-row justify-center items-center py-6 mt-auto">
            <Text className="text-gray-600 text-sm">
              {t('auth.login.noAccount')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
              <Text className="text-[#0068FF] text-sm font-semibold ml-1">
                {t('auth.login.register')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginForm;
