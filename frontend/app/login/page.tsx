'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// useSearchParams must be inside Suspense in Next.js App Router
function LoginContent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push(searchParams.get('redirect') || '/');
  }, [isAuthenticated, authLoading, router, searchParams]);

  useEffect(() => {
    if (searchParams.get('error') === 'oauth') setError('Google sign-in failed. Please try again.');
  }, [searchParams]);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed.');
      setLoading(false);
    }
  };

  if (authLoading) return (
    <MobileContainer className="flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </MobileContainer>
  );
  if (isAuthenticated) return null;

  return (
    <MobileContainer className="flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col justify-between p-8 py-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 clip-card flex items-center justify-center text-2xl glow-red"
                 style={{ background: 'var(--primary)' }}>
              ⚡
            </div>
            <div>
              <h1 className="font-game text-3xl leading-none tracking-wide"
                  style={{ color: 'var(--foreground)' }}>
                NUTRI<span style={{ color: 'var(--primary)' }}>TRACK</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em]"
                 style={{ color: 'var(--muted)' }}>Level up your body</p>
            </div>
          </div>

          <div className="clip-card p-5 relative overflow-hidden"
               style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 stripe-accent opacity-40 pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="text-[10px] font-black uppercase tracking-[0.25em]"
                   style={{ color: 'var(--primary)' }}>Mission Briefing</div>
              <p className="font-game text-xl leading-snug" style={{ color: 'var(--foreground)' }}>
                Track calories.<br />
                <span style={{ color: 'var(--cyan)' }}>Crush your goals.</span><br />
                Dominate the leaderboard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {['🎯 TDEE Calculator', '📊 Weekly Stats', '🏆 Leaderboard', '⚖️ Weight Tracker', '🤖 AI Logging'].map(f => (
              <span key={f} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 clip-btn"
                    style={{ background: 'var(--bg-card)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4 mt-8">
          {error && (
            <div className="clip-card-sm p-3 text-sm font-bold"
                 style={{ background: 'rgba(255,70,85,0.1)', border: '1px solid rgba(255,70,85,0.3)', color: 'var(--primary)' }}>
              {error}
            </div>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 font-black text-sm uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-50 clip-card"
            style={{ background: 'var(--foreground)', color: 'var(--bg-base)' }}
          >
            {loading ? <LoadingSpinner size="sm" /> : <GoogleIcon />}
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
          <p className="text-center text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
            By continuing you accept our Terms &amp; Privacy Policy
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <MobileContainer className="flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </MobileContainer>
    }>
      <LoginContent />
    </Suspense>
  );
}
