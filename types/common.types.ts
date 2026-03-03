// Common types for API responses
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message?: string
  success?: boolean
}

export interface ApiError {
  success: false
  message: string
  code?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Navigation types - Define your screens here
export type RootStackParamList = {
  // Add your screen params here
  // Example:
  // Home: undefined;
  // Profile: { userId: string };
}

export type MainTabParamList = {
  // Add your tab params here
  // Example:
  // Messages: undefined;
  // Contacts: undefined;
}
