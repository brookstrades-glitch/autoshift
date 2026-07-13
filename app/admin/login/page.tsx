'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Incorrect password');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-lg">
        <h1 className="text-2xl font-bold">Admin Login</h1>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
        <Button onClick={handleLogin} disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Log In'}
        </Button>
      </div>
    </div>
  );
}