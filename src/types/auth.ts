export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role?: string;
  banned?: string | null;
  banReason?: string | null;
  banExpires?: string | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = any> {
  traceId: string;
  code: string;
  message: string;
  data: T;
}

export interface AuthResponse {
  user: User;
  token: TokenInfo;
}