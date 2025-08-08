# Postman Testing Guide for Hadith Learning Platform API

## Authentication Flow

### 1. Login to Get JWT Token

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers: 
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItaWQiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxNjM1MTczNjkwfQ.example"
}
```

### 2. Use Token for Protected Endpoints

**Request:**
- Method: `GET`
- URL: `http://localhost:5000/api/courses`
- Headers:
  - `Authorization: Bearer <your-token-from-step-1>`
  - `Content-Type: application/json`

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItaWQiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxNjM1MTczNjkwfQ.example
```

## Postman Setup Tips

### 1. Environment Variables (Recommended)
1. Create a new environment in Postman
2. Add variable: `baseUrl` = `http://localhost:5000/api`
3. Add variable: `authToken` = (leave empty initially)
4. Use `{{baseUrl}}/auth/login` and `{{baseUrl}}/courses` in your requests

### 2. Automatic Token Setting
After login, you can use a test script to automatically set the token:

```javascript
// In the login request's "Tests" tab:
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("authToken", response.token);
    console.log("Token saved:", response.token);
}
```

Then in your courses request, use:
```
Authorization: Bearer {{authToken}}
```

### 3. Common Issues

**Error: "No token provided"**
- Make sure you're including the `Authorization` header
- Ensure the token format is correct: `Bearer <token>`
- Check that the token hasn't expired

**Error: "Invalid token"**
- The token might be expired (tokens expire after 7 days)
- The token might be malformed
- Try logging in again to get a fresh token

## Testing Other Protected Endpoints

All endpoints that require authentication follow the same pattern:

- `/api/courses` - Get all courses
- `/api/auth/user` - Get current user info
- `/api/courses/:id` - Get specific course
- Any other endpoint with `isAuthenticated` middleware

## Registration (Alternative to Login)

If you need to create a new user:

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "user": {
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student"
  }
}
```

This will also return a token that you can use for subsequent requests.
