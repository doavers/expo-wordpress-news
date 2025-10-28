import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";

export type TranslationKey =
  | "common.ok"
  | "common.cancel"
  | "common.save"
  | "common.delete"
  | "common.edit"
  | "common.loading"
  | "common.error"
  | "errors.general"
  | "errors.network"
  | "news.title"
  | "news.featured"
  | "news.latest"
  | "categories.title"
  | "categories.loading"
  | "categories.loading_posts"
  | "categories.empty"
  | "categories.no_posts"
  | "bookmarks.title"
  | "bookmarks.empty"
  | "bookmarks.loading"
  | "auth.login"
  | "auth.register"
  | "auth.email"
  | "auth.password"
  | "auth.name"
  | "auth.loginButton"
  | "auth.registerButton"
  | "auth.logout"
  | "auth.loginTitle"
  | "auth.registerTitle"
  | "auth.haveAccount"
  | "auth.noAccount"
  | "auth.skipToHome"
  | "auth.continueWithGoogle"
  | "auth.or"
  | "navigation.home"
  | "navigation.about"
  | "navigation.settings"
  | "navigation.profile"
  | "navigation.categories"
  | "settings.title"
  | "settings.theme"
  | "settings.language"
  | "settings.light"
  | "settings.dataManagement"
  | "settings.appInformation"
  | "settings.version"
  | "settings.source"
  | "settings.dark"
  | "settings.system"
  | "settings.english"
  | "settings.indonesian"
  | "profile.title"
  | "profile.email"
  | "profile.name"
  | "about.title"
  | "about.description"
  | "categories.backToCategories"
  | "bookmarks.clearAll"
  | "navigation.aboutNewsHub";

const LANGUAGE_KEY = "app_language";

