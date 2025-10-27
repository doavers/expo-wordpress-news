import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
  TokenInfo,
  ApiResponse,
} from "@/types/auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user_data";

class AuthService {
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  };

  constructor() {
    this.loadStoredAuth();
  }

  private async loadStoredAuth() {
    try {
      const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      const userStr = await AsyncStorage.getItem(USER_KEY);

      if (accessToken && userStr) {
        const user = JSON.parse(userStr);
        this.updateState({
          user,
          token: accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        this.updateState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      this.updateState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }

  private updateState(newState: AuthState) {
    this.state = newState;
    this.listeners.forEach((listener) => listener(newState));
  }

  private async storeAuth(tokenInfo: TokenInfo, user: User) {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokenInfo.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokenInfo.refreshToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error storing auth:", error);
    }
  }

  private async clearStoredAuth() {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error clearing stored auth:", error);
    }
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    listener(this.state);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getState(): AuthState {
    return this.state;
  }

  private getLanguageCookie(): string {
    return "frontend_lang=en_US; frontend_lang=en_US";
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: this.getLanguageCookie(),
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const apiResponse: ApiResponse<AuthResponse> = await response.json();

      if (apiResponse.code !== "00") {
        throw new Error(apiResponse.message || "Login failed");
      }

      const data = apiResponse.data;
      await this.storeAuth(data.token, data.user);

      this.updateState({
        user: data.user,
        token: data.token.accessToken,
        refreshToken: data.token.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: this.getLanguageCookie(),
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const apiResponse: ApiResponse<{ user: User }> = await response.json();

      if (apiResponse.code !== "00") {
        throw new Error(apiResponse.message || "Registration failed");
      }

      // Register response doesn't include tokens, user needs to login after registration
      return {
        user: apiResponse.data.user,
        token: {
          accessToken: "",
          refreshToken: "",
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.clearStoredAuth();
    this.updateState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Cookie: this.getLanguageCookie(),
    };

    if (this.state.token) {
      headers["Authorization"] = `Bearer ${this.state.token}`;
    }

    return headers;
  }

  async refreshToken(): Promise<TokenInfo | null> {
    if (!this.state.refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: this.getLanguageCookie(),
        },
        body: JSON.stringify({
          refreshToken: this.state.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const apiResponse: ApiResponse<{ token: TokenInfo }> =
        await response.json();

      if (apiResponse.code !== "00") {
        throw new Error(apiResponse.message || "Token refresh failed");
      }

      const tokenInfo = apiResponse.data.token;

      // Update stored tokens
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokenInfo.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokenInfo.refreshToken);

      this.updateState({
        ...this.state,
        token: tokenInfo.accessToken,
        refreshToken: tokenInfo.refreshToken,
      });

      return tokenInfo;
    } catch (error) {
      console.error("Token refresh error:", error);
      // If refresh fails, logout the user
      await this.logout();
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
