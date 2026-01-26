import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  useQrScanMutation,
  useQrAcceptMutation,
  useQrRejectMutation,
} from "@/features/auth/queries/use-mutations";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

export default function QrScanScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrId, setQrId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [torch, setTorch] = useState(false);

  const scanMutation = useQrScanMutation();
  const acceptMutation = useQrAcceptMutation();
  const rejectMutation = useQrRejectMutation();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const processQrData = (data: string) => {
    if (scanned) return;

    // Send the entire QR content to backend (BE will handle prefix extraction)
    setScanned(true);
    setQrId(data);

    // Notify backend that QR is scanned
    scanMutation.mutate(data, {
      onSuccess: () => {
        // Navigate to confirmation screen
        router.replace({
          pathname: "/qr-confirm",
          params: { qrContent: data },
        });
      },
      onError: () => {
        Alert.alert(t("common.error"), t("auth.qrScanner.invalidQr"));
        setScanned(false);
      },
    });
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    processQrData(data);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      // Thực tế cần dùng một thư viện scanner cho ảnh, nhưng Expo CameraView
      // chủ yếu hỗ trợ quét trực tiếp từ camera. Tạm thời thông báo tính năng.
      Alert.alert("Thông báo", "Tính năng quét từ ảnh đang được cập nhật");
    }
  };

  const handleAccept = () => {
    if (qrId) {
      acceptMutation.mutate(qrId, {
        onSuccess: () => {
          setShowConfirmModal(false);
          router.back();
        },
      });
    }
  };

  const handleReject = () => {
    if (qrId) {
      rejectMutation.mutate(qrId, {
        onSettled: () => {
          setShowConfirmModal(false);
          setScanned(false);
          setQrId(null);
        },
      });
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          {t("auth.qrScanner.permissionMessage")}
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Cấp quyền máy ảnh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("auth.qrScanner.title")}</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.scanAreaContainer}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instructionText}>
            {t("auth.qrScanner.scanInstruction")}
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerAction} onPress={pickImage}>
            <Ionicons name="image-outline" size={24} color="white" />
            <Text style={styles.footerActionText}>Chọn ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.footerAction}
            onPress={() => setTorch(!torch)}
          >
            <Ionicons
              name={torch ? "flashlight" : "flashlight-outline"}
              size={24}
              color={torch ? "#FFD60A" : "white"}
            />
            <Text style={styles.footerActionText}>
              {torch ? "Tắt đèn" : "Bật đèn"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal visible={showConfirmModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name="desktop-outline" size={40} color="#0068FF" />
              </View>
              <Text style={styles.modalTitle}>
                {t("auth.qrScanner.confirmTitle")}
              </Text>
              <Text style={styles.modalMessage}>
                {t("auth.qrScanner.confirmMessage")}
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.acceptButton]}
                onPress={handleAccept}
                disabled={acceptMutation.isPending}
              >
                <Text style={styles.acceptButtonText}>
                  {acceptMutation.isPending
                    ? "Đang thực hiện..."
                    : t("auth.qrScanner.accept")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={handleReject}
                disabled={acceptMutation.isPending}
              >
                <Text style={styles.rejectButtonText}>
                  {t("auth.qrScanner.reject")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", justifyContent: "center" },
  message: {
    textAlign: "center",
    color: "white",
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  overlay: { flex: 1, justifyContent: "space-between" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backButton: { padding: 4 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600" },
  scanAreaContainer: { alignItems: "center", justifyContent: "center" },
  scanArea: { width: 250, height: 250, position: "relative" },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#0068FF",
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  instructionText: {
    color: "white",
    marginTop: 30,
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: "hidden",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 40,
  },
  footerAction: { alignItems: "center", minWidth: 80 },
  footerActionText: { color: "white", fontSize: 12, marginTop: 6 },
  button: {
    backgroundColor: "#0068FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  modalHeader: { alignItems: "center", marginBottom: 24 },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#F0F7FF",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#000" },
  modalMessage: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  modalActions: { width: "100%", gap: 12 },
  modalButton: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  acceptButton: { backgroundColor: "#0068FF" },
  acceptButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  rejectButton: { backgroundColor: "#F2F2F7" },
  rejectButtonText: { color: "#FF3B30", fontWeight: "bold", fontSize: 16 },
});
