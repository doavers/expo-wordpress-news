# Application Flow Chart

## Mermaid Flowchart

### Complete Application Flow

```mermaid
graph TD
    A[App Start] --> B{Auth State Check}
    B -->|Authenticated| C[Load Protected Routes]
    B -->|Not Authenticated| D[Load Login/Register]

    C --> E[Home Screen]
    C --> F[About Screen]
    C --> G[Settings Screen]
    C --> H[Profile Screen]
    C --> I[Logout Flow]

    D --> J[Login Screen]
    D --> K[Register Screen]

    J --> L{Login Method}
    L -->|Email/Password| M[Credential Input]
    L -->|Google OAuth| N[Google Authentication]

    M --> O[Validation Check]
    O -->|Valid| P[API Login Request]
    O -->|Invalid| Q[Show Validation Errors]

    N --> R[Google OAuth Flow]
    R --> S[User Consent]
    S --> T[Authorization Code]
    T --> U[Token Exchange]
    U --> V[User Profile Data]

    P --> W[Login API Response]
    W -->|Success| X[Store Tokens + User Data]
    W -->|Failure| Y[Show Error Message]

    X --> Z[Update Auth State]
    Y --> AA[Retry Logic]
    Z --> AAA[Navigate to Profile]

    AA --> AB{Continue Attempts}
    AB -->|Yes| M
    AB -->|No| AC[Show Error & Give Up]

    AAA --> H
    AC --> AD[Show Final Error]
    AD --> AE[Return to Login]

    V --> AF[Backend Integration]
    AF --> AG[Token Verification]
    AG --> AH[User Registration/Login]
    AH --> AAA

    Q --> M
    AA --> M

    K --> AI[Registration Form]
    AI --> AJ[Registration Validation]
    AJ --> AK[API Registration Request]
    AK -->|Success| AL[Show Registration Success]
    AK -->|Failure| AM[Show Registration Errors]

    AL --> AN[Redirect to Login]
    AM --> M
    AN --> AO[Show Success Message]
    AO --> AO --> P
    AM --> M

    G --> AP[Theme Selection]
    G --> AQ[Language Selection]
    AP --> AR[Apply Theme]
    AQ --> AS[Update Language]

    H --> AT[Profile Management]
    AT --> AU[Edit Profile]
    AT --> AV[Change Password]
    AT --> AW[Delete Account]

    I --> AX[Clear Storage]
    AX --> AY[Update Auth State]
    AY --> AZ[Redirect to Login]
    AZ --> D

    AR --> BA[Update Components]
    AS --> BB[Update All Text]

    BA --> BC[Persist Theme]
    BB --> BD[Persist Language]

    style A fill:#e1f5fe
    style B fill:#f3f9ff
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#e8f5e8
    style F fill:#e8f5e8
    style G fill:#e8f5e8
    style H fill:#e8f5e8
    style I fill:#ffebee
    style J fill:#fff3e0
    style K fill:#fff3e0
    style L fill:#fff3e0
    style M fill:#fff3e0
    style N fill:#fff3e0
    style O fill:#fff3e0
    style P fill:#fff3e0
    style Q fill:#fff3e0
    style R fill:#e3f2fd
    style S fill:#e3f2fd
    style T fill:#e3f2fd
    style U fill:#e3f2fd
    style V fill:#e3f2fd
    style W fill:#fff3e0
    style X fill:#fff3e0
    style Y fill:#fff3e0
    style Z fill:#e8f5e8
    style AA fill:#fff3e0
    style AB fill:#fff3e0
    style AC fill:#fff3e0
    style AD fill:#fff3e0
    style AE fill:#fff3e0
    style AF fill:#fff3e0
    style AG fill:#fff3e0
    style AH fill:#fff3e0
    style AI fill:#fff3e0
    style AJ fill:#fff3e0
    style AK fill:#fff3e0
    style AL fill:#fff3e0
    style AM fill:#fff3e0
    style AN fill:#fff3e0
    style AO fill:#fff3e0
    style AP fill:#fff3e0
    style AQ fill:#fff3e0
    style AR fill:#fff3e0
    style AS fill:#fff3e0
    style AT fill:#fff3e0
    style AU fill:#fff3e0
    style AV fill:#fff3e0
    style AW fill:#fff3e0
    style AX fill:#ffebee
    style AY fill:#fff3e0
    style AZ fill:#fff3e0
    style BA fill:#fff3e0
    style BB fill:#fff3e0
    style BD fill:#fff3e0
```

### User Journey State Machines

