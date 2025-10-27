# Security Guidelines Document

## Overview

This document outlines comprehensive security practices for the Expo React Native Starter Application and corresponding backend services. It covers authentication, data protection, secure coding practices, and compliance requirements.

## Authentication Security

### 1. Password Security

#### 1.1 Password Requirements
- **Minimum Length**: 12 characters
- **Complexity Requirements**:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&*)
- **Password History**: Prevent reuse of last 5 passwords
- **Expiry**: Force password change every 90 days

#### 1.2 Password Storage
```typescript
// Bad: Plaintext storage
AsyncStorage.setItem('password', 'plainTextPassword');

// Good: Hashed storage
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

### 2. Token Management

#### 2.1 JWT Implementation
```typescript
// Good: Secure JWT configuration
const jwtConfig = {
  accessTokenExpiry: '15m',  // Short-lived access token
  refreshTokenExpiry: '7d',   // Longer-lived refresh token
  algorithm: 'HS256',
  issuer: 'your-app-domain',
};

// Good: Token generation
import jwt from 'jsonwebtoken';

export const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: jwtConfig.accessTokenExpiry }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: jwtConfig.refreshTokenExpiry }
  );

  return { accessToken, refreshToken };
};
```

#### 2.2 Token Storage
```typescript
// Good: Secure token storage
import * as Keychain from 'react-native-keychain';

const TOKEN_SERVICE = 'com.yourapp.tokens';

export const secureStorage = {
  async setToken(type: 'access' | 'refresh', token: string): Promise<void> {
    await Keychain.setInternetCredentials(
      TOKEN_SERVICE,
      `${type}Token`,
      token,
      'JWT Token'
    );
  },

  async getToken(type: 'access' | 'refresh'): Promise<string | null> => {
    const credentials = await Keychain.getInternetCredentials(
      TOKEN_SERVICE,
      `${type}Token`,
      'JWT Token'
    );
    return credentials ? credentials.password : null;
  },

  async removeToken(type: 'access' | 'refresh'): Promise<void> => {
    await Keychain.resetInternetCredentials(
      TOKEN_SERVICE,
      `${type}Token`
    );
  },
};
```

#### 2.3 Token Validation
```typescript
// Good: Token validation middleware
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 3. Session Management

#### 3.1 Session Security
- **HTTPS Only**: All authentication requests over HTTPS
- **Secure Cookies**: HttpOnly, Secure, SameSite cookies
- **CSRF Protection**: Implement CSRF tokens for state-changing operations
- **Session Timeout**: Automatic session termination after inactivity

#### 3.2 OAuth Security
```typescript
// Good: OAuth state management
export class OAuthStateManager {
  private state = new Map<string, OAuthState>();

  generateState(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  validateState(state: string, expectedState: string): boolean {
    return state === expectedState && this.state.has(state);
  }
}
```

## API Security

### 1. Request Validation

#### 1.1 Input Sanitization
```typescript
// Good: Input validation and sanitization
import validator from 'validator';

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')  // Remove HTML tags
    .substring(0, 255);   // Limit length
};
```

#### 1.2 SQL Injection Prevention
```typescript
// Good: Parameterized queries
import { Pool } from 'pg';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const values = [id];

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  // Bad: String concatenation
  async findByEmailUnsafe(email: string): Promise<User | null> {
    const query = `SELECT * FROM users WHERE email = '${email}'`;
    return this.pool.query(query);
  }
}
```

### 2. Rate Limiting

#### 2.1 Rate Limiting Implementation
```typescript
// Good: Configurable rate limiting
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  keyGenerator: (req: Request) => string;
}

const rateLimit = require('express-rate-limit');

export const createRateLimit = (config: RateLimitConfig) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.maxRequests,
    message: {
      error: 'Too many requests, please try again later.',
    },
    keyGenerator: (req) => {
      return req.ip || req.connection.remoteAddress;
    },
    skipSuccessfulRequests: config.skipSuccessfulRequests,
  });
};

// Usage examples
const authLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
});

const generalLimiter = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});
```

### 3. CORS Configuration

#### 3.1 Secure CORS Setup
```typescript
// Good: Whitelist-based CORS
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://yourapp.com',
      'https://app.yourapp.com',
      'exp://your-scheme',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(new Error('Not allowed by CORS'));
    }

    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

## Data Protection

### 1. Sensitive Data Handling

#### 1.1 Data Minimization
- **Data Collection**: Only collect necessary user information
- **Purpose Limitation**: Use data only for stated purposes
- **Storage Limitation**: Store only required data locally
- **Data Retention**: Define clear retention policies

#### 1.2 Encryption at Rest
```typescript
// Good: Encrypt sensitive data before storage
import CryptoJS from 'crypto-js';

export class DataEncryption {
  private key: string;

  constructor(secretKey: string) {
    this.key = CryptoJS.SHA256(secretKey).toString();
  }

