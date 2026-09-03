import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-center">
      <p className="font-mono text-6xl font-bold text-primary">404</p>
      <p className="text-lg font-medium">This page doesn't exist.</p>
      <Link to="/dashboard"><Button>Back to dashboard</Button></Link>
    </div>
  );
}
