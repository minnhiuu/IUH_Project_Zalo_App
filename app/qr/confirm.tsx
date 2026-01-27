import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  useQrAcceptMutation,
  useQrRejectMutation,
} from "@/features/auth/queries/use-mutations";
import { useWaitQrStatusQuery } from "@/features/auth/queries/use-queries";
import { QrSessionStatus } from "@/features/auth/schemas";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Box,
  VStack,
  HStack,
  Center,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ButtonText,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  Heading,
} from "@gluestack-ui/themed";

export default function QrConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const qrContent = params.qrContent as string;
  const expiresAt = params.expiresAt as string;

  const qrId = qrContent;

  const [isChecked, setIsChecked] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isExpired, setIsExpired] = useState(false);

  const acceptMutation = useQrAcceptMutation();
  const rejectMutation = useQrRejectMutation();

  const { data: statusData, refetch: refetchStatus } = useWaitQrStatusQuery(
    qrId,
    QrSessionStatus.Confirmed,
    !!qrId && !isExpired && !showCountdown,
  );

  useEffect(() => {
    if (!statusData || isExpired) return;
    if (statusData.status === QrSessionStatus.Rejected) {
      router.back();
    } else if (statusData.status === QrSessionStatus.Scanned) {
      refetchStatus();
    }
  }, [statusData, router, isExpired, refetchStatus]);

  useEffect(() => {
    if (!expiresAt) return;
    const expiryTime = new Date(expiresAt).getTime();
    const checkExpiry = () => {
      const now = new Date().getTime();
      if (now >= expiryTime) {
        setIsExpired(true);
        return true;
      }
      return false;
    };
    if (checkExpiry()) return;
    const timer = setInterval(() => {
      if (checkExpiry()) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

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
    if (countdown > 0) return;
    acceptMutation.mutate({qrContent: qrContent}, {
      onSuccess: () => {
        setShowCountdown(false);
        router.dismiss();
        router.navigate({
          pathname: "/(tabs)" as any,
          params: { qrLoginSuccess: "true" },
        });
      },
      onError: (error: any) => {
        setShowCountdown(false);
        setCountdown(5);
        if (error?.response?.data?.code === "AUTH_005") setIsExpired(true);
      },
    });
  };

  const handleReject = () => {
    rejectMutation.mutate({qrContent: qrContent}, {
      onSettled: () => router.back(),
    });
  };

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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white" }}
      edges={["top", "bottom"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header spacer */}
        <Box height={56} justifyContent="center" px="$4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </Box>

        {/* Monitor Icon Section */}
        <Center mt="$4">
          <Box
            width={208}
            height={160}
            bg="#F8F9FA"
            rounded="$xl"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            <Box
              width={144}
              height={96}
              bg="$white"
              borderWidth={1}
              borderColor="#E9EAED"
              rounded="$lg"
              alignItems="center"
              justifyContent="center"
              position="relative"
            >
              <Center
                width="$12"
                height="$12"
                rounded="$full"
                borderWidth={1}
                borderColor="#E9EAED"
              >
                <Ionicons name="globe-outline" size={28} color="#D12323" />
              </Center>
              {/* Stand */}
              <Box
                position="absolute"
                bottom={-16}
                width="$8"
                height="$4"
                bg="#E9EAED"
                rounded="$sm"
                alignSelf="center"
              />
              <Box
                position="absolute"
                bottom={-20}
                width="$16"
                height="$1"
                bg="#D1D3D6"
                rounded="$full"
                alignSelf="center"
              />
            </Box>
            {/* Alert Badge */}
            <Center
              position="absolute"
              top="$2"
              right="$4"
              bg="#D12323"
              width="$7"
              height="$7"
              rounded="$full"
              borderWidth={2}
              borderColor="#F8F9FA"
            >
              <Ionicons name="warning" size={14} color="white" />
            </Center>
          </Box>
        </Center>

        {/* Title */}
        <Box px="$10" mt="$8">
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
              color: "#0F172A",
              lineHeight: 28,
            }}
          >
            Đăng nhập Zalo Web bằng mã QR trên thiết bị lạ?
          </Text>
        </Box>

        {/* Security Warning Box */}
        <Box mx="$6" mt="$6" p="$4" bg="#FFEBEB" rounded="$lg">
          <Text
            style={{
              fontSize: 14,
              color: "#334155",
              lineHeight: 20,
              marginBottom: 12,
            }}
          >
            Tài khoản có thể bị chiếm đoạt nếu đây không phải thiết bị của bạn.
          </Text>
          <Text style={{ fontSize: 14, color: "#334155", lineHeight: 20 }}>
            Bấm <Text style={{ fontWeight: "bold" }}>Từ chối</Text> nếu ai đó
            yêu cầu bạn đăng nhập bằng mã QR để bình chọn, trúng thưởng, nhận
            khuyến mãi,...
          </Text>
        </Box>

        {/* Details Section */}
        <VStack px="$6" mt="$8" space="md">
          <HStack>
            <Text style={{ fontSize: 14, color: "#64748B", width: 112 }}>
              Trình duyệt:
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#0F172A",
                fontWeight: "bold",
                flex: 1,
              }}
            >
              {browserInfo}
            </Text>
          </HStack>
          <HStack>
            <Text style={{ fontSize: 14, color: "#64748B", width: 112 }}>
              Thời gian:
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#0F172A",
                fontWeight: "bold",
                flex: 1,
              }}
            >
              {currentTime}
            </Text>
          </HStack>
          <HStack>
            <Text style={{ fontSize: 14, color: "#64748B", width: 112 }}>
              Địa điểm:
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#0F172A",
                fontWeight: "bold",
                flex: 1,
              }}
            >
              {location}
            </Text>
          </HStack>
        </VStack>
      </ScrollView>

      {/* Footer */}
      <Box
        px="$6"
        pb="$6"
        bg="$white"
        pt="$2"
        borderTopWidth={1}
        borderTopColor="$secondary100"
      >
        <Checkbox
          size="md"
          value="confirmed"
          isChecked={isChecked}
          onChange={(checked) => setIsChecked(checked)}
          aria-label="Confirm security"
          mb="$6"
          mt="$2"
        >
          <CheckboxIndicator mr="$3">
            <CheckboxIcon>
              <Ionicons name="checkmark" size={12} color="white" />
            </CheckboxIcon>
          </CheckboxIndicator>
          <CheckboxLabel
            style={{ color: "#334155", fontSize: 14, lineHeight: 20, flex: 1 }}
          >
            Tôi đã kiểm tra kỹ thông tin và xác nhận đây là thiết bị của tôi
          </CheckboxLabel>
        </Checkbox>

        {/* Action Buttons */}
        <VStack space="sm">
          <Button
            onPress={handleStartLoginFlow}
            isDisabled={!isChecked}
            size="lg"
            rounded="$full"
            bg={isChecked ? "#004BB9" : "$secondary300"}
            height={56}
          >
            <ButtonText
              color={isChecked ? "$white" : "$secondary500"}
              fontWeight="$bold"
            >
              Đăng nhập
            </ButtonText>
          </Button>

          <Button
            onPress={handleReject}
            size="lg"
            rounded="$full"
            variant="solid"
            bg="$secondary100"
            height={56}
          >
            <ButtonText color="#0F172A" fontWeight="$bold">
              Từ chối
            </ButtonText>
          </Button>
        </VStack>
      </Box>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showCountdown}
        onClose={() => setShowCountdown(false)}
        size="md"
      >
        <ModalBackdrop />
        <ModalContent p="$6" rounded="$2xl" maxWidth={340}>
          <ModalHeader p="$0" mb="$3">
            <Heading size="md" fontWeight="$bold" color="#0F172A">
              Đăng nhập trên thiết bị lạ?
            </Heading>
          </ModalHeader>
          <ModalBody p="$0" mb="$8">
            <Text style={{ fontSize: 14, color: "#64748B", lineHeight: 24 }}>
              Bạn hãy luôn thận trọng khi đăng nhập bằng mã QR để tránh bị chiếm
              đoạt tài khoản
            </Text>
          </ModalBody>
          <ModalFooter p="$0" justifyContent="flex-end">
            <HStack space="xl">
              <TouchableOpacity onPress={() => setShowCountdown(false)}>
                <Text style={{ fontWeight: "bold", color: "#0F172A" }}>
                  Quay lại
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmLogin}
                disabled={countdown > 0 || acceptMutation.isPending}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    color: countdown > 0 ? "#94A3B8" : "#0068FF",
                  }}
                >
                  Đăng nhập {countdown > 0 ? `(${countdown})` : ""}
                </Text>
              </TouchableOpacity>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Expiration Modal */}
      <Modal isOpen={isExpired} onClose={() => router.back()} size="md">
        <ModalBackdrop />
        <ModalContent p="$8" rounded="$2xl" alignItems="center">
          <Center bg="#FFEBEB" p="$4" rounded="$full" mb="$4">
            <Ionicons name="time-outline" size={48} color="#D12323" />
          </Center>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#0F172A",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Mã QR hết hạn
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#64748B",
              marginBottom: 32,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Mã QR đã hết hạn, vui lòng tải lại mã mới trên thiết bị của bạn.
          </Text>
          <Button
            width="$full"
            py="$4"
            bg="$primary600"
            rounded="$xl"
            onPress={() => router.back()}
          >
            <ButtonText fontWeight="$bold">Quay lại</ButtonText>
          </Button>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