  encrypt(data: any): string {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), this.key);
    return encrypted.toString();
  }

  decrypt(encryptedData: string): any {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, this.key);
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  }
}
```

### 2. Privacy Compliance

#### 2.1 GDPR Compliance
- **Data Portability**: Users can export their data
- **Right to Erasure**: Complete data deletion on request
- **Consent Management**: Clear consent mechanisms
- **Data Processing Records**: Maintain audit logs
- **Privacy Policy**: Transparent privacy documentation

#### 2.2 Data Handling Guidelines
```typescript
// Good: Privacy-aware data handling
export class PrivacyManager {
  static logDataAccess(userId: string, data: any, purpose: string): void {
    const auditLog = {
      userId,
      timestamp: new Date().toISOString(),
      data: this.sanitizeForLogging(data),
      purpose,
    };

    console.log('Data Access:', auditLog);
  }

  static sanitizeForLogging(data: any): any {
    // Remove sensitive fields before logging
    const { password, ...sanitizedData } = data;
    return sanitizedData;
  }

  static anonymizeData(user: User): User {
    const { email, ...anonymized } = user;

    return {
      ...anonymized,
      email: this.hashEmail(email),
    };
  }
}
```

## Secure Coding Practices

### 1. Code Security

#### 1.1 Dependency Management
```json
// Good: Regular security updates
{
  "scripts": {
    "audit:fix": "npm audit fix",
    "audit:check": "npm audit",
    "security-check": "npm run security-check"
  },
  "dependencies": {
    // Always use specific versions
    "bcrypt": "^5.1.1",
    "helmet": "^7.0.0"
  }
}
```

#### 1.2 Environment Variables
```typescript
// Good: Environment-based configuration
interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production';
  jwtSecret: string;
  databaseUrl: string;
  corsOrigins: string[];
}

const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost/myapp',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || [],
};

export default config;
```

### 2. Error Handling

#### 2.1 Secure Error Messages
```typescript
// Good: Non-revealing error messages
export class ErrorHandler {
  static createSafeError(message: string, isInternal: boolean = true): Error {
    const error = new Error(message);
    error.name = isInternal ? 'InternalError' : 'UserError';

    // Don't expose stack traces to users in production
    if (process.env.NODE_ENV === 'production') {
      error.stack = undefined;
    }

    return error;
  }

  static sanitizeErrorForLogging(error: Error): any {
    return {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };
  }
}
```

## Monitoring and Logging

### 1. Security Logging

#### 1.1 Structured Logging
```typescript
// Good: Structured security logging
interface SecurityLog {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  event: string;
  userId?: string;
  ip: string;
  userAgent: string;
  details: any;
}

export class SecurityLogger {
  static log(event: string, level: SecurityLog['level'], details: any, userId?: string): void {
    const logEntry: SecurityLog = {
      timestamp: new Date().toISOString(),
      level,
      event,
      userId,
      ip: this.getClientIP(),
      userAgent: this.getUserAgent(),
      details,
    };

    console.log(JSON.stringify(logEntry));

    // Also send to external logging service
    this.sendToLogService(logEntry);
  }

  static logAuthAttempt(email: string, success: boolean, ip: string): void {
    this.log(
      success ? 'auth_success' : 'auth_failure',
      success ? 'info' : 'warn',
      { email, success, ip }
    );
  }
}
```

#### 1.2 Monitoring Setup
```typescript
// Good: Security metrics monitoring
export class SecurityMonitor {
  private suspiciousIPs = new Map<string, number>();
  private suspiciousPatterns = [
    /\bunion\b/i,
    /select.*\bfrom\b/i,
    /\bdrop\b.*\btable\b/i,
  ];

  detectSuspiciousActivity(ip: string, userAgent: string, request: any): boolean {
    // Rate limiting check
    const currentCount = this.suspiciousIPs.get(ip) || 0;
    this.suspiciousIPs.set(ip, currentCount + 1);

    // Pattern detection
    const url = request.url || '';
    const lowerUserAgent = userAgent.toLowerCase();

    return this.suspiciousPatterns.some(pattern =>
      pattern.test(url) || pattern.test(lowerUserAgent)
    );
  }

  blockIP(ip: string): void {
    this.suspiciousIPs.set(ip, 999);
    SecurityLogger.log('IP Blocked', 'warn', { ip, reason: 'Suspicious activity' });
  }
}
```

### 2. Incident Response

#### 2.1 Security Incident Response
- **Immediate Isolation**: Block affected accounts/ips
- **Investigation**: Log all details for analysis
- **Notification**: Alert affected users of security incidents
- **Password Reset**: Force password reset for affected users
- **Communication**: Transparent communication about incidents

This security guidelines document provides comprehensive security practices for protecting user data, preventing attacks, and maintaining a secure application environment.