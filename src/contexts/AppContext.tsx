import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { Theme, ThemeColors, ThemeState } from "@/types/theme";
import { Language } from "@/services/i18n";

const THEME_KEY = "app_theme";

const lightColors: ThemeColors = {
  primary: "#007AFF",
  background: "#FFFFFF",
  card: "#F2F2F7",
  text: "#000000",
  textSecondary: "#8E8E93",
  border: "#C6C6C8",
  error: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
  tabBar: "#F2F2F7",
  tabBarActive: "#007AFF",
  headerBackground: "#FFFFFF",
  headerText: "#000000",
};

const darkColors: ThemeColors = {
  primary: "#0A84FF",
  background: "#000000",
  card: "#1C1C1E",
  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  border: "#38383A",
  error: "#FF453A",
  success: "#32D74B",
  warning: "#FF9F0A",
  tabBar: "#1C1C1E",
  tabBarActive: "#0A84FF",
  headerBackground: "#1C1C1E",
  headerText: "#FFFFFF",
};

interface AppContextType {
  themeState: ThemeState;
  language: Language;
  setTheme: (theme: Theme) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");
  const [language, setLanguageState] = useState<Language>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  const getEffectiveTheme = (currentTheme: Theme): "light" | "dark" => {
    if (currentTheme === "system") {
      return systemColorScheme || "light";
    }
    return currentTheme;
  };

  const getThemeColors = (currentTheme: Theme): ThemeColors => {
    const effectiveTheme = getEffectiveTheme(currentTheme);
    return effectiveTheme === "dark" ? darkColors : lightColors;
  };

  const themeState: ThemeState = {
    theme,
    colors: getThemeColors(theme),
    isDarkMode: getEffectiveTheme(theme) === "dark",
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      // Force re-render when system theme changes and app is in system mode
      if (theme === "system") {
        setThemeState("system");
      }
    }
  }, [systemColorScheme, isInitialized]);

  const loadSettings = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
        setThemeState(storedTheme as Theme);
      }

      const storedLanguage = await AsyncStorage.getItem("app_language");
      if (storedLanguage && ["en", "id"].includes(storedLanguage)) {
        setLanguageState(storedLanguage as Language);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsInitialized(true);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    try {
      await AsyncStorage.setItem("app_language", newLanguage);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const value: AppContextType = {
    themeState,
    language,
    setTheme,
    setLanguage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export function useTheme(): ThemeState {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within an AppProvider");
  }
  return context.themeState;
}
