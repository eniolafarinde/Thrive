# Thrive Frontend

React frontend for Thrive - A compassionate community for people with terminal illnesses.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Update `.env` if your backend is running on a different port:

```env
VITE_API_URL=http://localhost:5001/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Home.jsx
│   ├── context/        # React Context providers
│   │   └── AuthContext.jsx
│   ├── services/       # API services
│   │   └── api.js
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── public/             # Static assets
└── package.json
```

## Features

- ✅ User authentication (login/register)
- ✅ Protected routes
- ✅ API integration with backend
- ✅ Responsive design with Tailwind CSS
- ✅ Token-based authentication
- ✅ Error handling

## API Integration

The frontend connects to the backend API at `http://localhost:5001/api` (configurable via `VITE_API_URL`).

### Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token is stored in localStorage
4. Token is automatically included in API requests
5. Protected routes check for valid token

## Development

- **Dev server**: `npm run dev` (runs on port 3000)
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Next Steps

- Community feed
- User profiles
- Posts and comments
- Chat functionality
- Medication reminders
- Daily encouragement features

