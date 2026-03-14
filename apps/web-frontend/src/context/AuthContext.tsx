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

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithMicrosoft: () => Promise<void>;
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

  useEffect(() => {
    const handleMsalRedirect = async () => {
      try {
        await msalInstance.initialize();
        const result = await msalInstance.handleRedirectPromise();
        if (result?.idToken) {
          const res = await authApi.microsoftLogin(result.idToken);
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          setUser(res.data.user);
        }
      } catch {
        // Redirect processing failed; fall through to normal login flow
      } finally {
        setLoading(false);
      }
    };
    handleMsalRedirect();
  }, []);

  const loginWithMicrosoft = useCallback(async () => {
    await msalInstance.initialize();
    await msalInstance.loginRedirect(loginRequest);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithMicrosoft, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
