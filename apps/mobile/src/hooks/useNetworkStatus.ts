import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { api } from '../services/api';

/**
 * Lightweight network status detection without extra dependencies.
 * Pings the API health endpoint on app foreground transitions.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await api.get('/health', { timeout: 5000 });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    // Check on mount
    checkConnection();

    // Check when app comes to foreground
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          checkConnection();
        }
        appState.current = nextAppState;
      },
    );

    // Periodic check every 30s
    const interval = setInterval(checkConnection, 30000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  return { isOnline };
}
