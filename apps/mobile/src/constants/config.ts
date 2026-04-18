import Constants from 'expo-constants';

const ENV = {
  development: {
    apiUrl: 'http://localhost:3001/api/v1',
  },
  staging: {
    apiUrl: 'https://kozmetik-api.onrender.com/api/v1',
  },
  production: {
    apiUrl: 'https://kozmetik-api.onrender.com/api/v1',
  },
};

type Environment = keyof typeof ENV;

const getEnv = (): Environment => {
  const channel = Constants.expoConfig?.extra?.eas?.channel;
  if (channel === 'production') return 'production';
  if (channel === 'staging') return 'staging';
  return 'development';
};

export const config = ENV[getEnv()];
