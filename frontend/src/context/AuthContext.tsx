import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, setAccessToken, setRefreshToken, getRefreshToken, refreshAccessToken } from '@/lib/api';
import type { AuthUser, Role } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function bootstrap() {
    if (!getRefreshToken()) {
      setIsLoading(false);
      return;
    }
    try {
      const token = await refreshAccessToken();
      if (!token) throw new Error('No token');
      const meRes = await api.get('/auth/me');
      const me = meRes.data.data;
      setUser({ id: me.id, email: me.email, role: me.Role.name, employeeId: me.employee_id });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, refresh_token, userInfo } = res.data.data;
    setAccessToken(access_token);
    setRefreshToken(refresh_token);
    setUser({ id: userInfo.user_id, email: userInfo.email, role: userInfo.role, employeeId: userInfo.employee_id });
  }

  async function logout() {
    const refresh_token = getRefreshToken();
    await api.post('/auth/logout', { refresh_token }).catch(() => {});
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }

  function hasRole(...roles: Role[]) {
    return !!user && roles.includes(user.role);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
