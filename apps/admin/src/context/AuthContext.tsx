import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../api/axiosInstance";
import type { LoginUser } from "../api/auth.api";

export { ACCESS_TOKEN_KEY as TOKEN_KEY };

interface AuthContextType {
  isAuthenticated: boolean;
  user: LoginUser | null;
  login: (token: string, user: LoginUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function hydrateUser(): LoginUser | null {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw) as LoginUser) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem(ACCESS_TOKEN_KEY),
  );
  const [user, setUser] = useState<LoginUser | null>(hydrateUser);

  const login = useCallback((token: string, userData: LoginUser) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    // Persist user profile (without refresh_token) for page-reload hydration.
    const { refresh_token: _omit, ...safeUser } = userData;
    void _omit; // intentionally unused
    localStorage.setItem("auth_user", JSON.stringify(safeUser));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem("auth_user");
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
