import { EconomicYearProvider } from '@/context/EconomicYearContext';
import { RequireEconomicYear } from './RequireEconomicYear';

export function EconomicYearGate() {
  return (
    <EconomicYearProvider>
      <RequireEconomicYear />
    </EconomicYearProvider>
  );
}