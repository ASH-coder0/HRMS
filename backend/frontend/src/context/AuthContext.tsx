
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  api,
  setAccessToken,
  setRefreshToken,
  getRefreshToken,
  refreshAccessToken,
} from '@/lib/api';

import type { AuthUser, Role } from '@/types';

interface EconomicYear {
  id: number;
  user_id: number;
  economic_year: string;
  start_date: string;
  end_date: string;
  status: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;

  economicYear: EconomicYear | null;
  hasEconomicYear: boolean;
  economicYearLoading: boolean;

  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  hasRole: (...roles: Role[]) => boolean;

  refreshEconomicYear: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [economicYear, setEconomicYear] =
    useState<EconomicYear | null>(null);

  const [economicYearLoading, setEconomicYearLoading] =
    useState(true);

  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch economic year for currently logged-in user
   */
  async function fetchEconomicYear() {
    try {
      setEconomicYearLoading(true);

      const res = await api.get('/year/current');

      const data = res.data?.data;

      if (data) {
        setEconomicYear(data);
      } else {
        setEconomicYear(null);
      }
    } catch (error: any) {
      console.error(
        'Failed to fetch economic year:',
        error
      );

      setEconomicYear(null);
    } finally {
      setEconomicYearLoading(false);
    }
  }

  /**
   * Bootstrap authentication when application starts
   */
  async function bootstrap() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      setEconomicYear(null);
      setEconomicYearLoading(false);
      setIsLoading(false);
      return;
    }

    try {
      // Refresh access token
      const token = await refreshAccessToken();

      if (!token) {
        throw new Error('No token after refresh');
      }

      // Get logged-in user
      const meRes = await api.get('/auth/me');

      const me = meRes.data.data;

      console.log('🔍 Auth/me response:', me);

      // Handle employee_code from both nested and flat structures
      const employeeCode =
        me.Employee?.employee_code ||
        me.employee_code ||
        null;

      const employeeId =
        me.Employee?.employee_id ||
        me.employee_id ||
        null;

      const loggedInUser: AuthUser = {
        id: me.id,
        email: me.email,
        role: me.Role?.name || me.role,
        employeeId,
        employeeCode,
      };

      setUser(loggedInUser);

      console.log(
        '✅ Bootstrap - User set with employeeCode:',
        employeeCode
      );

      // Fetch user's economic year
      await fetchEconomicYear();

    } catch (error) {
      console.error('Bootstrap error:', error);

      setAccessToken(null);
      setRefreshToken(null);

      setUser(null);
      setEconomicYear(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Login
   */
  async function login(
    email: string,
    password: string
  ) {
    try {
      const res = await api.post('/auth/login', {
        email,
        password,
      });

      console.log('🔍 Login response:', res.data);

      const {
        access_token,
        refresh_token,
        userInfo,
      } = res.data.data;

      setAccessToken(access_token);
      setRefreshToken(refresh_token);

      console.log('🔍 userInfo:', userInfo);

      const employeeCode =
        userInfo.employee_code || null;

      const employeeId =
        userInfo.employee_id || null;

      const loggedInUser: AuthUser = {
        id: userInfo.user_id,
        email: userInfo.email,
        role: userInfo.role,
        employeeId,
        employeeCode,
      };

      setUser(loggedInUser);

      console.log(
        '✅ Login - User set with employeeCode:',
        employeeCode
      );

      // Fetch economic year immediately after login
      await fetchEconomicYear();

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async function logout() {
    const refresh_token = getRefreshToken();

    if (refresh_token) {
      try {
        await api.post('/auth/logout', {
          refresh_token,
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setAccessToken(null);
    setRefreshToken(null);

    setUser(null);
    setEconomicYear(null);
  }

  /**
   * Check user role
   */
  function hasRole(...roles: Role[]) {
    return !!user && roles.includes(user.role);
  }

  /**
   * Whether current user has economic year
   */
  const hasEconomicYear = !!economicYear;

  // Debug user
  useEffect(() => {
    if (user) {
      console.log('👤 Current user:', user);
      console.log(
        '📋 Employee Code:',
        user.employeeCode
      );
    }
  }, [user]);

  // Debug economic year
  useEffect(() => {
    console.log(
      '📅 Economic Year:',
      economicYear
    );

    console.log(
      '📅 Has Economic Year:',
      hasEconomicYear
    );
  }, [economicYear, hasEconomicYear]);

  return (
    <AuthContext.Provider
      value={{
        user,

        economicYear,
        hasEconomicYear,
        economicYearLoading,

        isLoading,

        login,
        logout,

        hasRole,

        refreshEconomicYear: fetchEconomicYear,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return ctx;
}