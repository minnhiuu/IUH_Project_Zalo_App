import http, { setAccessToken, setRefreshToken, clearTokens } from '@/lib/http';
import { API_ENDPOINTS } from '@/config/apiConfig';
import { storage } from '@/utils/storageUtils';
import type { 
  LoginPayload, 
  AuthResponse, 
  AuthTokens,
  TokenApiResponse,
  RegisterPayload,
  RegisterVerifyPayload,
} from '@/types/auth.types';
import type { ApiResponse } from '@/types/common.types';
import type { User } from '@/types/user.types';

// Response for register init step
interface RegisterInitApiResponse {
  message: string;
  email: string;
  expires_in: number;
}

// Helper to transform snake_case response to camelCase
const transformTokenResponse = (data: TokenApiResponse): AuthTokens => ({
  accessToken: data.access_token,
  refreshToken: data.refresh_token,
  tokenType: data.token_type,
  expiresIn: data.expires_in,
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
      payload
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
  register: async (payload: RegisterPayload): Promise<{ message: string; email: string }> => {
    const requestPayload = {
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber || null,
    };
    
    console.log('Register request payload:', JSON.stringify(requestPayload, null, 2));
    
    try {
      const response = await http.post<ApiResponse<RegisterInitApiResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        requestPayload
      );
      
      console.log('Register response:', JSON.stringify(response.data, null, 2));
      
      return {
        message: response.data.data.message,
        email: response.data.data.email,
      };
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Register new user - Step 2: Verify OTP and complete
   * POST /auth/register/verify
   */
  registerVerify: async (payload: RegisterVerifyPayload): Promise<AuthResponse> => {
    console.log('RegisterVerify request payload:', JSON.stringify(payload, null, 2));
    
    try {
      const response = await http.post<ApiResponse<TokenApiResponse>>(
        API_ENDPOINTS.AUTH.REGISTER_VERIFY,
        payload
      );
      
      console.log('RegisterVerify response:', JSON.stringify(response.data, null, 2));
      
      const tokens = transformTokenResponse(response.data.data);
      
      await setAccessToken(tokens.accessToken);
      await setRefreshToken(tokens.refreshToken);
      
      return { tokens };
    } catch (error: any) {
      console.error('RegisterVerify error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await http.post<ApiResponse<TokenApiResponse>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
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
        { params: { token } }
      );
      return response.data.data;
    } catch {
      return false;
    }
  },

  /**
   * Logout user - clear local tokens
   * Note: Backend may not have logout endpoint, just clear local storage
   */
  logout: async (): Promise<void> => {
    await clearTokens();
    await storage.remove('user_data');
  },

  /**
   * Get stored user data from local storage
   */
  getStoredUser: async (): Promise<User | null> => {
    return await storage.get<User>('user_data');
  },

  /**
   * Store user data locally
   */
  setStoredUser: async (user: User): Promise<void> => {
    await storage.set('user_data', user);
  },
};
