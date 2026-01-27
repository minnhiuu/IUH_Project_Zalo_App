import http, { setAccessToken, setRefreshToken, clearTokens } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/apiConfig";
import { storage } from "@/utils/storageUtils";
import type {
  LoginPayload,
  AuthResponse,
  AuthTokens,
  TokenApiResponse,
  RegisterPayload,
  RegisterVerifyPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  QrGenerationResponse,
  QrStatusResponse,
  RegisterInitApiResponse,
} from "@/types/auth.types";
import { QrSessionStatus } from "@/types/auth.types";
import type { ApiResponse } from "@/types/common.types";
import type { User } from "@/types/user.types";

// Helper to transform BE response (now in camelCase)
const transformTokenResponse = (data: TokenApiResponse): AuthTokens => ({
  accessToken: data.accessToken || data.access_token, // Support both formats temporarily
  refreshToken: data.refreshToken || data.refresh_token,
  tokenType: data.tokenType || data.token_type || "Bearer",
  expiresIn: data.expiresIn || data.expires_in || 3600,
});

/**
 * Auth API - All authentication related API calls
 * Matches backend auth-service endpoints
 */
export const authApi = {
  /**
   * Login with email and password
   * POST /auth/login
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await http.post<ApiResponse<TokenApiResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload,
    );

    const tokens = transformTokenResponse(response.data.data);

    // Store tokens
    await setAccessToken(tokens.accessToken);
    await setRefreshToken(tokens.refreshToken);

    // Note: Backend doesn't return user in login response
    // User info should be fetched separately from /user/profile
    return { tokens };
  },

  /**
   * Register new user - Step 1: Initiate registration (2-step with OTP)
   * POST /auth/register
   * Backend will send OTP to email
   */
  register: async (
    payload: RegisterPayload,
  ): Promise<{ message: string; email: string }> => {
    const requestPayload = {
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber || null,
    };

    console.log(
      "Register request payload:",
      JSON.stringify(requestPayload, null, 2),
    );

    try {
      const response = await http.post<ApiResponse<RegisterInitApiResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        requestPayload,
      );

      console.log("Register response:", JSON.stringify(response.data, null, 2));

      return {
        message: response.data.data.message,
        email: response.data.data.email,
      };
    } catch (error: any) {
      console.error("Register error:", error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Register new user - Step 2: Verify OTP and complete
   * POST /auth/register/verify
   */
  registerVerify: async (
    payload: RegisterVerifyPayload,
  ): Promise<AuthResponse> => {
    console.log(
      "RegisterVerify request payload:",
      JSON.stringify(payload, null, 2),
    );

    try {
      const response = await http.post<ApiResponse<TokenApiResponse>>(
        API_ENDPOINTS.AUTH.REGISTER_VERIFY,
        payload,
      );

      console.log(
        "RegisterVerify response:",
        JSON.stringify(response.data, null, 2),
      );

      const tokens = transformTokenResponse(response.data.data);

      await setAccessToken(tokens.accessToken);
      await setRefreshToken(tokens.refreshToken);

      return { tokens };
    } catch (error: any) {
      console.error(
        "RegisterVerify error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  refreshToken: async (
    refreshToken: string,
    deviceId?: string,
  ): Promise<AuthTokens> => {
    const response = await http.post<ApiResponse<TokenApiResponse>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken, deviceId },
    );

    const tokens = transformTokenResponse(response.data.data);

    await setAccessToken(tokens.accessToken);
    await setRefreshToken(tokens.refreshToken);

    return tokens;
  },

  /**
   * Validate current token
   * GET /auth/validate?token=xxx
   */
  validateToken: async (token: string): Promise<boolean> => {
    try {
      const response = await http.get<ApiResponse<boolean>>(
        API_ENDPOINTS.AUTH.VALIDATE,
        { params: { token } },
      );
      return response.data.data;
    } catch {
      return false;
    }
  },

  /**
   * Logout user - call backend and clear local tokens
   * POST /auth/logout
   */
  logout: async (refreshToken?: string): Promise<void> => {
    try {
      if (refreshToken) {
        await http.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } catch (error) {
      console.warn(
        "[authApi] Logout API failed, clearing local tokens anyway:",
        error,
      );
    }

    await clearTokens();
    await storage.remove("user_data");
  },

  forgotPassword: async (
    payload: ForgotPasswordPayload,
  ): Promise<{ message: string; email: string }> => {
    console.log(
      "ForgotPassword request payload:",
      JSON.stringify(payload, null, 2),
    );

    try {
      const response = await http.post<
        ApiResponse<{ message: string; email: string; expires_in: number }>
      >(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, payload);

      console.log(
        "ForgotPassword response:",
        JSON.stringify(response.data, null, 2),
      );

      return {
        message: response.data.data.message,
        email: response.data.data.email,
      };
    } catch (error: any) {
      console.error(
        "ForgotPassword error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  /**
   * Reset password - Step 2: Reset with OTP
   * POST /auth/reset-password
   */
  resetPassword: async (
    payload: ResetPasswordPayload,
  ): Promise<AuthResponse> => {
    console.log(
      "ResetPassword request payload:",
      JSON.stringify(payload, null, 2),
    );

    try {
      const response = await http.post<ApiResponse<TokenApiResponse>>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        payload,
      );

      console.log(
        "ResetPassword response:",
        JSON.stringify(response.data, null, 2),
      );

      const tokens = transformTokenResponse(response.data.data);

      // Store tokens
      await setAccessToken(tokens.accessToken);
      await setRefreshToken(tokens.refreshToken);

      return { tokens };
    } catch (error: any) {
      console.error(
        "ResetPassword error:",
        error.response?.data || error.message,
      );
      throw error;
    }
  },

  /**
   * QR Login - Step 1: Scan QR Code
   * POST /auth/qr/scan
   */
  qrScan: async (qrContent: string): Promise<any> => {
    const response = await http.post<ApiResponse<any>>(
      API_ENDPOINTS.AUTH.QR.SCAN,
      { qrContent },
    );
    return response.data.data;
  },

  /**
   * QR Login - Step 2: User confirms login on mobile
   * POST /auth/qr/accept
   */
  qrAccept: async (qrContent: string): Promise<void> => {
    await http.post(API_ENDPOINTS.AUTH.QR.ACCEPT, { qrContent });
  },

  /**
   * QR Login - Step 3: User rejects login on mobile
   * POST /auth/qr/reject
   */
  qrReject: async (qrContent: string): Promise<void> => {
    await http.post(API_ENDPOINTS.AUTH.QR.REJECT, { qrContent });
  },

  /**
   * QR Login - Step 0: Generate QR (for mobile app login)
   */
  generateQr: async (): Promise<QrGenerationResponse> => {
    const response = await http.post<ApiResponse<QrGenerationResponse>>(
      API_ENDPOINTS.AUTH.QR.GENERATE,
    );
    return response.data.data;
  },

  /**
   * QR Login - Step 0.5: Wait for QR status (Long Polling)
   */
  waitQrStatus: async (
    qrId: string,
    expectedStatus: QrSessionStatus,
  ): Promise<QrStatusResponse> => {
    const response = await http.get<ApiResponse<QrStatusResponse>>(
      API_ENDPOINTS.AUTH.QR.WAIT(qrId),
      {
        params: { expectedStatus },
      },
    );
    return response.data.data;
  },

  /**
   * Get stored user data from local storage
   */
  getStoredUser: async (): Promise<User | null> => {
    return await storage.get<User>("user_data");
  },

  /**
   * Store user data locally
   */
  setStoredUser: async (user: User): Promise<void> => {
    await storage.set("user_data", user);
  },
};
