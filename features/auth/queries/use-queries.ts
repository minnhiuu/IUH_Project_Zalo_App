import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api";
import { authKeys } from "./keys";
import { QrSessionStatus } from "@/types/auth.types";

/**
 * QR Login - Wait for QR status (used on confirm screen)
 */
export const useWaitQrStatusQuery = (
  qrId: string,
  expectedStatus: QrSessionStatus,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: authKeys.waitQrStatus(qrId, expectedStatus),
    queryFn: () => authApi.waitQrStatus(qrId, expectedStatus),
    enabled,
    staleTime: 0,
    retry: false,
  });
};
