// Environment configuration
export interface EnvironmentConfig {
  // API Configuration
  apiBaseUrl: string;
  useMockApi: boolean;
  
  // Google OAuth Configuration
  googleClientId: string;
  googleRedirectUri: string;
  
  // Feature Flags
  enableGoogleOAuth: boolean;
  enableMockLogin: boolean;
  
  // Development Settings
  isDevelopment: boolean;
  isProduction: boolean;
}

// Default configuration
const defaultConfig: EnvironmentConfig = {
  apiBaseUrl: 'http://localhost:5001',
  useMockApi: false, // Default to live API
  googleClientId: '252228382269-imsndvuvdtqfsbc4ecnf8jmf4m98p20a.apps.googleusercontent.com',
  googleRedirectUri: 'http://localhost:5173',
  enableGoogleOAuth: true,
  enableMockLogin: true, // Keep mock login for development
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Environment-specific overrides
const getEnvironmentConfig = (): EnvironmentConfig => {
  const config = { ...defaultConfig };
  
  // Override with environment variables
  if (import.meta.env.VITE_AQUA_API) {
    config.apiBaseUrl = import.meta.env.VITE_AQUA_API;
  }
  
  if (import.meta.env.VITE_USE_MOCK_API) {
    config.useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';
  }
  
  if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    config.googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  }
  
  if (import.meta.env.VITE_GOOGLE_REDIRECT_URI) {
    config.googleRedirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
  }
  
  if (import.meta.env.VITE_ENABLE_GOOGLE_OAUTH) {
    config.enableGoogleOAuth = import.meta.env.VITE_ENABLE_GOOGLE_OAUTH === 'true';
  }
  
  if (import.meta.env.VITE_ENABLE_MOCK_LOGIN) {
    config.enableMockLogin = import.meta.env.VITE_ENABLE_MOCK_LOGIN === 'true';
  }
  
  return config;
};

export const env = getEnvironmentConfig();

// Helper functions
export const getApiBaseUrl = (): string => {
  return env.apiBaseUrl;
};

export const isUsingMockApi = (): boolean => {
  return env.useMockApi;
};

export const getApiEndpoint = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const prefix = isUsingMockApi() ? '/mock' : '';
  return `${baseUrl}/api${prefix}${endpoint}`;
};

// Console logging for development
if (env.isDevelopment) {
  console.log('🌍 Environment Configuration:', {
    apiBaseUrl: env.apiBaseUrl,
    useMockApi: env.useMockApi,
    enableGoogleOAuth: env.enableGoogleOAuth,
    enableMockLogin: env.enableMockLogin,
    isDevelopment: env.isDevelopment,
  });
}
