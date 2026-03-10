import {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import * as authApi from "../api/authApi";
import { msalInstance, loginRequest } from "../config/msalConfig";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface PendingMerge {
  idToken: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  pendingMerge: PendingMerge | null;
  clearPendingMerge: () => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithMicrosoft: () => Promise<void>;
  mergeAccounts: (idToken: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [pendingMerge, setPendingMerge] = useState<PendingMerge | null>(null);

  useEffect(() => {
    const handleMsalRedirect = async () => {
      try {
        await msalInstance.initialize();
        const result = await msalInstance.handleRedirectPromise();
        if (result?.idToken) {
          const idToken = result.idToken;
          const res = await authApi.microsoftLogin(idToken);
          if (res.data.mergeRequired) {
            setPendingMerge({ idToken, email: res.data.email });
          } else {
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setUser(res.data.user);
          }
        }
      } catch {
        // Redirect processing failed; fall through to normal login flow
      } finally {
        setLoading(false);
      }
    };
    handleMsalRedirect();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  }, []);

  const loginWithMicrosoft = useCallback(async () => {
    await msalInstance.initialize();
    await msalInstance.loginRedirect(loginRequest);
  }, []);

  const mergeAccounts = useCallback(
    async (idToken: string, password: string) => {
      const res = await authApi.microsoftMerge(idToken, password);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
    },
    [],
  );

  const clearPendingMerge = useCallback(() => {
    setPendingMerge(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, pendingMerge, clearPendingMerge, login, loginWithMicrosoft, mergeAccounts, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
