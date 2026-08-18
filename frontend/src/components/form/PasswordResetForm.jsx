import React, { useEffect, useState } from 'react';
import { KeyRound, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

const PasswordField = ({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
}) => (
  <div>
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </label>
    <div className="relative">
      <input
        value={value}
        onChange={onChange}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-blue-800 dark:focus:ring-blue-950/50"
      />
      <button
        type="button"
        onClick={onToggleShow}
        tabIndex={-1}
        aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

const PasswordResetForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setSuccess(res.data?.message || 'Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to change password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-blue-900/30 dark:bg-slate-900">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
          <KeyRound className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Change Password
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your account password
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            resetMessages();
          }}
          show={showCurrent}
          onToggleShow={() => setShowCurrent((s) => !s)}
          placeholder="Enter current password"
        />

        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            resetMessages();
          }}
          show={showNew}
          onToggleShow={() => setShowNew((s) => !s)}
          placeholder="Enter new password"
        />

        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            resetMessages();
          }}
          show={showConfirm}
          onToggleShow={() => setShowConfirm((s) => !s)}
          placeholder="Confirm new password"
        />

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default PasswordResetForm;