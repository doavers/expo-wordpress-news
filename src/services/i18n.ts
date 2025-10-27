import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

export type TranslationKey =
  | 'common.ok'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.loading'
  | 'common.error'
  | 'auth.login'
  | 'auth.register'
  | 'auth.email'
  | 'auth.password'
  | 'auth.name'
  | 'auth.loginButton'
  | 'auth.registerButton'
  | 'auth.logout'
  | 'auth.loginTitle'
  | 'auth.registerTitle'
  | 'auth.haveAccount'
  | 'auth.noAccount'
  | 'navigation.home'
  | 'navigation.about'
  | 'navigation.settings'
  | 'navigation.profile'
  | 'settings.theme'
  | 'settings.language'
  | 'settings.light'
  | 'settings.dark'
  | 'settings.system'
  | 'settings.english'
  | 'settings.indonesian'
  | 'profile.title'
  | 'profile.email'
  | 'profile.name'
  | 'about.title'
  | 'about.description';

const LANGUAGE_KEY = 'app_language';

type Language = 'en' | 'id';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.loginButton': 'Login',
    'auth.registerButton': 'Register',
    'auth.logout': 'Logout',
    'auth.loginTitle': 'Welcome Back',
    'auth.registerTitle': 'Create Account',
    'auth.haveAccount': 'Already have an account? Login',
    'auth.noAccount': "Don't have an account? Register",
    'navigation.home': 'Home',
    'navigation.about': 'About',
    'navigation.settings': 'Settings',
    'navigation.profile': 'Profile',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.system': 'System',
    'settings.english': 'English',
    'settings.indonesian': 'Indonesian',
    'profile.title': 'Profile',
    'profile.email': 'Email',
    'profile.name': 'Name',
    'about.title': 'About',
    'about.description': 'This is a multi-purpose Expo React Native starter application.',
  },
  id: {
    'common.ok': 'OK',
    'common.cancel': 'Batal',
    'common.save': 'Simpan',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.loading': 'Memuat...',
    'common.error': 'Kesalahan',
    'auth.login': 'Masuk',
    'auth.register': 'Daftar',
    'auth.email': 'Email',
    'auth.password': 'Kata Sandi',
    'auth.name': 'Nama',
    'auth.loginButton': 'Masuk',
    'auth.registerButton': 'Daftar',
    'auth.logout': 'Keluar',
    'auth.loginTitle': 'Selamat Datang Kembali',
    'auth.registerTitle': 'Buat Akun',
    'auth.haveAccount': 'Sudah punya akun? Masuk',
    'auth.noAccount': 'Belum punya akun? Daftar',
    'navigation.home': 'Beranda',
    'navigation.about': 'Tentang',
    'navigation.settings': 'Pengaturan',
    'navigation.profile': 'Profil',
    'settings.theme': 'Tema',
    'settings.language': 'Bahasa',
    'settings.light': 'Terang',
    'settings.dark': 'Gelap',
    'settings.system': 'Sistem',
    'settings.english': 'English',
    'settings.indonesian': 'Bahasa Indonesia',
    'profile.title': 'Profil',
    'profile.email': 'Email',
    'profile.name': 'Nama',
    'about.title': 'Tentang',
    'about.description': 'Ini adalah aplikasi awal Expo React Native multi-tujuan.',
  },
};

class I18nService {
  private currentLanguage: Language = 'en';
  private listeners: ((language: Language) => void)[] = [];

  constructor() {
    this.initializeLanguage();
  }

  private async initializeLanguage() {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

      if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'id')) {
        this.currentLanguage = storedLanguage as Language;
      } else {
        const deviceLocale = getLocales()[0];
        if (deviceLocale.languageCode === 'id') {
          this.currentLanguage = 'id';
        } else {
          this.currentLanguage = 'en';
        }
      }
    } catch (error) {
      console.error('Error initializing language:', error);
    }
  }

  async setLanguage(language: Language) {
    this.currentLanguage = language;
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
    this.listeners.forEach(listener => listener(language));
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
      { code: 'en' as Language, name: translations.en['settings.english'] },
      { code: 'id' as Language, name: translations.en['settings.indonesian'] },
    ];
  }
}

export const i18nService = new I18nService();
export default i18nService;