# Thrive API Documentation

Base URL: `http://localhost:5001` (Note: Changed from 5000 to avoid macOS AirPlay conflict)

## API Endpoints

### Health Check
- **GET** `/health`
  - Check if the API is running
  - No authentication required

### Authentication

#### Register User
- **POST** `/api/auth/register`
  - Register a new user account
  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123",
      "name": "John Doe",
      "alias": "Johnny",  // optional
      "bio": "What keeps me going"  // optional
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "data": {
        "user": {
          "id": "clx...",
          "email": "user@example.com",
          "name": "John Doe",
          "alias": "Johnny",
          "bio": "What keeps me going",
          "isAnonymous": false,
          "createdAt": "2024-01-01T00:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
    ```

#### Login
- **POST** `/api/auth/login`
  - Login with email and password
  - **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "securepassword123"
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "user": {
          "id": "clx...",
          "email": "user@example.com",
          "name": "John Doe",
          "alias": "Johnny",
          "bio": "What keeps me going",
          "isAnonymous": false,
          "createdAt": "2024-01-01T00:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
    ```

#### Get Current User
- **GET** `/api/auth/me`
  - Get the authenticated user's profile
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:**
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "clx...",
          "email": "user@example.com",
          "name": "John Doe",
          "alias": "Johnny",
          "bio": "What keeps me going",
          "isAnonymous": false,
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z",
          "profile": {
            "id": "clx...",
            "illnessTags": [],
            "tonePreference": null
          }
        }
      }
    }
    ```

## Testing the API

### Using cURL

#### 1. Health Check
```bash
curl http://localhost:5000/health
```

#### 2. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User",
    "alias": "Tester",
    "bio": "Testing the API"
  }'
```

#### 3. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

#### 4. Get Current User (Protected Route)
```bash
# Replace YOUR_TOKEN_HERE with the token from login/register response
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the collection from `tests/postman_collection.json` (if available)
2. Or manually create requests:
   - Set base URL: `http://localhost:5000`
   - For protected routes, add header: `Authorization: Bearer <token>`

### Using the Test Script

Run the automated test script:
```bash
npm run test:api
```

Or manually:
```bash
node tests/test-api.js
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `409` - Conflict (e.g., user already exists)
- `500` - Internal Server Error

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Tokens are valid for 7 days by default (configurable via `JWT_EXPIRES_IN` in `.env`).

