import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';

import {
  useNavigate,
  useLocation,
} from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';

import { api } from '@/lib/api';

const EconomicYearContext = createContext(undefined);

export function EconomicYearProvider({ children }) {
  const { user, hasRole, isLoading: authLoading } = useAuth();

  const userId = user?.id ?? null;

  const navigate = useNavigate();
  const location = useLocation();

  const [economicYear, setEconomicYear] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasFetchedRef = useRef(false);

  // =========================================================
  // ADMIN CHECK
  // Only these roles can manage/check Economic Year
  // =========================================================
  const canManageEconomicYear = hasRole(
    'super_admin',
    'hospital_admin'
  );

  // =========================================================
  // FETCH CURRENT ECONOMIC YEAR
  // =========================================================
  const fetchCurrent = useCallback(async () => {
    // Don't do anything until authentication is complete
    if (authLoading) {
      return;
    }

    // User is not logged in
    if (!userId) {
      setEconomicYear(null);
      setIsLoading(false);
      return;
    }

    // Non-admin users don't need to fetch/manage
    // Economic Year
    if (!canManageEconomicYear) {
      setEconomicYear(null);
      setIsLoading(false);
      hasFetchedRef.current = true;
      return;
    }

    try {
      setIsLoading(true);

      const res = await api.get('/year/current');

      setEconomicYear(
        res.data?.data ?? null
      );
    } catch (error) {
      console.error(
        'Failed to fetch current economic year:',
        error
      );

      setEconomicYear(null);
    } finally {
      setIsLoading(false);
      hasFetchedRef.current = true;
    }
  }, [
    userId,
    authLoading,
    canManageEconomicYear,
  ]);

  // =========================================================
  // FETCH WHEN USER LOGS IN
  // =========================================================
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (
      !hasFetchedRef.current &&
      userId &&
      canManageEconomicYear
    ) {
      fetchCurrent();
    } else if (!userId) {
      setEconomicYear(null);
      setIsLoading(false);
    } else if (!canManageEconomicYear) {
      setEconomicYear(null);
      setIsLoading(false);
    }
  }, [
    userId,
    authLoading,
    canManageEconomicYear,
    fetchCurrent,
  ]);

  // =========================================================
  // REFETCH
  // =========================================================
  const refetch = useCallback(async () => {
    hasFetchedRef.current = false;

    await fetchCurrent();
  }, [fetchCurrent]);

  // =========================================================
  // CHECK WHETHER ECONOMIC YEAR NEEDS SETUP
  // =========================================================
  const needsSetup =
    canManageEconomicYear &&
    !isLoading &&
    (
      !economicYear ||
      new Date(economicYear.end_date) <
        new Date()
    );

  // =========================================================
  // REDIRECT ONLY ADMIN USERS
  // =========================================================
  useEffect(() => {
    // Don't redirect while authentication is loading
    if (authLoading) {
      return;
    }

    // Don't redirect non-admin users
    if (!canManageEconomicYear) {
      return;
    }

    // Redirect admin if Economic Year is missing/expired
    if (
      !isLoading &&
      needsSetup &&
      location.pathname !== '/economic-year'
    ) {
      navigate('/economic-year', {
        replace: true,
      });
    }
  }, [
    authLoading,
    canManageEconomicYear,
    isLoading,
    needsSetup,
    location.pathname,
    navigate,
  ]);

  // =========================================================
  // PROVIDER
  // =========================================================
  return (
    <EconomicYearContext.Provider
      value={{
        economicYear,
        isLoading,
        needsSetup,
        refetch,
        canManageEconomicYear,
      }}
    >
      {children}
    </EconomicYearContext.Provider>
  );
}

// =========================================================
// HOOK
// =========================================================
export function useEconomicYear() {
  const ctx = useContext(EconomicYearContext);

  if (!ctx) {
    throw new Error(
      'useEconomicYear must be used inside EconomicYearProvider'
    );
  }

  return ctx;
}