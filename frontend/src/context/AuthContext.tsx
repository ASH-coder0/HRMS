// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  api,
  setAccessToken,
  setRefreshToken,
  getRefreshToken,
  refreshAccessToken,
} from '@/lib/api';
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
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }

    try {
      // First, refresh the access token
      const token = await refreshAccessToken();
      if (!token) {
        throw new Error('No token after refresh');
      }

      // ✅ Use the correct /auth/me endpoint
      const meRes = await api.get('/auth/me');
      const me = meRes.data.data;

      console.log('🔍 Auth/me response:', me);

      // Handle employee_code from both nested and flat structures
      const employeeCode = me.Employee?.employee_code || me.employee_code || null;
      const employeeId = me.Employee?.employee_id || me.employee_id || null;

      setUser({
        id: me.id,
        email: me.email,
        role: me.Role?.name || me.role,
        employeeId: employeeId,
        employeeCode: employeeCode,
      });
      
      console.log('✅ Bootstrap - User set with employeeCode:', employeeCode);
    } catch (error) {
      console.error('Bootstrap error:', error);
      // Clear tokens on error
      setAccessToken(null);
      setRefreshToken(null);
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
    try {
      const res = await api.post('/auth/login', { email, password });
      console.log('🔍 Login response:', res.data);

      const { access_token, refresh_token, userInfo } = res.data.data;

      setAccessToken(access_token);
      setRefreshToken(refresh_token);

      console.log('🔍 userInfo:', userInfo);

      // Get employee_code from userInfo
      const employeeCode = userInfo.employee_code || null;
      const employeeId = userInfo.employee_id || null;

      setUser({
        id: userInfo.user_id,
        email: userInfo.email,
        role: userInfo.role,
        employeeId: employeeId,
        employeeCode: employeeCode,
      });
      
      console.log('✅ Login - User set with employeeCode:', employeeCode);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function logout() {
    const refresh_token = getRefreshToken();

    if (refresh_token) {
      try {
        await api.post('/auth/logout', { refresh_token });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }

  function hasRole(...roles: Role[]) {
    return !!user && roles.includes(user.role);
  }

  // Debug: Log user state changes
  useEffect(() => {
    if (user) {
      console.log('👤 Current user:', user);
      console.log('📋 Employee Code:', user?.employeeCode);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}