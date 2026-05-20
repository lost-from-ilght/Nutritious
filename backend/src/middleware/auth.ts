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
    const cookieHeader = req.headers.cookie || '';
    const sessionToken = req.headers['x-session-token'];

    // Provide the Origin header so better-auth's CSRF protection allows the request
    // Better Auth will trust the origin if it matches the configured trustedOrigins
    const headers: Record<string, string> = {
      cookie: cookieHeader,
      // Provide origin matching the backend API URL (this must be in frontend's trustedOrigins)
      Origin: process.env.CORS_ORIGIN || `https://${req.headers.host}`,
    };

    if (sessionToken) {
      // With the bearer plugin enabled on the frontend, this will cleanly authenticate
      headers.authorization = `Bearer ${sessionToken}`;
    }

    const response = await fetch(`${BETTER_AUTH_URL}/api/auth/get-session`, {
      headers,
    });
    
    if (!response.ok) {
       const errText = await response.text();
       console.error("Better Auth response not ok:", response.status, response.statusText, errText);
       return null;
    }

    const data = await response.json() as { user?: { id: string; email: string; name: string; image?: string | null } };
    return data?.user ?? null;
  } catch (error) {
    console.error('getBetterAuthSession error fetching from', BETTER_AUTH_URL, ':', error);
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
