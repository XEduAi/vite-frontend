import { useCallback, useEffect, useRef, useState } from 'react';
import axiosClient, {
  clearAccessToken,
  registerRefreshHandler,
  setAccessToken,
} from '../api/axiosClient';
import { AuthContext } from './context';
import { queryClient } from '../query/client';

const applyAuthPayload = (data, setUserState, setTokenState) => {
  const nextToken = data?.accessToken || data?.token || null;
  const nextUser = data?.user || null;

  setAccessToken(nextToken);
  setTokenState(nextToken);
  setUserState(nextUser);

  return nextToken;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessTokenState, setAccessTokenState] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const refreshPromiseRef = useRef(null);

  const clearSession = useCallback(() => {
    clearAccessToken();
    setAccessTokenState(null);
    setUser(null);
    queryClient.clear();
  }, []);

  const refreshSession = useCallback(async () => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = axiosClient
        .post('/auth/refresh', null, { _skipRefresh: true })
        .then(({ data }) => applyAuthPayload(data, setUser, setAccessTokenState))
        .catch((error) => {
          clearSession();
          throw error;
        })
        .finally(() => {
          refreshPromiseRef.current = null;
        });
    }

    return refreshPromiseRef.current;
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const { data } = await axiosClient.post('/login', credentials, { _skipRefresh: true });
    applyAuthPayload(data, setUser, setAccessTokenState);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosClient.post('/auth/logout', null, { _skipRefresh: true });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    registerRefreshHandler(refreshSession);

    return () => {
      registerRefreshHandler(null);
    };
  }, [refreshSession]);

  useEffect(() => {
    let isActive = true;

    refreshSession()
      .catch(() => null)
      .finally(() => {
        if (isActive) {
          setInitializing(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [refreshSession]);

  return (
    <AuthContext.Provider
      value={{
        accessToken: accessTokenState,
        clearSession,
        initializing,
        isAuthenticated: Boolean(user),
        login,
        logout,
        refreshSession,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
