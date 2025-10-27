export type Theme = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  tabBar: string;
  tabBarActive: string;
  headerBackground: string;
  headerText: string;
}

export interface ThemeState {
  theme: Theme;
  colors: ThemeColors;
  isDarkMode: boolean;
}