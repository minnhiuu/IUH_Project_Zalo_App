import { useQuery } from "@tanstack/react-query";
import { userKeys } from "./keys";
import { userApi } from "../api/user.api";

/**
 * Query hook for fetching current user profile
 * GET /users/me
 */
export const useMyProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const response = await userApi.getMyProfile();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Query hook for fetching user by ID
 * GET /users/{id}
 */
export const useUserById = (id: string) => {
  return useQuery({
    queryKey: userKeys.byId(id),
    queryFn: async () => {
      const response = await userApi.getUserById(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
