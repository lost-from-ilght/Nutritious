'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useSession, signOut } from '@/lib/auth-client';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { setToken, removeToken } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  avatarUrl: string | null; // alias for image, used by existing components
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.session?.token) {
      setToken(session.session.token);
    } else if (!isPending) {
      removeToken();
    }
  }, [session, isPending]);

  const loginWithGoogle = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/check-onboarding',
      errorCallbackURL: '/login?error=oauth',
    });
  };

  const logout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
        },
      },
    });
  };

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        avatarUrl: session.user.image ?? null,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: isPending,
        loginWithGoogle,
        logout,
        isAuthenticated: !!session?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
