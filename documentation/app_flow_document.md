# Application Flow Documentation

## Overview

This document describes the complete user flows and application logic for the Expo React Native Starter Application. It covers all major user journeys from app launch to authenticated usage.

## Application Architecture Flow

### 1. App Initialization Flow

```
App Start → index.tsx → ExpoRoot → src/app/_layout.tsx → Route Resolution
    ↓
Load AsyncStorage → Check for stored tokens → Validate tokens → Set initial state
    ↓
Auth State Loading → Show loading indicator → Determine authentication status → Route to appropriate screen
```

#### Detailed Steps:
1. **App Launch**: Application starts via `index.tsx`
2. **ExpoRoot Initialization**: Sets up Expo Router with context from `src/app/`
3. **Layout Loading**: `_layout.tsx` loads with AppProvider and authentication state
4. **Storage Check**: AsyncStorage is checked for existing tokens
5. **State Determination**: Initial auth state is set based on stored data
6. **Route Decision**: User is routed to login/register or main app

### 2. Authentication Flows

#### 2.1 User Registration Flow

```
Register Screen → Input Validation → API Request → Response Handling → Login Redirect
    ↓
Email/Password Input → Format Validation → POST /api/v1/auth/register → Success/Error → User Registration Complete
    ↓
Name Field → Required Validation → User Creation → Welcome Message → Login Screen
    ↓
Error Handling → Validation Errors → API Errors → Retry Logic → User Feedback
```

**Registration Steps:**
1. **Screen Entry**: User navigates to `/register`
2. **Form Input**: User enters name, email, password
3. **Real-time Validation**:
   - Email format validation
   - Password strength requirements
   - Required field validation
4. **API Submission**:
   ```
   POST /api/v1/auth/register
   Headers: Content-Type: application/json, Cookie: frontend_lang=en_US
   Body: { name, email, password }
   ```
5. **Response Processing**:
   - Success: Parse user data, show success message
   - Error: Display error message from API response
   - Validation: Show field-specific errors
6. **Post-Registration**: Redirect to login screen with success message

#### 2.2 Email Login Flow

```
Login Screen → Credential Input → Validation → API Authentication → Token Storage → Profile Redirect
    ↓
Email/Password → Format Check → POST /api/v1/auth/login → JWT Processing → AsyncStorage → Navigation
    ↓
Validation Errors → Show Error Messages → Retry Logic → Loading States → Success
    ↓
API Response → User Data + Tokens → Secure Storage → Auth State Update → Protected Route Access
```

**Login Steps:**
1. **Screen Entry**: User navigates to `/login`
2. **Credential Input**: Email and password entry with validation
3. **Form Validation**: Email format and required field checks
4. **API Authentication**:
   ```
   POST /api/v1/auth/login
   Headers: Content-Type: application/json, Cookie: frontend_lang=en_US
   Body: { email, password }
   ```
5. **Response Handling**:
   - Parse `{ traceId, code, message, data: { user, token } }`
   - Extract `accessToken` and `refreshToken`
   - Store user information and tokens securely
6. **State Update**: Set authentication state to authenticated
7. **Navigation**: Redirect to protected routes (`/profile`)

#### 2.3 Google OAuth Login Flow

```
Google Login Button → OAuth Flow → Token Exchange → User Info → API Integration → Auth Success
    ↓
Google OAuth → Browser Opening → User Consent → Authorization Code → Access Token
    ↓
Token Exchange → Code → Token Request → Access Token + Refresh Token → User Profile Data
    ↓
Backend Integration → ID Token → User Creation/Login → Local Storage → Auth State → Navigation
```

**Google Login Steps:**
1. **Google Button Click**: User initiates Google OAuth
2. **OAuth Flow**:
   - Open Google OAuth in browser via `expo-web-browser`
   - User authenticates with Google account
   - Receive authorization code
3. **Token Exchange**: Exchange code for access token
4. **User Profile**: Fetch user information from Google APIs
5. **Backend Integration**: Send Google ID token to backend
6. **Local Storage**: Store user data and tokens
7. **Navigation**: Redirect to authenticated routes

### 3. Protected Routes Flow

#### 3.1 Route Guard Logic

```
Route Access → Authentication Check → Token Validation → Route Decision
    ↓
Protected Route → Check Auth State → Token Valid? → Allow Access
    ↓
Expired/Invalid → Refresh Token → Refresh Success? → Update State
    ↓
Refresh Failed → Clear Storage → Set Unauthenticated → Redirect to Login
```

**Route Protection Steps:**
1. **Route Access**: User attempts to access protected route
2. **Auth Check**: Verify current authentication state
3. **Token Validation**: Check if access token exists and is valid
4. **Route Decision**:
   - Authenticated: Allow access to route
   - Unauthenticated: Redirect to login
   - Token Expired: Attempt refresh
5. **Automatic Refresh**: Background token refresh before expiry
6. **Fallback**: If refresh fails, logout and redirect

#### 3.2 Profile Access Flow

