import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { userApi } from "../api/user.api";
import { userKeys } from "./keys";
import { handleErrorApi } from "@/utils/error-handler";

/**
 * Mutation hook for updating user profile
 * PUT /users/{id}
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      userApi.updateProfile(id, data),
    onSuccess: (response) => {
      const userData = response.data.data;
      
      // Invalidate and refetch profile queries
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      queryClient.invalidateQueries({ queryKey: userKeys.byId(userData.id) });

      Toast.show({
        type: "success",
        text1: "Cập nhật thông tin thành công",
        visibilityTime: 2000,
      });
    },
    onError: (error: Error) => {
      handleErrorApi({ error });
    },
  });
};
