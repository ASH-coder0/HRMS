import React, { useEffect, useState } from 'react';
import { CalendarRange, Save, Info } from 'lucide-react';
import { api } from '@/lib/api';
import { useEconomicYear } from '@/context/EconomicYearContext';

const EconomicYearForm = ({ onFinished }) => {
  const { refetch } = useEconomicYear();

  const [form, setForm] = useState({
    economic_year: '',
    start_date: '',
    end_date: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const fetchEconomicYear = async () => {
      try {
        setLoading(true);

        const res = await api.get('/year/years');

        const years = res.data?.data || [];

        if (years.length > 0) {
          const data = years[years.length - 1];

          setForm({
            economic_year: data.economic_year || '',
            start_date: data.start_date
              ? data.start_date.substring(0, 10)
              : '',
            end_date: data.end_date
              ? data.end_date.substring(0, 10)
              : '',
          });
          setIsFirstTime(false);
        } else {
          // No economic year exists yet — first-time setup
          setIsFirstTime(true);
        }
      } catch (err) {
        console.error('Error fetching economic years:', err);

        setError(
          err?.response?.data?.message ||
            'Failed to load economic year.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEconomicYear();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.economic_year.trim()) {
      setError('Economic year is required.');
      return;
    }

    if (!form.start_date) {
      setError('Start date is required.');
      return;
    }

    if (!form.end_date) {
      setError('End date is required.');
      return;
    }

    if (new Date(form.end_date) < new Date(form.start_date)) {
      setError('End date cannot be before start date.');
      return;
    }

    try {
      setSaving(true);

      const res = await api.post('/year', {
        economic_year: form.economic_year.trim(),
        start_date: form.start_date,
        end_date: form.end_date,
      });

      await refetch();

      setIsFirstTime(false); // year now exists, clear the notice

      onFinished?.(res.data?.data);

      if (res.data?.data) {
        setForm({
          economic_year: res.data.data.economic_year || '',
          start_date: res.data.data.start_date
            ? res.data.data.start_date.substring(0, 10)
            : '',
          end_date: res.data.data.end_date
            ? res.data.data.end_date.substring(0, 10)
            : '',
        });
      }
    } catch (err) {
      console.log('Error saving economic year', err);

      setError(
        err?.response?.data?.message ||
          'Failed to save economic year. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl p-8">
        <div className="rounded-lg border p-6 text-center text-sm text-gray-500">
          Loading economic year...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-lg border p-6"
      >
        <div className="flex items-center gap-2">
          <CalendarRange className="h-6 w-6 text-primary" />

          <div>
            <h2 className="text-lg font-semibold">
              Economic Year Setup
            </h2>

            <p className="text-sm text-gray-500">
              Set up the economic year period.
            </p>
          </div>
        </div>

        {isFirstTime && !error && (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              No economic year has been set up yet. Please create one below to continue using the system.
            </span>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Economic Year *
          </label>

          <input
            type="text"
            value={form.economic_year}
            onChange={(e) =>
              handleChange('economic_year', e.target.value)
            }
            placeholder="e.g. 2083/2084"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Start Date *
            </label>

            <input
              type="date"
              value={form.start_date}
              onChange={(e) =>
                handleChange('start_date', e.target.value)
              }
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              End Date *
            </label>

            <input
              type="date"
              value={form.end_date}
              onChange={(e) =>
                handleChange('end_date', e.target.value)
              }
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />

            {saving
              ? 'Saving...'
              : form.economic_year
              ? 'Update Economic Year'
              : 'Save Economic Year'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EconomicYearForm;