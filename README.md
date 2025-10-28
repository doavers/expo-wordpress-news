# Expo React Native Starter App

A comprehensive Expo React Native starter application with modern authentication, internationalization (English/Indonesian), theme support (light/dark), and file-based navigation using Expo Router. The app includes Google OAuth integration, token-based authentication with refresh mechanisms, and a robust component architecture.

## 🚀 Features

- **🔐 Authentication**
  - Login and register with email/password
  - Google OAuth integration with secure token exchange
  - JWT token management with access/refresh token mechanism
  - Protected routes (profile page requires authentication)
  - Token-based authentication with AsyncStorage
  - API integration with proper header management and error handling
  - Automatic token refresh for seamless user experience

- **🌍 Internationalization**
  - English and Indonesian language support
  - Language switching in settings
  - Persistent language preference
  - Translation service with type-safe keys

- **🎨 Theme Support**
  - Light and dark mode
  - System theme detection
  - Theme switching in settings
  - Persistent theme preference
  - All screens adapt to selected theme

- **🧭 Navigation**
  - File-based routing with Expo Router in src/app directory
  - Route groups for logical organization ((auth) and (protected))
  - Stack navigation with proper headers and route guards
  - Protected routes implementation with authentication checks
  - Clean navigation structure with TypeScript support

## 📱 Technology Stack

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

## 🏗️ Project Structure

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
├── app.json                # Expo configuration with AuthSession plugin
├── tsconfig.json           # TypeScript configuration with @ alias
├── package.json            # Dependencies and scripts
└── assets/                 # App icons and images
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (optional, can be installed globally)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd expo-starter-app
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the Expo development server:
```bash
npm start
```

Or start for specific platforms:
```bash
npm run android    # Start for Android development
npm run ios        # Start for iOS development
npm run web        # Start for web development
```

### Using the App

1. **Home Screen**: View the landing page with navigation options
2. **Authentication**: Navigate to login/register screens for authentication
3. **Google Sign-In**: Use Google OAuth for quick authentication
4. **Protected Routes**: Access protected profile screen after authentication
5. **Settings**: Switch between light/dark themes and English/Indonesian languages

## 🔧 Configuration

### Environment Variables

Update the API configuration in `src/services/auth.ts`:

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-api-domain.com';
```

### Google OAuth Setup

1. Configure your Google OAuth client ID in the app.json
2. Update the redirect URI in Google Console to match your Expo configuration
3. The Google OAuth service is ready to use with the GoogleButton component

### API Integration

The app includes comprehensive integration with authentication APIs:

- **Login**: `POST /api/v1/auth/login` - Email/password authentication
- **Register**: `POST /api/v1/auth/register` - User registration
- **Google OAuth**: Integrated with Google Sign-In for social authentication
- **Token Refresh**: Automatic refresh mechanism for JWT tokens
- **Protected Routes**: API calls include proper authorization headers

#### API Request Format

All API requests include:
- Content-Type: application/json
- Language cookie: frontend_lang=en_US; frontend_lang=en_US
- Authorization: Bearer {accessToken} for protected endpoints

#### API Response Format

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

## 🎨 Customization

### Adding New Screens

1. Create new screen files in `src/app/` directory
2. Follow the file-based naming convention for automatic routing
3. Use the existing themed components for consistent styling

### Adding New Languages

1. Update the translation keys in `src/services/i18n.ts`
2. Add the new language option to the settings screen
3. The i18n service will handle the new language automatically

### Custom Theme Colors

Update the theme colors in `src/contexts/AppContext.tsx` to customize the light and dark theme appearances.

## 📚 Documentation

The project includes comprehensive documentation in the `documentation/` folder:

- **project_requirements_document.md**: Complete project specifications and requirements
- **app_flow_document.md**: Detailed user journey flows and state management
- **app_flowchart.md**: Visual flowcharts and sequence diagrams
- **backend_structure_document.md**: API specifications and database schemas
- **frontend_guidelines_document.md**: Development best practices and coding standards
- **security_guideline_document.md**: Security implementation guidelines
- **starter_tech_stack_document.md**: High-level technology overview
- **tech_stack_document.md**: Detailed technology breakdown with versions

## 🔧 Development Commands

```bash
npm start              # Start Expo development server
npm run android        # Start for Android development
npm run ios            # Start for iOS development
npm run web            # Start for web development
npm run build          # Build for production
npm run test           # Run tests
```

## 📱 Platform Support

- **iOS**: Supported with tablet support
- **Android**: Edge-to-edge enabled
- **Web**: Fully supported
- **Orientation**: Portrait only
- **Interface Style**: Automatic (adapts to system)

## 🛠️ Key Features Implementation

### Authentication Flow

1. User enters credentials or uses Google Sign-In
2. JWT tokens (access + refresh) are stored in AsyncStorage
3. Protected routes check authentication status
4. Automatic token refresh for seamless experience
5. API calls include proper authorization headers

### Theme Management

- System theme detection on app start
- Manual theme switching in settings
- Persistent theme preference
- All components adapt to selected theme

### Internationalization

- English and Indonesian language support
- Language switching in settings
- Persistent language preference
- Type-safe translation keys

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the comprehensive documentation in the `documentation/` folder
2. Review the existing code structure and comments
3. Ensure all dependencies are properly installed
4. Verify your environment configuration

---

**Built with ❤️ using Expo, React Native, and TypeScript**