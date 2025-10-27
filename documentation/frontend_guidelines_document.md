# Frontend Development Guidelines Document

## Overview

This document provides comprehensive guidelines for developing the frontend of the Expo React Native Starter Application. It covers coding standards, best practices, and architectural patterns to ensure consistency and maintainability.

## Project Architecture Guidelines

### 1. Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ThemedText.tsx    # Theme-aware text component
│   ├── ThemedView.tsx    # Theme-aware view component
│   ├── Button.tsx        # Reusable button component
│   ├── TextInput.tsx     # Reusable input component
│   └── GoogleButton.tsx   # Google sign-in button
├── services/            # Business logic and API services
│   ├── auth.ts           # Authentication service
│   ├── i18n.ts           # Internationalization service
│   └── googleAuth.ts     # Google OAuth service
├── types/              # TypeScript type definitions
│   └── auth.ts           # Authentication types
├── contexts/            # React contexts
│   └── AppContext.tsx    # Theme and language context
├── utils/               # Utility functions
└── app/                 # Expo Router pages
    ├── _layout.tsx       # Root layout
    ├── (auth)/           # Authentication route group
    ├── (protected)/       # Protected route group
    └── [screens].tsx      # Page components
```

### 2. Component Architecture
- **Atomic Components**: Single responsibility principle
- **Composition Over Inheritance**: Prefer composition patterns
- **Prop Interfaces**: TypeScript interfaces for all component props
- **Theme Awareness**: All components must support light/dark themes
- **Responsive Design**: Components adapt to different screen sizes

### 3. State Management
- **Context Usage**: Use React Context for global state (theme, language, auth)
- **Local State**: Use useState for component-specific state
- **Async State**: Use useEffect for async operations
- **State Lifting**: Lift state up when needed, avoid prop drilling

## Coding Standards

### 1. TypeScript Guidelines

#### 1.1 Type Definitions
```typescript
// Good: Explicit interfaces
interface User {
  id: string;
  email: string;
  name?: string;
}

// Good: Union types for limited values
type Theme = 'light' | 'dark' | 'system';

// Good: Generic components with type parameters
interface ThemedProps<T = {}> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

// Avoid: Any types
// Bad: any
function processData(data: any): any { }
```

#### 1.2 Component Props
```typescript
// Good: Proper interface definition
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
}

// Good: Default props with proper typing
const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  children,
}) => {
  // Component implementation
};
```

### 2. React Best Practices

#### 2.1 Component Design
```typescript
// Good: Functional components with hooks
const MyComponent: React.FC<MyProps> = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    // Side effects
  }, [dependency]);

  return (
    <View>
      {/* JSX content */}
    </View>
  );
};

// Good: Memoization for expensive computations
const ExpensiveComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  return <>{processedData}</>;
});
```

#### 2.2 Custom Hooks
```typescript
// Good: Custom hooks for reusable logic
const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const login = useCallback(async (credentials) => {
    // Login logic
  }, []);

  return { authState, login, logout };
};
```

### 3. Styling Guidelines

#### 3.1 StyleSheet Usage
```typescript
// Good: StyleSheet at component level
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

// Use in component:
<View style={styles.container}>
  <Text style={styles.text}>Hello</Text>
</View>
```

#### 3.2 Theme Integration
```typescript
// Good: Theme-aware components
const ThemedText: React.FC<ThemedTextProps> = ({ style, ...props }) => {
  const { themeState } = useAppContext();

  return (
    <Text
      style={[
        { color: themeState.colors.text },
        style
      ]}
      {...props}
    />
  );
};

// Good: Dynamic theming
const getButtonStyles = (theme: Theme) => ({
  button: {
    backgroundColor: theme.colors.primary,
  },
  text: {
    color: theme.colors.buttonText,
  },
});
```

## Navigation Guidelines

### 1. Expo Router Best Practices

#### 1.1 Route Organization
```typescript
// Good: Route groups for logical organization
app/
├── (auth)/           # Authentication routes
│   ├── login.tsx
│   └── register.tsx
├── (protected)/       # Protected routes
│   └── profile.tsx
├── _layout.tsx        # Root layout
├── index.tsx          # Home screen
└── settings.tsx       # Settings screen
```

#### 1.2 Navigation Implementation
```typescript
// Good: Programmatic navigation
import { router } from 'expo-router';

const handleLogin = async () => {
  await authService.login(credentials);
  router.replace('/profile'); // Replace to clear history
};

const handleBack = () => {
  router.back(); // Go back in history
};

// Good: Safe navigation
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  return <>{children}</>;
};
```

## Component Library Guidelines

### 1. Reusable Components

#### 1.1 Button Component
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
}) => {
  const { themeState } = useAppContext();

  const buttonStyle = {
    backgroundColor: loading || disabled
      ? themeState.colors.border
      : variant === 'primary'
        ? themeState.colors.primary
        : variant === 'danger'
          ? themeState.colors.error
          : 'transparent',
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={themeState.colors.buttonText} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <ThemedText style={styles.text}>{title}</ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
};
```

