# Thrive Backend

Backend API for Thrive - A compassionate digital community for people with terminal illnesses.

## Tech Stack

- **Node.js** with Express
- **Prisma** ORM with PostgreSQL
- **JWT** for authentication
- **bcrypt** for password hashing

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/thrive?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Set Up PostgreSQL Database

Make sure PostgreSQL is running and create a database:

```bash
# Using psql
createdb thrive

# Or using PostgreSQL CLI
psql -U postgres
CREATE DATABASE thrive;
```

### 4. Run Prisma Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create database schema
npm run prisma:migrate
```

### 5. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in .env).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  - Body: `{ email, password, name, alias?, bio? }`
  
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  
- `GET /api/auth/me` - Get current user (protected)
  - Headers: `Authorization: Bearer <token>`

### Health Check

- `GET /health` - Check API status

## Database Schema

The Prisma schema includes models for:

- **Users** - User accounts with authentication
- **Profiles** - Extended user profile information
- **Posts** - Community posts
- **Comments** - Post comments
- **Reactions** - Gentle reactions (❤️, 🤝, 🌱)
- **Follows** - User follow relationships
- **Messages** - 1-on-1 messaging
- **Groups** - Group chats and support circles
- **Medications** - Medication tracking
- **Appointments** - Calendar appointments
- **Reminders** - Various reminder types
- **EncouragementSubscriptions** - Daily encouragement preferences
- **FlaggedContent** - Content moderation

## Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── database.js        # Prisma client setup
│   ├── controllers/
│   │   └── authController.js  # Authentication logic
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── routes/
│   │   └── authRoutes.js      # Authentication routes
│   └── utils/
│       └── jwt.js             # JWT utility functions
├── server.js                  # Express server entry point
├── package.json
└── .env.example
```

## Development

The server uses `nodemon` for auto-reloading during development. Changes to files will automatically restart the server.

## Security Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens are used for authentication
- CORS is configured for the frontend URL
- Environment variables should never be committed to git

