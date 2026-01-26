import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  useQrAcceptMutation,
  useQrRejectMutation,
} from "@/features/auth/queries/use-mutations";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QrConfirmScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const qrContent = params.qrContent as string;

  const [isChecked, setIsChecked] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const acceptMutation = useQrAcceptMutation();
  const rejectMutation = useQrRejectMutation();

  // Countdown timer
  useEffect(() => {
    let timer: any;
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showCountdown, countdown]);

  const handleStartLoginFlow = () => {
    if (!isChecked) return;
    setShowCountdown(true);
    setCountdown(5);
  };

  const handleConfirmLogin = () => {
    if (countdown > 0) return; // Prevent clicking during countdown

    acceptMutation.mutate(qrContent, {
      onSuccess: () => {
        // Stop countdown
        setShowCountdown(false);

        // Use dismiss to close the modal
        router.dismiss();

        // Navigate to the tabs with the success parameter
        router.navigate({
          pathname: "/(tabs)" as any,
          params: { qrLoginSuccess: "true" },
        });
      },
      onError: () => {
        setShowCountdown(false);
        setCountdown(5);
      },
    });
  };

  const handleReject = () => {
    rejectMutation.mutate(qrContent, {
      onSettled: () => {
        router.back();
      },
    });
  };

  const handleCancelCountdown = () => {
    setShowCountdown(false);
    setCountdown(5);
  };

  // Get current device info (Mock data for display)
  const browserInfo = "Chrome - Windows 11";
  const currentTime = new Date().toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const location = "Hồ Chí Minh, Việt Nam";

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView className="pb-10">
        {/* Header */}
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View className="items-center mt-5 mb-6">
          <View className="relative">
            <Ionicons name="desktop-outline" size={80} color="#999" />
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-9 h-9 items-center justify-center border-[3px] border-gray-50">
              <Ionicons name="warning" size={20} color="#fff" />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-center text-black px-6 mb-5 leading-7">
          {t("auth.qrScanner.confirmScreen.title", { appName: "BondHub" })}
        </Text>

        {/* Warning Box */}
        <View className="bg-red-50 mx-4 p-4 rounded-lg mb-6">
          <Text className="text-sm text-gray-800 leading-5 mb-2">
            {t("auth.qrScanner.confirmScreen.warningTitle")}
          </Text>
          <Text className="text-sm text-gray-800 leading-5">
            {/* Using raw text for bold part as i18n bold formatting depends on lib configuration */}
            Bấm <Text className="font-bold">{t("auth.qrScanner.reject")}</Text>{" "}
            nếu ai đó yêu cầu bạn đăng nhập bằng mã QR để bình chọn, trúng
            thưởng, nhận khuyến mãi,...
          </Text>
        </View>

        {/* Device Info */}
        <View className="bg-white mx-4 rounded-lg p-4 mb-6">
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-gray-600">
              {t("auth.qrScanner.confirmScreen.browser")}
            </Text>
            <Text className="text-sm text-black font-medium flex-1 text-right">
              {browserInfo}
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-gray-600">
              {t("auth.qrScanner.confirmScreen.time")}
            </Text>
            <Text className="text-sm text-black font-medium flex-1 text-right">
              {currentTime}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">
              {t("auth.qrScanner.confirmScreen.location")}
            </Text>
            <Text className="text-sm text-black font-medium flex-1 text-right">
              {location}
            </Text>
          </View>
        </View>

        {/* Checkbox */}
        <TouchableOpacity
          className="flex-row items-center px-4 mb-6"
          onPress={() => setIsChecked(!isChecked)}
          activeOpacity={0.7}
        >
          <View
            className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
              isChecked ? "bg-blue-600 border-blue-600" : "border-gray-400"
            }`}
          >
            {isChecked && <Ionicons name="checkmark" size={18} color="#fff" />}
          </View>
          <Text className="text-sm text-gray-800 flex-1 leading-5">
            {t("auth.qrScanner.confirmScreen.checkbox")}
          </Text>
        </TouchableOpacity>

        {/* Buttons */}
        <View className="px-4 gap-3">
          <TouchableOpacity
            className={`py-4 rounded-full items-center justify-center ${
              isChecked ? "bg-blue-600" : "bg-gray-300"
            }`}
            onPress={handleStartLoginFlow}
            disabled={!isChecked || acceptMutation.isPending}
          >
            <Text className="text-base font-bold text-white">
              {t("auth.qrScanner.accept")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 rounded-full items-center justify-center bg-gray-200"
            onPress={handleReject}
            disabled={rejectMutation.isPending}
          >
            <Text className="text-base font-bold text-black">
              {t("auth.qrScanner.reject")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Countdown Modal */}
      <Modal visible={showCountdown} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-[340px]">
            <Text className="text-lg font-bold text-black mb-3 text-center">
              {t("auth.qrScanner.modal.title")}
            </Text>
            <Text className="text-sm text-gray-600 leading-5 mb-6 text-center">
              {t("auth.qrScanner.modal.message")}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg items-center bg-gray-200"
                onPress={handleCancelCountdown}
              >
                <Text className="text-sm font-semibold text-black">
                  {t("auth.qrScanner.modal.back")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg items-center ${
                  countdown > 0 ? "bg-gray-300" : "bg-blue-600"
                }`}
                onPress={handleConfirmLogin}
                disabled={countdown > 0 || acceptMutation.isPending}
              >
                <Text className="text-sm font-semibold text-white">
                  {acceptMutation.isPending
                    ? t("common.loading")
                    : countdown > 0
                      ? `${t("auth.qrScanner.accept")} (${countdown})`
                      : t("auth.qrScanner.accept")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
