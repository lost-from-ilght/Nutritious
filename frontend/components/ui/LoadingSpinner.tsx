import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const s = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('rounded-full animate-spin', s)}
           style={{ border: '2px solid var(--muted-2)', borderTopColor: 'var(--primary)' }} />
    </div>
  );
}

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4"
         style={{ background: 'var(--bg-base)' }}>
      {/* Valorant-style loading animation */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full animate-spin"
             style={{ border: '2px solid var(--muted-2)', borderTopColor: 'var(--primary)' }} />
        <div className="absolute inset-2 rounded-full animate-spin"
             style={{ border: '2px solid transparent', borderTopColor: 'var(--cyan)', animationDirection: 'reverse', animationDuration: '0.6s' }} />
        <div className="absolute inset-0 flex items-center justify-center text-lg">⚡</div>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: 'var(--muted)' }}>
        {message}
      </p>
    </div>
  );
}
