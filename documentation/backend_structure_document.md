# Backend Structure Document

## Overview

This document outlines the recommended backend architecture for supporting the Expo React Native Starter Application. The backend should provide RESTful APIs for authentication, user management, and support for the frontend features.

## Project Structure

```
backend/
├── src/
│   ├── controllers/           # Request handlers and business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── profileController.js
│   ├── middleware/            # Request processing and validation
│   │   ├── auth.js           # Authentication middleware
│   │   ├── validation.js     # Input validation middleware
│   │   ├── errorHandler.js   # Error handling middleware
│   │   └── rateLimit.js     # Rate limiting middleware
│   ├── models/              # Database models and schemas
│   │   ├── User.js           # User data model
│   │   ├── Token.js          # Token/Session model
│   │   └── Role.js           # User role model
│   ├── routes/              # API route definitions
│   │   ├── auth.js           # Authentication routes
│   │   ├── users.js          # User management routes
│   │   └── profile.js       # Profile management routes
│   ├── services/            # Business logic services
│   │   ├── authService.js   # Authentication business logic
│   │   ├── emailService.js  # Email sending service
│   │   ├── tokenService.js  # JWT token management
│   │   └── userService.js  # User data management
│   ├── utils/               # Utility functions
│   │   ├── validation.js    # Input validation helpers
│   │   ├── encryption.js    # Password encryption utilities
│   │   ├── logger.js       # Logging utilities
│   │   └── helpers.js      # General helper functions
│   ├── config/              # Configuration files
│   │   ├── database.js      # Database configuration
│   │   ├── jwt.js          # JWT configuration
│   │   ├── email.js         # Email service config
│   │   └── cors.js         # CORS configuration
│   └── app.js               # Express app setup
├── tests/                   # Test files
│   ├── unit/              # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/               # End-to-end tests
├── docs/                   # API documentation
├── package.json             # Dependencies and scripts
├── .env.example            # Environment variables template
└── README.md               # Project documentation
```

## API Endpoints Specification

### 1. Authentication Endpoints

#### 1.1 User Registration
```
POST /api/v1/auth/register
Content-Type: application/json
Cookie: frontend_lang=en_US; frontend_lang=en_US

Request Body:
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}

Success Response (201):
{
  "traceId": "uuid-trace-id",
  "code": "00",
  "message": "Register success",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "emailVerified": false,
      "image": null,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  }
}

Error Response (400/422/500):
{
  "traceId": "uuid-trace-id",
  "code": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "errors": {
    "email": "Please provide a valid email address"
  }
}
```

#### 1.2 User Login
```
POST /api/v1/auth/login
Content-Type: application/json
Cookie: frontend_lang=en_US; frontend_lang=en_US

Request Body:
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}

Success Response (200):
{
  "traceId": "uuid-trace-id",
  "code": "00",
  "message": "Login success",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "emailVerified": true,
      "image": "https://example.com/avatar.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "role": "user",
      "banned": null,
      "banReason": null,
      "banExpires": null
    },
    "token": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}

Error Response (401/422/500):
{
  "traceId": "uuid-trace-id",
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "errors": {
    "credentials": "Email or password is incorrect"
  }
}
```

#### 1.3 Token Refresh
```
POST /api/v1/auth/refresh
Content-Type: application/json
Authorization: Bearer jwt-refresh-token
Cookie: frontend_lang=en_US; frontend_lang=en_US

Request Body:
{
  "refreshToken": "jwt-refresh-token"
}

Success Response (200):
{
  "traceId": "uuid-trace-id",
  "code": "00",
  "message": "Token refresh success",
  "data": {
    "token": {
      "accessToken": "new-jwt-access-token",
      "refreshToken": "new-jwt-refresh-token"
    }
  }
}

Error Response (401):
{
  "traceId": "uuid-trace-id",
  "code": "INVALID_REFRESH_TOKEN",
  "message": "Invalid or expired refresh token"
}
```

#### 1.4 User Logout
```
POST /api/v1/auth/logout
Authorization: Bearer jwt-access-token
Cookie: frontend_lang=en_US; frontend_lang=en_US

Success Response (200):
{
  "traceId": "uuid-trace-id",
  "code": "00",
  "message": "Logout success"
}
```

### 2. User Management Endpoints

#### 2.1 Get User Profile
```
GET /api/v1/users/profile
Authorization: Bearer jwt-access-token
Cookie: frontend_lang=en_US; frontend_lang=en_US

Success Response (200):
{
  "traceId": "uuid-trace-id",
  "code": "00",
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "john.doe@example.com",
      "name": "John Doe",
      "emailVerified": true,
      "image": "https://example.com/avatar.jpg",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z",
      "role": "user",
      "banned": null,
      "banReason": null,
      "banExpires": null
    }
  }
}
```

