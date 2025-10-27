# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive Expo React Native starter application with modern authentication, internationalization (English/Indonesian), theme support (light/dark), and file-based navigation using Expo Router. The app includes Google OAuth integration, token-based authentication with refresh mechanisms, and a robust component architecture.

## Architecture

- **Entry Point**: `index.ts` - Uses Expo Router entry point with src/app routing
- **Navigation**: `src/app/` directory with file-based routing using Expo Router
- **Source Code**: `src/` directory with organized structure
- **Authentication**: Service-based auth with Expo AuthSession and AsyncStorage for token management
- **Google OAuth**: Integrated Google Sign-In with expo-auth-session
- **Internationalization**: Custom i18n service with English and Indonesian support
- **Theme Management**: Context-based theme system with light/dark mode support

## Project Structure

```
/
├── src/app/                # Expo Router pages (moved from app/)
│   ├── _layout.tsx         # Root layout with navigation
│   ├── index.tsx           # Home screen
│   ├── about.tsx           # About screen
│   ├── settings.tsx        # Settings screen (theme/language)
│   ├── (auth)/             # Authentication route group
│   │   ├── _layout.tsx     # Auth group layout
│   │   ├── login.tsx       # Login screen with Google OAuth
│   │   └── register.tsx    # Registration screen
│   └── (protected)/        # Protected route group
│       ├── _layout.tsx     # Protected group layout
│       └── profile.tsx     # Protected profile screen
├── src/
│   ├── components/         # Reusable components
│   │   ├── ThemedText.tsx  # Theme-aware text component
│   │   ├── ThemedView.tsx  # Theme-aware container component
│   │   ├── Button.tsx      # Reusable button with variants
│   │   ├── TextInput.tsx   # Themed input component
│   │   └── GoogleButton.tsx # Google OAuth button
│   ├── services/           # Business logic and API services
│   │   ├── auth.ts         # Enhanced authentication service
│   │   ├── i18n.ts         # Internationalization service
│   │   └── googleAuth.ts   # Google OAuth service
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   │   └── auth.ts         # Enhanced authentication types
│   └── contexts/           # React contexts
│       └── AppContext.tsx  # Theme and language context
├── documentation/          # Project documentation
│   ├── project_requirements_document.md
│   ├── app_flow_document.md
│   ├── app_flowchart.md
│   ├── backend_structure_document.md
│   ├── frontend_guidelines_document.md
│   ├── security_guideline_document.md
│   ├── starter_tech_stack_document.md
│   └── tech_stack_document.md
├── app.json                # Expo configuration with AuthSession plugin
├── tsconfig.json           # TypeScript configuration with @ alias
├── package.json            # Dependencies and scripts
└── assets/                 # App icons and images
```

## Technology Stack

- **Framework**: Expo SDK ~54.0.20
- **Navigation**: Expo Router (file-based routing) with src/app structure
- **UI Library**: React Native 0.81.5
- **React**: 19.2.0
- **TypeScript**: 5.9.2 with strict mode enabled
- **Authentication**: Expo AuthSession with JWT token management
- **Google OAuth**: expo-auth-session and expo-web-browser integration
- **Internationalization**: Custom i18n service with English/Indonesian support
- **Theme Management**: React Context with system theme detection
- **Storage**: AsyncStorage for token and preference persistence
- **New Architecture**: Enabled (`newArchEnabled: true` in app.json)

## Features

### Authentication

- Login and register with email/password
- Google OAuth integration with secure token exchange
- JWT token management with access/refresh token mechanism
- Protected routes (profile page requires authentication)
- Token-based authentication with AsyncStorage
- API integration with proper header management and error handling
- Automatic token refresh for seamless user experience

### Internationalization

- English and Indonesian language support
- Language switching in settings
- Persistent language preference
- Translation service with type-safe keys

### Theme Support

- Light and dark mode
- System theme detection
- Theme switching in settings
- Persistent theme preference
- All screens adapt to selected theme

### Navigation

