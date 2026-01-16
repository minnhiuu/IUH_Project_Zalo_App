import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import apiConfig from './apiConfig';

const axiosInstance = axios.create({
  baseURL: apiConfig.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors & token refresh
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        
        if (refreshToken) {
          const response = await axios.post(`${apiConfig.apiUrl}/auth/refresh-token`, {
            refreshToken,
          });

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
            
            await SecureStore.setItemAsync('access_token', accessToken);
            await SecureStore.setItemAsync('refresh_token', newRefreshToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        
        // You can emit an event here to handle logout in the app
        console.error('Token refresh failed:', refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = (error.response.data as any)?.message || 'Đã có lỗi xảy ra';
      console.error('API Error:', errorMessage);
    } else if (error.request) {
      // Request was made but no response
      console.error('Network Error: Không thể kết nối đến server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;