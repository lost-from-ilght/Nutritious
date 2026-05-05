'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // Save the current path to redirect back after login
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isAuthenticated, loading, router, pathname]);

    if (loading) {
        return <LoadingScreen message="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}

