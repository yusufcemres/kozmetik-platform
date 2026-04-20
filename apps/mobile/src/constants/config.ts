import Constants from 'expo-constants';

const WEB_URL_PROD = 'https://kozmetik-platform.vercel.app';

const ENV = {
  development: {
    apiUrl: 'http://localhost:3001/api/v1',
    webUrl: WEB_URL_PROD,
  },
  staging: {
    apiUrl: 'https://kozmetik-api.onrender.com/api/v1',
    webUrl: WEB_URL_PROD,
  },
  production: {
    apiUrl: 'https://kozmetik-api.onrender.com/api/v1',
    webUrl: WEB_URL_PROD,
  },
};

type Environment = keyof typeof ENV;

const getEnv = (): Environment => {
  const channel = Constants.expoConfig?.extra?.eas?.channel;
  if (channel === 'production') return 'production';
  if (channel === 'staging') return 'staging';
  return 'development';
};

const base = ENV[getEnv()];

export const config = {
  ...base,
  apiUrl: process.env.EXPO_PUBLIC_API_URL || base.apiUrl,
  webUrl: process.env.EXPO_PUBLIC_WEB_URL || base.webUrl,
};