- File-based routing with Expo Router in src/app directory
- Route groups for logical organization ((auth) and (protected))
- Stack navigation with proper headers and route guards
- Protected routes implementation with authentication checks
- Clean navigation structure with TypeScript support

## API Integration

The app includes comprehensive integration with authentication APIs:

- **Login**: `POST /api/v1/auth/login` - Email/password authentication
- **Register**: `POST /api/v1/auth/register` - User registration
- **Google OAuth**: Integrated with Google Sign-In for social authentication
- **Token Refresh**: Automatic refresh mechanism for JWT tokens
- **Protected Routes**: API calls include proper authorization headers

### API Specifications

All API requests include:
- Content-Type: application/json
- Language cookie: frontend_lang=en_US; frontend_lang=en_US
- Authorization: Bearer {accessToken} for protected endpoints

Response format:
```json
{
  "traceId": "uuid-trace-id",
  "code": "00",
  "message": "Success message",
  "data": {
    "user": { ... },
    "token": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  }
}
```

Base URL is configurable in `src/services/auth.ts`.

## Development Commands

### Running the Application

- `npm start` - Start Expo development server (starts on all platforms)
- `npm run android` - Start specifically for Android development
- `npm run ios` - Start specifically for iOS development
- `npm run web` - Start for web development

### Project Setup

- Install dependencies: `npm install`

## Key Configuration Details

- **Orientation**: Portrait only
- **Interface Style**: Automatic (adapts to system)
- **Platform Support**: iOS (with tablet support), Android (edge-to-edge enabled), Web
- **TypeScript**: Strict mode enabled, extends expo base configuration with "@" alias for src/
- **Routing**: File-based with Expo Router in src/app directory
- **Authentication**: JWT token-based with AsyncStorage persistence and refresh mechanism
- **Google OAuth**: Expo AuthSession integration with secure token exchange
- **Internationalization**: English/Indonesian with persistent storage
- **Theme**: Light/dark mode with system detection
- **Expo Plugins**: AuthSession plugin configured for OAuth support

## Development Notes

- The app uses the new Expo architecture (`newArchEnabled: true`)
- TypeScript is configured with strict mode for better type safety
- Project structure migrated from app/ to src/app/ with proper routing configuration
- All user preferences (theme, language) are persisted using AsyncStorage
- Authentication state is managed centrally through enhanced services
- The app is production-ready with proper error handling and loading states
- Component structure is modular and reusable with theme integration
- Context providers are properly organized for theme and language management
- Google OAuth integration uses modern Expo AuthSession patterns
- Comprehensive API integration with proper headers and error handling
- Complete documentation suite available in documentation/ folder

## Completed Updates

✅ **Architecture Migration**: Moved from app/ to src/app/ directory structure
✅ **TypeScript Configuration**: Updated tsconfig.json with "@" alias pointing to "src/*"
✅ **Authentication Enhancement**: Implemented Expo AuthSession with JWT token management
✅ **API Integration**: Updated authentication service with new API specifications
✅ **Google OAuth**: Added comprehensive Google Sign-In integration
✅ **Route Organization**: Implemented (auth) and (protected) route groups
✅ **Documentation**: Created comprehensive documentation suite
✅ **Component Architecture**: Enhanced with theme-aware components
✅ **Token Management**: Implemented access/refresh token mechanism
✅ **Error Handling**: Added robust error handling and user feedback

## Documentation

The project includes comprehensive documentation in the `documentation/` folder:

- **project_requirements_document.md**: Complete project specifications and requirements
- **app_flow_document.md**: Detailed user journey flows and state management
- **app_flowchart.md**: Visual flowcharts and sequence diagrams
- **backend_structure_document.md**: API specifications and database schemas
- **frontend_guidelines_document.md**: Development best practices and coding standards
- **security_guideline_document.md**: Security implementation guidelines
- **starter_tech_stack_document.md**: High-level technology overview
- **tech_stack_document.md**: Detailed technology breakdown with versions