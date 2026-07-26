import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, getCurrentUser, setCurrentUser, logoutUser } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      const u = await getCurrentUser();
      if (t && u) {
        setAuthToken(t);
        setUser(u);
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (username, authToken) => {
    await setCurrentUser(username);
    await setToken(authToken);
    setUser(username);
    setAuthToken(authToken);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setAuthToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