export type Language = "en" | "id";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    "common.ok": "OK",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.loading": "Loading...",
    "common.error": "Error",
    "errors.general": "Failed to load data. Please try again.",
    "errors.network": "Network error. Please check your connection.",
    "news.title": "News Hub",
    "news.featured": "Featured Stories",
    "news.latest": "Latest News",
    "categories.title": "Categories",
    "categories.loading": "Loading categories...",
    "categories.loading_posts": "Loading posts...",
    "categories.empty": "No categories available",
    "categories.no_posts": "No posts in this category",
    "bookmarks.title": "Bookmarks",
    "bookmarks.empty": "No bookmarks yet",
    "bookmarks.loading": "Loading bookmarks...",
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Name",
    "auth.loginButton": "Login",
    "auth.registerButton": "Register",
    "auth.logout": "Logout",
    "auth.loginTitle": "Welcome Back",
    "auth.registerTitle": "Create Account",
    "auth.haveAccount": "Already have an account? Login",
    "auth.noAccount": "Don't have an account? Register",
    "auth.skipToHome": "Skip to Home",
    "auth.continueWithGoogle": "Continue with Google",
    "auth.or": "OR",
    "navigation.home": "Home",
    "navigation.about": "About",
    "navigation.settings": "Settings",
    "navigation.profile": "Profile",
    "navigation.categories": "Categories",
    "settings.title": "Settings",
    "settings.theme": "Theme",
    "settings.language": "Language",
    "settings.light": "Light",
    "settings.dataManagement": "Data Management",
    "settings.appInformation": "App Information",
    "settings.version": "Version",
    "settings.source": "Source",
    "settings.dark": "Dark",
    "settings.system": "System",
    "settings.english": "English",
    "settings.indonesian": "Indonesian",
    "profile.title": "Profile",
    "profile.email": "Email",
    "profile.name": "Name",
    "about.title": "About",
    "about.description":
      "This is a multi-purpose Expo React Native starter application.",
    "categories.backToCategories": "Back to Categories",
    "bookmarks.clearAll": "Clear All Bookmarks",
    "navigation.aboutNewsHub": "About News Hub",
  },
  id: {
    "common.ok": "OK",
    "common.cancel": "Batal",
    "common.save": "Simpan",
    "common.delete": "Hapus",
    "common.edit": "Edit",
    "common.loading": "Memuat...",
    "common.error": "Kesalahan",
    "errors.general": "Gagal memuat data. Silakan coba lagi.",
    "errors.network": "Kesalahan jaringan. Silakan periksa koneksi Anda.",
    "news.title": "Pusat Berita",
    "news.featured": "Cerita Pilihan",
    "news.latest": "Berita Terbaru",
    "categories.title": "Kategori",
    "categories.loading": "Memuat kategori...",
    "categories.loading_posts": "Memuat posting...",
    "categories.empty": "Tidak ada kategori tersedia",
    "categories.no_posts": "Tidak ada posting dalam kategori ini",
    "bookmarks.title": "Bookmark",
    "bookmarks.empty": "Belum ada bookmark",
    "bookmarks.loading": "Memuat bookmark...",
    "auth.login": "Masuk",
    "auth.register": "Daftar",
    "auth.email": "Email",
    "auth.password": "Kata Sandi",
    "auth.name": "Nama",
    "auth.loginButton": "Masuk",
    "auth.registerButton": "Daftar",
    "auth.logout": "Keluar",
    "auth.loginTitle": "Selamat Datang Kembali",
    "auth.registerTitle": "Buat Akun",
    "auth.haveAccount": "Sudah punya akun? Masuk",
    "auth.noAccount": "Belum punya akun? Daftar",
    "auth.skipToHome": "Lewati ke Beranda",
    "auth.continueWithGoogle": "Lanjutkan dengan Google",
    "auth.or": "ATAU",
    "navigation.home": "Beranda",
    "navigation.about": "Tentang",
    "navigation.settings": "Pengaturan",
    "navigation.profile": "Profil",
    "navigation.categories": "Kategori",
    "settings.title": "Setelan",
    "settings.theme": "Tema",
    "settings.language": "Bahasa",
    "settings.light": "Terang",
    "settings.dataManagement": "Manajemen Data",
    "settings.appInformation": "Informasi Aplikasi",
    "settings.version": "Versi",
    "settings.source": "Sumber",
    "settings.dark": "Gelap",
    "settings.system": "Sistem",
    "settings.english": "English",
    "settings.indonesian": "Bahasa Indonesia",
    "profile.title": "Profil",
    "profile.email": "Email",
    "profile.name": "Nama",
    "about.title": "Tentang",
    "about.description":
      "Ini adalah aplikasi awal Expo React Native multi-tujuan.",
    "categories.backToCategories": "Kembali ke Kategori",
    "bookmarks.clearAll": "Hapus Semua Bookmark",
    "navigation.aboutNewsHub": "Tentang Pusat Berita",
  },
};

class I18nService {
  private currentLanguage: Language = "en";
  private listeners: ((language: Language) => void)[] = [];

  constructor() {
    this.initializeLanguage();
  }

  private async initializeLanguage() {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

      if (
        storedLanguage &&
        (storedLanguage === "en" || storedLanguage === "id")
      ) {
        this.currentLanguage = storedLanguage as Language;
      } else {
        const deviceLocale = getLocales()[0];
        if (deviceLocale.languageCode === "id") {
          this.currentLanguage = "id";
        } else {
          this.currentLanguage = "en";
        }
      }
    } catch (error) {
      console.error("Error initializing language:", error);
    }
  }

  async setLanguage(language: Language) {
    this.currentLanguage = language;
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error("Error saving language:", error);
    }
    this.listeners.forEach((listener) => listener(language));
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  subscribe(listener: (language: Language) => void) {
    this.listeners.push(listener);
    listener(this.currentLanguage);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  translate(key: TranslationKey): string {
    const translation = translations[this.currentLanguage]?.[key];
    return translation || translations.en[key] || key;
  }

  t = this.translate;

  getAvailableLanguages() {
    return [
      {
        code: "en" as Language,
        name: translations[this.currentLanguage]["settings.english"]
      },
      {
        code: "id" as Language,
        name: translations[this.currentLanguage]["settings.indonesian"]
      },
    ];
  }
}

export const i18nService = new I18nService();
export default i18nService;
