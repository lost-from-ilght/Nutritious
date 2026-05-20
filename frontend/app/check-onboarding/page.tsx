'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Intermediate page after Google OAuth callback.
 * Checks if the user has completed onboarding (has a height set).
 * Redirects to /onboarding if not, otherwise to /.
 */
export default function CheckOnboardingPage() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Wait until auth is fully loaded and token is synced to localStorage
    if (loading) return;
    
    // If somehow not authenticated, bounce them back to login
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    userApi.getProfile()
      .then((res) => {
        const u = res.user;
        if (!u.heightCm) {
          router.replace('/onboarding');
        } else {
          router.replace('/');
        }
      })
      .catch(() => {
        router.replace('/');
      });
  }, [loading, isAuthenticated, router]);

  return (
    <MobileContainer className="flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </MobileContainer>
  );
}
