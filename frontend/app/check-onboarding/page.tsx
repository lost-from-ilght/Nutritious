'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MobileContainer } from '@/components/layout/MobileContainer';

/**
 * Intermediate page after Google OAuth callback.
 * Checks if the user has completed onboarding (has a height set).
 * Redirects to /onboarding if not, otherwise to /.
 */
export default function CheckOnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    userApi.getProfile()
      .then((res) => {
        const u = res.user;
        // If they haven't set their height yet, they haven't done onboarding
        if (!u.heightCm) {
          router.replace('/onboarding');
        } else {
          router.replace('/');
        }
      })
      .catch(() => {
        // If profile fetch fails, just go to dashboard
        router.replace('/');
      });
  }, [router]);

  return (
    <MobileContainer className="flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </MobileContainer>
  );
}