#### Authentication State Machine

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    Unauthenticated --> Registering : Register Click
    Unauthenticated --> LoggingIn : Login Click
    Unauthenticated --> GoogleAuth : Google Login Click

    Registering --> RegisterSuccess : Registration Complete
    Registering --> RegisterError : Registration Failed
    RegisterSuccess --> LoggingIn : Login Required
    RegisterError --> Unauthenticated : Retry

    LoggingIn --> Authenticated : Login Success
    LoggingIn --> LoginError : Login Failed
    LoginError --> Unauthenticated : Retry

    GoogleAuth --> Authenticated : Google Success
    GoogleAuth --> LoginError : Google Failed

    Authenticated --> ProfileView : Profile Access
    Authenticated --> SettingsView : Settings Access
    Authenticated --> HomeView : Home Access

    Authenticated --> Unauthenticated : Logout
    ProfileView --> Authenticated : Back to App
    SettingsView --> Authenticated : Back to App
    HomeView --> Authenticated : Back to App
```

### Navigation Flow

```mermaid
graph LR
    subgraph Authentication Routes
        Login[Login Screen]
        Register[Register Screen]
    end

    subgraph Protected Routes
        Home[Home Screen]
        Profile[Profile Screen]
        Settings[Settings Screen]
        About[About Screen]
    end

    Login -->|Login Success| Protected Routes
    Register -->|Register Success| Protected Routes

    Protected Routes -->|Logout| Authentication Routes
```

### Data Flow Architecture

```mermaid
graph TD
    subgraph Frontend
        A[User Interface]
        B[Authentication Service]
        C[Theme Context]
        D[i18n Service]
        E[AsyncStorage]
    end

    subgraph Backend API
        F[Authentication Endpoints]
        G[User Management]
        H[Token Refresh]
    end

    A --> B
    B -->|Login/Register| F
    B -->|Protected Routes| G
    B -->|Theme/Language| C
    B -->|Token Storage| E

    F -->|Success| B
    F -->|Error| A
    H -->|Token Validity| B
```

### Error Handling Flow

```mermaid
graph TD
    A[User Action] --> B{Network Available}
    B -->|Yes| C[API Request]
    B -->|No| D[Show Offline Message]

    C --> E{Response Status}
    E -->|Success| F[Update State & Navigate]
    E -->|Client Error| G[Show Validation Errors]
    E -->|Server Error| H[Show API Errors]
    E -->|Network Error| I[Show Network Errors]

    D --> J[Queue Request]
    J -->|Network Available| C

    G --> K[Retry Logic]
    H --> K
    I --> K

    K --> L{Retry Attempts}
    L -->|Yes| C
    L -->|No| M[Show Final Error]

    M --> N[Return to Login]
```

### Component Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as User Interface
    participant Auth as Auth Service
    participant API as Backend API
    participant Storage as AsyncStorage

    User->>UI: Opens Login Screen
    UI->>User: Shows Email/Password fields
    User->>UI: Enters credentials
    UI->>Auth: Validates form input
    Auth->>API: POST /api/v1/auth/login
    API-->>Auth: Returns {user, token}
    Auth->>Storage: Stores user data + tokens
    Auth->>UI: Updates authentication state
    UI->>User: Navigates to Profile
    UI->>Auth: Requests auth state
    Auth->>Storage: Retrieves stored data
    Storage-->>Auth: Returns user + tokens
    Auth-->>UI: Provides current state

    User->>UI: Clicks Logout
    UI->>Auth: Calls logout()
    Auth->>Storage: Clears all stored data
    Auth->>UI: Updates to unauthenticated
    UI->>User: Redirects to Login
```

## Key Decision Points

### 1. Authentication Decisions
- **Route Protection**: Check auth state before allowing protected route access
- **Token Validity**: Validate token expiration and refresh if needed
- **Method Selection**: Choose between email/password and Google OAuth
- **Error Recovery**: Retry logic with exponential backoff

### 2. Navigation Decisions
- **Deep Linking**: Handle URL-based navigation to specific routes
- **Tab vs Stack**: Use appropriate navigator for content type
- **Authentication Flow**: Separate auth flows from main app navigation
- **State-Based Routing**: Dynamic route rendering based on auth state

### 3. Data Management Decisions
- **Persistence Strategy**: What data to store locally vs fetch from API
- **Cache Invalidation**: When to clear cached data
- **Offline Support**: What functionality to provide without network
- **Sync Strategy**: When and how to sync data with backend

### 4. User Experience Decisions
- **Loading States**: Where to show loading indicators
- **Error Messages**: How to present errors to users
- **Success Feedback**: How to confirm successful actions
- **Progressive Enhancement**: Load features progressively for better performance

## Flow Optimization Strategies

### 1. Route Preloading
- Preload critical routes in background
- Cache route components for faster navigation
- Implement skeleton screens for better perceived performance

### 2. State Management
- Minimize re-renders with proper state design
- Use memoization for expensive calculations
- Implement proper cleanup in useEffect hooks

### 3. Network Optimization
- Implement request deduplication
- Cache frequently accessed data
- Use connection pooling for API requests

### 4. Error Recovery
- Implement automatic retry logic
- Provide offline fallbacks
- Graceful degradation for network issues

This flowchart documentation provides a comprehensive visual and textual representation of how the application handles user interactions, data flows, and state management throughout the user journey.