#### 2.2 Update User Profile
```
PUT /api/v1/users/profile
Authorization: Bearer jwt-access-token
Content-Type: application/json
Cookie: frontend_lang=en_US; frontend_lang=en_US

Request Body:
{
  "name": "John Updated",
  "image": "https://example.com/new-avatar.jpg"
}

Success Response (200):
{
  "traceId": "uuid-trace-id",
  "code": "00",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      // Updated user object
    }
  }
}
```

#### 2.3 Change Password
```
PUT /api/v1/users/password
Authorization: Bearer jwt-access-token
Content-Type: application/json
Cookie: frontend_lang=en_US; frontend_lang=en_US

Request Body:
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}

Success Response (200):
{
  "traceId": "uuid-trace-id",
  "code": "00",
  "message": "Password changed successfully"
}
```

### 3. Google OAuth Integration

#### 3.1 Google OAuth Verification
```
POST /api/v1/auth/google
Content-Type: application/json
Cookie: frontend_lang=en_US; frontend_lang=en_US

Request Body:
{
  "idToken": "google-oauth-id-token"
}

Success Response (200):
{
  "traceId": "uuid-trace-id",
  "code": "00",
  "message": "Google authentication successful",
  "data": {
    "user": {
      // User object created/updated from Google data
    },
    "token": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}

Error Response (401):
{
  "traceId": "uuid-trace-id",
  "code": "INVALID_GOOGLE_TOKEN",
  "message": "Invalid Google ID token"
}
```

## Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  email_verified BOOLEAN DEFAULT false,
  image TEXT,
  role VARCHAR(50) DEFAULT 'user',
  banned BOOLEAN DEFAULT false,
  ban_reason TEXT,
  ban_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  google_id VARCHAR(255),
  refresh_token_hash VARCHAR(255)
);
```

### 2. Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_revoked BOOLEAN DEFAULT false
);
```

## Security Implementation

### 1. Authentication Security
- **Password Hashing**: Use bcrypt with minimum 12 rounds
- **JWT Security**: Short-lived access tokens (15min), long-lived refresh tokens (7days)
- **Rate Limiting**: 5 login attempts per 15 minutes per IP
- **Account Lockout**: Temporary lock after 5 failed attempts (30min)
- **Session Management**: Invalidate all user tokens on logout

### 2. API Security
- **HTTPS Only**: Enforce TLS 1.2+ encryption
- **CORS Configuration**: Whitelist allowed origins
- **Input Validation**: Sanitize all inputs against XSS/SQL injection
- **Rate Limiting**: Apply to all endpoints (different limits per endpoint)
- **Logging**: Comprehensive request/response logging with trace IDs

### 3. Data Protection
- **Encryption**: Encrypt sensitive data at rest
- **Data Minimization**: Only collect necessary user data
- **Privacy Compliance**: GDPR-ready data handling
- **Audit Logging**: Track all data access and changes

## Error Handling Standards

### 1. Response Format
- **Consistent Structure**: All responses follow same format
- **Trace ID**: Unique identifier for debugging
- **Error Codes**: Standardized error code system
- **HTTP Status**: Appropriate HTTP status codes
- **Error Messages**: User-friendly, potentially translated

### 2. Common Error Codes
- `VALIDATION_ERROR`: Input validation failed (422)
- `INVALID_CREDENTIALS`: Auth credentials incorrect (401)
- `ACCOUNT_LOCKED`: Account temporarily locked (423)
- `INVALID_TOKEN`: JWT token invalid (401)
- `TOKEN_EXPIRED`: JWT token expired (401)
- `RATE_LIMIT_EXCEEDED`: Too many requests (429)
- `INTERNAL_ERROR`: Server error (500)

## Performance Considerations

### 1. Database Optimization
- **Indexing**: Proper indexes on email, user ID, token fields
- **Connection Pooling**: Reuse database connections
- **Query Optimization**: Efficient queries with proper EXPLAIN plans
- **Caching**: Redis for frequently accessed data

### 2. API Performance
- **Response Time**: Target <200ms for 95th percentile
- **Compression**: gzip response compression
- **Rate Limiting**: Prevent abuse while allowing legitimate use
- **Monitoring**: Comprehensive performance metrics

This backend structure document provides a comprehensive foundation for implementing the required API services to support the Expo React Native starter application.