#### 1.2 Input Component
```typescript
interface ThemedTextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export const ThemedTextInput: React.FC<ThemedTextInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  ...props
}) => {
  const { themeState } = useAppContext();

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={styles.label}>{label}</ThemedText>
      )}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error ? themeState.colors.error : themeState.colors.border,
            backgroundColor: themeState.colors.card,
            color: themeState.colors.text,
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={themeState.colors.textSecondary}
        {...props}
      />
      {error && (
        <ThemedText style={[
          styles.error,
          { color: themeState.colors.error }
        ]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};
```

## Performance Guidelines

### 1. Rendering Optimization

#### 1.1 List Optimization
```typescript
// Good: FlatList for large datasets
const UserList: React.FC<UserListProps> = ({ users }) => {
  const renderItem = useCallback(({ item }) => (
    <UserListItem user={item} />
  ), []);

  return (
    <FlatList
      data={users}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
      })}
      removeClippedSubviews={true}
    />
  );
};

// Good: Memoization for expensive items
const UserListItem = React.memo<{ user: User }> = ({ user }) => {
  return (
    <View>
      <ThemedText>{user.name}</ThemedText>
    </View>
  );
};
```

#### 1.2 Image Optimization
```typescript
// Good: Image caching and optimization
const OptimizedImage: React.FC<ImageProps> = ({ source, style, ...props }) => {
  return (
    <Image
      source={source}
      style={style}
      cachePolicy="memory-disk"
      resizeMode="cover"
      {...props}
    />
  );
};
```

### 2. Memory Management

#### 2.1 Component Cleanup
```typescript
// Good: Cleanup side effects
const MyComponent: React.FC = () => {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const sub = someEventSubscription();
    setSubscription(sub);

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);

  // Component JSX
};
```

#### 2.2 State Management
```typescript
// Good: Minimize state updates
const MyForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Batch updates instead of multiple set calls
  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    // Form JSX
  );
};
```

## Testing Guidelines

### 1. Component Testing

#### 1.1 Test Structure
```typescript
// Good: Organized test files
components/
├── __tests__/
│   ├── Button.test.tsx
│   ├── ThemedText.test.tsx
│   └── ThemedView.test.tsx
└── index.tsx
```

#### 1.2 Test Examples
```typescript
// Good: Comprehensive component testing
describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={jest.fn()} />
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles onPress correctly', () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <Button title="Test" onPress={mockOnPress} />
    );

    fireEvent.press(getByRole('button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    const { getByTestId } = render(
      <Button title="Test" onPress={jest.fn()} loading={true} />
    );

    expect(getByTestId('activity-indicator')).toBeTruthy();
  });
});
```

## Accessibility Guidelines

### 1. Accessibility Features

#### 1.1 Basic A11y
```typescript
// Good: Accessibility props
<Button
  title="Submit Form"
  onPress={handleSubmit}
  accessibilityLabel="Submit form"
  accessibilityRole="button"
  accessibilityHint="Submits the form and navigates to next screen"
/>

// Good: Semantic HTML
<View accessibilityRole="form">
  <ThemedText accessibilityLabel="Email Address">
    Email Address
  </ThemedText>
  <ThemedTextInput
    accessibilityLabel="Email input field"
    accessibilityLabelledBy="Email Address"
    accessibilityRole="textbox"
  />
</View>
```

#### 1.2 Screen Reader Support
```typescript
// Good: Important content announcements
const successMessage = "Form submitted successfully";

<ThemedText
  accessibilityLiveRegion="polite"
  accessibilityLabel={successMessage}
>
  {successMessage}
</ThemedText>
```

## Internationalization Guidelines

### 1. Translation Management

#### 1.1 Translation Keys
```typescript
// Good: Hierarchical translation keys
export type TranslationKey =
  | 'auth.login'
  | 'auth.register'
  | 'auth.email'
  | 'auth.password'
  | 'navigation.home'
  | 'navigation.settings'
  | 'settings.theme'
  | 'settings.language';
```

#### 1.2 Usage in Components
```typescript
// Good: Consistent translation usage
const LoginScreen: React.FC = () => {
  return (
    <View>
      <ThemedText>
        {i18nService.t('auth.loginTitle')}
      </ThemedText>
      <ThemedTextInput
        label={i18nService.t('auth.email')}
        placeholder={i18nService.t('auth.emailPlaceholder')}
      />
      <Button
        title={i18nService.t('auth.loginButton')}
        onPress={handleLogin}
      />
    </View>
  );
};
```

## Error Handling Guidelines

### 1. Error Boundaries

#### 1.1 Error Boundary Implementation
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  Props,
  ErrorBoundaryState
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThemedView style={styles.errorContainer}>
          <ThemedText>Something went wrong.</ThemedText>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}
```

#### 1.2 Error Handling in Services
```typescript
// Good: Comprehensive error handling
class ApiService {
  async request(endpoint: string, options?: RequestInit): Promise<Response> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getHeaders(),
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          errorData.message || 'Request failed',
          response.status,
          errorData.code
        );
      }

      return response;
    } catch (error) {
      throw new ApiError(
        'Network request failed',
        0,
        'NETWORK_ERROR'
      );
    }
  }
}
```

These frontend guidelines provide a comprehensive foundation for developing maintainable, performant, and accessible React Native applications with Expo Router.