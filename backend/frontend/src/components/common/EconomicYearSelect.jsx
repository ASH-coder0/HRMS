import React, { useEffect, useState } from 'react';
import { api } from "@/lib/api";

const NEPALI_MONTHS = [
  { value: 1, label: "Baisakh" },
  { value: 2, label: "Jestha" },
  { value: 3, label: "Ashad" },
  { value: 4, label: "Shrawan" },
  { value: 5, label: "Bhadra" },
  { value: 6, label: "Ashwin" },
  { value: 7, label: "Kartik" },
  { value: 8, label: "Mangsir" },
  { value: 9, label: "Poush" },
  { value: 10, label: "Magh" },
  { value: 11, label: "Falgun" },
  { value: 12, label: "Chaitra" },
];

// ---------- Economic Year Select ----------
const EconomicYearSelect = ({ value, onChange, placeholder = "Select economic year", onYearChange }) => {
  const [economicYears, setEconomicYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        setLoading(true);
        const res = await api.get('/year/years');
        const years = res.data?.data || [];
        setEconomicYears(years);

        // Auto-select current
        if (!value && years.length > 0) {
          const current = years.find(y => y.status === 1);
          if (current) {
            const id = String(current.id);
            onChange?.(id);
            onYearChange?.(current);
          }
        }
      } catch (error) {
        console.error('Failed to fetch economic years:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchYears();
  }, []);

  const handleChange = (e) => {
    const id = e.target.value;
    onChange?.(id);
    const selected = economicYears.find(y => String(y.id) === id);
    if (selected) onYearChange?.(selected);
  };

  return (
    <select
      value={value || ''}
      onChange={handleChange}
      disabled={loading}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
    >
      <option value="" disabled>
        {loading ? 'Loading...' : placeholder}
      </option>
      {economicYears.map((year) => (
        <option key={year.id} value={String(year.id)}>
          {year.economic_year || year.name || `Year ${year.id}`}
          {year.status === 1 ? ' (Current)' : ''}
        </option>
      ))}
    </select>
  );
};



// ---------- Month Select (based on start month to end month) ----------
export const MonthSelect = ({ economicYear, value, onChange, placeholder = "Select month" }) => {
  const [months, setMonths] = useState([]);

  useEffect(() => {
    if (economicYear) {
      const startMonth = parseInt(economicYear.start_date.split('-')[1]);
      const endMonth = parseInt(economicYear.end_date.split('-')[1]);

      let monthNumbers = [];

      // If start month is less than or equal to end month (e.g., 4 to 12)
      if (startMonth <= endMonth) {
        for (let m = startMonth; m <= endMonth; m++) {
          monthNumbers.push(m);
        }
      } else {
        // If start month is greater than end month (e.g., 4 to 3 - wraps around)
        // Start from startMonth to 12, then 1 to endMonth
        for (let m = startMonth; m <= 12; m++) {
          monthNumbers.push(m);
        }
        for (let m = 1; m <= endMonth; m++) {
          monthNumbers.push(m);
        }
      }

      const list = monthNumbers
        .map(m => NEPALI_MONTHS.find(mm => mm.value === m))
        .filter(Boolean);
      
      setMonths(list);
      
      // Auto-select first month if no value selected
      if (!value && list.length > 0) {
        onChange?.(String(list[0].value));
      }
    } else {
      setMonths([]);
    }
  }, [economicYear]);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={!economicYear || months.length === 0}
      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
    >
      <option value="" disabled>
        {!economicYear ? 'Select economic year first' :
         months.length === 0 ? 'No months available' :
         placeholder}
      </option>
      {months.map((m) => (
        <option key={m.value} value={String(m.value)}>
          {m.label}
        </option>
      ))}
    </select>
  );
};

export default EconomicYearSelect;