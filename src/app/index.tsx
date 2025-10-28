import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import WelcomeScreen from "@/components/WelcomeScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function IndexPage() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem("@is_first_launch");
        const firstLaunch = hasLaunched !== "false";
        console.log("Index: First launch check:", { hasLaunched, firstLaunch });
        setIsFirstLaunch(firstLaunch);

        // If not first launch, trigger redirect
        if (!firstLaunch) {
          setShouldRedirect(true);
        }
      } catch (error) {
        console.error("Index: Error checking first launch:", error);
        setIsFirstLaunch(false);
        setShouldRedirect(true);
      }
    };

    checkFirstLaunch();
  }, []);

  // Handle navigation in separate useEffect
  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/(tabs)/home");
    }
  }, [shouldRedirect, router]);

  // If first launch, show welcome screen
  if (isFirstLaunch) {
    return <WelcomeScreen />;
  }

  // If not first launch, show loading while redirecting
  if (isFirstLaunch === false) {
    return null; // Loading state, will redirect
  }

  // Initial loading state
  return null;
}
