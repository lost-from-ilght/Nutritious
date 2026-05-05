# NutriTrack Backend API

Complete Node.js backend for the NutriTrack nutrition and fitness tracker application.

## Tech Stack

- **Node.js** with **Express.js**
- **PostgreSQL** (hosted on Neon DB)
- **Prisma ORM** for database modeling and queries
- **JWT-based authentication**
- **TypeScript** for type safety

## Project Structure

```
src/
├── config/          # Database connection, environment variables
├── controllers/     # Business logic for each route
├── middleware/      # Auth, validation, error handling
├── models/          # Prisma schema (in prisma/schema.prisma)
├── routes/          # API endpoints grouped by resource
├── services/        # Reusable service logic
├── utils/           # Helper functions
├── tests/           # Unit/integration tests
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Neon DB connection string and JWT secret.

3. **Set up the database:**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # (Optional) Seed the database with test data
   npm run db:seed
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## API Routes

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Authenticate user and get token
- `POST /api/auth/logout` - Logout (client-side token removal)

### User
- `GET /api/user/profile` - Get user profile with streaks and scores
- `PUT /api/user/profile` - Update user profile

### Food
- `POST /api/food` - Log a food entry
- `GET /api/food/recent` - Get recent food logs
- `GET /api/food/:id` - Get a single food entry
- `PUT /api/food/:id` - Update a food entry
- `DELETE /api/food/:id` - Delete a food entry

### Exercise
- `POST /api/exercise` - Log an exercise entry
- `GET /api/exercise/recent` - Get recent exercise logs
- `GET /api/exercise/:id` - Get a single exercise entry
- `PUT /api/exercise/:id` - Update an exercise entry
- `DELETE /api/exercise/:id` - Delete an exercise entry

### Dashboard
- `GET /api/dashboard` - Get dashboard data (calorie goal, macros, activity graph, recent activity)

### Scores
- `GET /api/scores` - Get user scores history

### Streaks
- `GET /api/streaks` - Get current and longest streaks

## Features

- ✅ **Automatic Daily Summary Calculation** - Updates when food/exercise is logged
- ✅ **Streak Tracking** - Tracks daily activity streaks
- ✅ **Scoring System** - Awards points for logging, hitting goals, and maintaining streaks
- ✅ **Activity Graph** - Tracks daily calorie status (under, on-track, over)
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Input Validation** - Validates all request data
- ✅ **Error Handling** - Comprehensive error handling middleware

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Database Models

- **User** - User accounts with stats (streak, score, calorie goal)
- **FoodLog** - Food entries with calories and macros
- **ExerciseLog** - Exercise entries with calories burned
- **DailySummary** - Daily aggregated nutrition data
- **Streak** - User streak tracking
- **Score** - User score history
- **ActivityGraph** - Daily activity status for visualization

## Environment Variables

See `.env.example` for required environment variables:
- `DATABASE_URL` - PostgreSQL connection string (Neon DB)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration (default: 7d)
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Allowed CORS origin (default: http://localhost:3000)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with test data
- `npm test` - Run tests

## License

ISC

