import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/contexts/AppContext';
import i18nService from '@/services/i18n';
import { useEffect, useState } from 'react';

export default function TabLayout() {
  const { themeState } = useAppContext();
  const [tabTitles, setTabTitles] = useState({
    home: i18nService.t('navigation.home'),
    categories: i18nService.t('navigation.categories'),
    bookmarks: i18nService.t('bookmarks.title'),
    settings: i18nService.t('navigation.settings'),
  });

  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = i18nService.subscribe(() => {
      setTabTitles({
        home: i18nService.t('navigation.home'),
        categories: i18nService.t('navigation.categories'),
        bookmarks: i18nService.t('bookmarks.title'),
        settings: i18nService.t('navigation.settings'),
      });
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: themeState.colors.tabBarActive,
          tabBarInactiveTintColor: themeState.colors.textSecondary,
          tabBarStyle: {
            backgroundColor: themeState.colors.tabBar,
            borderTopColor: themeState.colors.border,
          },
          headerShown: false,
        }}>
      <Tabs.Screen
        name="home"
        options={{
          title: tabTitles.home,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: tabTitles.categories,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: tabTitles.bookmarks,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: tabTitles.settings,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
    </SafeAreaView>
  );
}