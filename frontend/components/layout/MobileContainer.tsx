import React from 'react';
import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className="h-screen w-full flex justify-center overflow-hidden"
         style={{ background: 'var(--bg-base)' }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10"
             style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-8"
             style={{ background: 'radial-gradient(circle, var(--cyan) 0%, transparent 70%)' }} />
      </div>

      <div
        className={cn(
          "w-full max-w-[430px] h-full relative shadow-2xl flex flex-col overflow-hidden scanlines",
          className
        )}
        style={{ background: 'var(--bg-base)' }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] z-50"
             style={{ background: 'linear-gradient(90deg, var(--primary), var(--cyan), var(--primary))' }} />
        {children}
      </div>
    </div>
  );
}
