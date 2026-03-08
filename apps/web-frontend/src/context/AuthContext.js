import { createContext, useState, useCallback, useContext } from 'react';
import * as authApi from '../api/authApi';
import { msalInstance, loginRequest } from '../config/msalConfig';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const loginWithMicrosoft = useCallback(async () => {
    await msalInstance.initialize();
    const msResult = await msalInstance.loginPopup(loginRequest);
    const idToken = msResult.idToken;
    const res = await authApi.microsoftLogin(idToken);

    if (res.data.mergeRequired) {
      const err = new Error('merge_required');
      err.mergeRequired = true;
      err.idToken = idToken;
      err.email = res.data.email;
      throw err;
    }

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const mergeAccounts = useCallback(async (idToken, password) => {
    const res = await authApi.microsoftMerge(idToken, password);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginWithMicrosoft, mergeAccounts, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
