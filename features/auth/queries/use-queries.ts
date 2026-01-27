import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api";
import { authKeys } from "./keys";
import type { QrSessionStatus } from "../schemas";


export const useWaitQrStatusQuery = (
  qrId: string,
  expectedStatus: QrSessionStatus,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: authKeys.waitQrStatus(qrId, expectedStatus),
    queryFn: async () => {
      const res = await authApi.waitQrStatus(qrId, expectedStatus);
      return res.data.data;
    },
    enabled,
    staleTime: 0,
    retry: false,
    gcTime: 0, 
  });
};

export const useQrStatusQuery = (qrId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: authKeys.qrStatus(qrId),
    queryFn: () => authApi.getQrStatus(qrId),
    enabled,
    refetchInterval: enabled ? 2000 : false,
    staleTime: 0,
  });
};

