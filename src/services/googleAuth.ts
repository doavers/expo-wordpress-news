import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id';

interface GoogleAuthConfig {
  clientId: string;
  redirectUri?: string;
}

interface GoogleAuthResponse {
  code?: string;
  error?: string;
}

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

class GoogleAuthService {
  private redirectUri: string;

  constructor() {
    this.redirectUri = AuthSession.makeRedirectUri({
      scheme: undefined,
      path: 'auth',
    });
  }

  async configureGoogleAuth(): Promise<void> {
    // Google OAuth configuration for web
    if (Platform.OS === 'web') {
      // Web configuration would go here
      console.log('Google OAuth configured for web');
    }
  }

  async signInWithGoogle(): Promise<{ idToken: string; userInfo: GoogleUserInfo }> {
    try {
      // Open Google OAuth in web browser
      const authUrl = this.getGoogleAuthUrl();

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        this.redirectUri
      );

      if (result.type === 'success') {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          throw new Error(`Google sign in error: ${error}`);
        }

        if (code) {
          // Exchange code for tokens
          const tokenResponse = await this.exchangeCodeForTokens(code);

          // Get user info
          const userInfo = await this.getUserInfo(tokenResponse.access_token);

          return {
            idToken: tokenResponse.access_token,
            userInfo,
          };
        }
      }

      throw new Error('Google sign in was cancelled');
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  private getGoogleAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'email profile openid',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: '', // For mobile apps, client_secret might not be needed
        code,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return response.json();
  }

  private async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  async signInWithGoogleNative(): Promise<{ idToken: string; userInfo: GoogleUserInfo }> {
    try {
      // This would be implemented using @react-native-google-signin/google-signin
      // For now, we'll use the web flow
      return await this.signInWithGoogle();
    } catch (error) {
      console.error('Native Google sign in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await WebBrowser.dismissBrowser();
      // Additional cleanup if needed
    } catch (error) {
      console.error('Google sign out error:', error);
    }
  }
}

export const googleAuthService = new GoogleAuthService();
export default googleAuthService;