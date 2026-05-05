# NutriTrack

A gamified nutrition and fitness tracker with Valorant/Mario-inspired UI.

## Stack
- **Frontend**: Next.js 16, Tailwind CSS 4, Better Auth, Prisma 7
- **Backend**: Express, Prisma 7, Neon PostgreSQL, Groq AI
- **Auth**: Better Auth with Google OAuth

## Local Development

```bash
# Backend (port 3001)
cd backend && npm install && npm run dev

# Frontend (port 3000)
cd frontend && npm install && npm run dev
```

## Deployment

### Frontend → Vercel
1. Import repo at vercel.com/new
2. Set **Root Directory** to `frontend`
3. Add environment variables (see below)
4. Deploy

### Backend → Render
1. New Web Service at render.com
2. Connect this repo, set **Root Directory** to `backend`
3. Build: `npm install && npm run build`
4. Start: `node dist/server.js`
5. Add environment variables (see below)

## Environment Variables

### Frontend (Vercel)
| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | 32+ char secret |
| `BETTER_AUTH_URL` | Your Vercel URL (e.g. https://nutritrack.vercel.app) |
| `NEXT_PUBLIC_APP_URL` | Same as BETTER_AUTH_URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_API_URL` | Your Render backend URL |

### Backend (Render)
| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Same secret as frontend |
| `BETTER_AUTH_URL` | Your Vercel frontend URL |
| `CORS_ORIGIN` | Your Vercel frontend URL |
| `JWT_SECRET` | Any secret string |
| `GROQ_API_KEY` | Groq API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

## Google OAuth Setup
Add these redirect URIs in Google Cloud Console:
- `http://localhost:3000/api/auth/callback/google` (dev)
- `https://your-vercel-url.vercel.app/api/auth/callback/google` (prod)
