import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

/**
 * Validate the better-auth session cookie by calling the Next.js session endpoint.
 * Returns the session user or null.
 */
async function getBetterAuthSession(req: Request): Promise<{ id: string; email: string; name: string; image?: string | null } | null> {
  try {
    const sessionToken = req.headers['x-session-token'] as string;

    if (sessionToken) {
      // 1. Fast local DB lookup (saves 100-300ms network latency)
      const authSession = await prisma.authSession.findFirst({
        where: { token: sessionToken },
        include: { user: true },
      });

      if (authSession && authSession.expiresAt > new Date()) {
        return {
          id: authSession.user.id,
          email: authSession.user.email,
          name: authSession.user.name,
          image: authSession.user.image,
        };
      }
    }

    // 2. Fallback to HTTP request
    const cookieHeader = req.headers.cookie || '';
    
    // Provide the Origin header so better-auth's CSRF protection allows the request
    const headers: Record<string, string> = {
      cookie: cookieHeader,
      Origin: process.env.CORS_ORIGIN || `https://${req.headers.host}`,
    };

    if (sessionToken) {
      headers.authorization = `Bearer ${sessionToken}`;
    }

    const response = await fetch(`${BETTER_AUTH_URL}/api/auth/get-session`, {
      headers,
    });
    
    if (!response.ok) {
       return null;
    }

    const data = await response.json() as { user?: { id: string; email: string; name: string; image?: string | null } };
    return data?.user ?? null;
  } catch (error) {
    console.error('getBetterAuthSession error:', error);
    return null;
  }
}

/**
 * Middleware to authenticate via better-auth session.
 * Looks up (or auto-creates) the user in the local `users` table by email,
 * then sets req.userId for downstream controllers.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  getBetterAuthSession(req)
    .then(async (sessionUser) => {
      if (!sessionUser) {
        return res.status(401).json({ error: 'No token provided' });
      }

      // Find the user in the existing users table by email
      let user = await prisma.user.findUnique({
        where: { email: sessionUser.email },
        select: { id: true },
      });

      // Auto-provision: first Google login creates a row in the users table
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: sessionUser.name,
            email: sessionUser.email,
            passwordHash: '', // not used with OAuth
            avatarUrl: sessionUser.image ?? null,
            lastLogin: new Date(),
            rank: 'IRON',
            tier: 1,
            currentRR: 10,
            totalRR: 10,
          },
          select: { id: true },
        });

        // Create initial streak record
        await prisma.streak.create({
          data: {
            userId: user.id,
            startDate: new Date(),
            currentStreak: 0,
            longestStreak: 0,
          },
        });
      }

      req.userId = user.id;
      next();
    })
    .catch(next);
};

/**
 * Optional authentication — doesn't fail if no session.
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  getBetterAuthSession(req)
    .then(async (sessionUser) => {
      if (sessionUser) {
        const user = await prisma.user.findUnique({
          where: { email: sessionUser.email },
          select: { id: true },
        });
        if (user) req.userId = user.id;
      }
      next();
    })
    .catch(() => next()); // optional — never block on failure
};
