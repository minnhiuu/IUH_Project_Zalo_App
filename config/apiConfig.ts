// API Configuration
// Update these URLs with your actual backend endpoints

export type Environment = 'development' | 'staging' | 'production';

interface ApiConfigType {
  apiUrl: string;
  socketUrl: string;
}

const API_CONFIG: Record<Environment, ApiConfigType> = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    socketUrl: 'http://localhost:3000',
  },
  staging: {
    apiUrl: 'https://staging-api.your-domain.com/api',
    socketUrl: 'https://staging-api.your-domain.com',
  },
  production: {
    apiUrl: 'https://api.your-domain.com/api',
    socketUrl: 'https://api.your-domain.com',
  },
};

// Change this to 'staging' or 'production' when deploying
const ENV: Environment = 'development';

const apiConfig = {
  ...API_CONFIG[ENV],
  env: ENV,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
};

export default apiConfig;