```
Profile Screen → Authentication Required → User Data Load → Profile Display
    ↓
Auth Success → Fetch User Data → Display Profile Information → Edit/Logout Options
    ↓
Data Loading → Show Loading → API Calls → Success/Error → User Feedback
```

**Profile Features:**
1. **User Information Display**: Name, email, profile picture
2. **Account Status**: Verification status, role, creation date
3. **Profile Management**: Edit profile, change password options
4. **Logout Function**: Clear tokens, update state, redirect to login

### 4. Settings Flow

#### 4.1 Theme Management

```
Settings Screen → Theme Selection → System Detection → Theme Application → Storage & UI Update
    ↓
Theme Options → Light/Dark/System → Apply Theme → Update Components → Persist Preference
    ↓
System Theme → Device Settings → Auto Apply → Real-time UI Changes → No Restart Required
```

**Theme Flow:**
1. **Current Theme Display**: Show active theme (light/dark/system)
2. **Theme Selection**: User chooses from available options
3. **System Detection**: Auto-detect device theme if "system" selected
4. **Theme Application**: Apply colors and styles to all components
5. **Persistence**: Save theme preference to AsyncStorage
6. **Real-time Updates**: Update UI without app restart
7. **Status Bar**: Update status bar to match theme

#### 4.2 Language Management

```
Language Settings → Language Selection → Translation Loading → App-wide Translation → Storage
    ↓
Language Options → English/Indonesian → Load Translation Files → Update All Text → Persist Choice
    ↓
Device Detection → First Launch → Auto-select → Fallback to English → User Override
```

**Language Flow:**
1. **Current Language**: Display active language
2. **Language Selection**: User picks English or Indonesian
3. **Translation Loading**: Load appropriate translation file
4. **App-wide Update**: Update all text elements immediately
5. **Persistence**: Save language preference to AsyncStorage
6. **Future Launches**: Use saved language on subsequent app starts

### 5. Error Handling & Recovery Flows

#### 5.1 Network Error Handling

```
API Request → Network Error → Retry Logic → User Notification → Fallback Behavior
    ↓
Connection Lost → Retry Exponential Backoff → Show Offline Indicator → Queue Requests
    ↓
API Unavailable → Local Fallback → Cached Data → Graceful Degradation → User Feedback
```

#### 5.2 Authentication Error Recovery

```
Auth Failure → Error Analysis → User Notification → Recovery Options
    ↓
Invalid Credentials → Clear Form → Show Error Message → Retry Logic
    ↓
Token Expired → Automatic Refresh → Refresh Success/Failure → Logout on Failure
    ↓
Account Locked → Show Lock Screen → Support Contact → App Restriction
```

### 6. State Management Flow

#### 6.1 Authentication State

```
Auth Service → State Updates → Listener Notifications → Component Re-renders
    ↓
Login Event → Set User Data → Store Tokens → Notify Subscribers → UI Updates
    ↓
Logout Event → Clear User Data → Remove Tokens → Update State → Navigate to Login
```

#### 6.2 Theme State

```
Theme Context → Theme Change → System Detection → Component Updates → Persistence
    ↓
Theme Selection → Color Palette Update → Component Styling → UI Refresh → Storage Save
```

#### 6.3 Language State

```
i18n Service → Language Change → Translation Load → Context Update → App-wide Update
    ↓
Language Selection → Translation Keys → Text Updates → Component Re-render → Preference Save
```

## Integration Points

### 1. API Integration Points
- **Authentication Service**: Centralized auth logic and token management
- **API Client**: HTTP client with interceptors and error handling
- **Storage Service**: AsyncStorage wrapper for data persistence
- **Error Handling**: Centralized error processing and user feedback

### 2. Navigation Integration
- **Route Guards**: Authentication-based route protection
- **Deep Linking**: URL-based navigation support
- **Tab Navigation**: Bottom tab routing structure
- **Stack Navigation**: Hierarchical screen navigation

### 3. UI Integration
- **Theme System**: Global theme context and component theming
- **Component Library**: Reusable, themed UI components
- **Form Handling**: Input validation and error display
- **Loading States**: Consistent loading indicators

## Performance Considerations

### 1. Route Optimization
- **Lazy Loading**: Load routes only when accessed
- **Code Splitting**: Separate bundles for different features
- **Preloading**: Preload critical routes for better performance
- **Memory Management**: Proper cleanup of unused components

### 2. Data Management
- **Caching Strategy**: Cache frequently accessed data
- **Background Sync**: Sync data when network is available
- **Offline Support**: Basic functionality without network
- **Storage Optimization**: Efficient AsyncStorage usage

### 3. User Experience
- **Loading States**: Smooth transitions with loading indicators
- **Error Boundaries**: Graceful error handling
- **Animation Performance**: 60fps smooth animations
- **Responsive Design**: Optimize for different screen sizes

This application flow documentation provides a comprehensive understanding of how users interact with the application and how different systems work together to provide a seamless user experience.