import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';

export function RegisterPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError('');
    setSuccess('');

    // Check password confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        email,
        password,
      });

      setSuccess(
        'Registration successful. You can now sign in with your email and password.'
      );

      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to register. Please make sure you are using the email assigned by your administrator.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo / Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HeartPulse className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold">
            Hospital HRMS
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Create your employee account
          </p>
        </div>

        <Card>
          <CardContent className="p-6">

            {/* Information */}
            <div className="mb-5 rounded-lg bg-primary/10 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Use the <strong>work email</strong> assigned to you by your
                administrator to create your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Work email
                </Label>

                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@hospital.com"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />

                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">
                  Confirm password
                </Label>

                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              {/* Success */}
              {success && (
                <p className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-600">
                  {success}
                </p>
              )}

              {/* Register */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            {/* Login Link */}
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}