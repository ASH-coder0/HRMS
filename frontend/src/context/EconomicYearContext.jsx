import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const EconomicYearContext = createContext(undefined);

export function EconomicYearProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.user_id ?? user?.id ?? null;
  const navigate = useNavigate();
  const location = useLocation();

  const [economicYear, setEconomicYear] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const fetchCurrent = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get('/year/current');
      setEconomicYear(res.data?.data ?? null);
    } catch {
      setEconomicYear(null);
    } finally {
      setIsLoading(false);
      hasFetchedRef.current = true;
    }
  }, [userId]);

  useEffect(() => {
    if (!hasFetchedRef.current && userId) {
      fetchCurrent();
    } else if (!userId) {
      setIsLoading(false);
    }
  }, [userId, fetchCurrent]);

  const refetch = useCallback(async () => {
    hasFetchedRef.current = false;
    await fetchCurrent();
  }, [fetchCurrent]);

  const needsSetup =
    !isLoading &&
    (!economicYear || new Date(economicYear.end_date) < new Date());

  // Redirect here instead of a separate wrapper component
  useEffect(() => {
    if (!isLoading && needsSetup && location.pathname !== '/economic-year') {
      navigate('/economic-year', { replace: true });
    }
  }, [isLoading, needsSetup, location.pathname, navigate]);

  return (
    <EconomicYearContext.Provider value={{ economicYear, isLoading, needsSetup, refetch }}>
      {children}
    </EconomicYearContext.Provider>
  );
}

export function useEconomicYear() {
  const ctx = useContext(EconomicYearContext);
  if (!ctx) throw new Error('useEconomicYear must be used inside EconomicYearProvider');
  return ctx;
}