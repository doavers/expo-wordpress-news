import AsyncStorage from "@react-native-async-storage/async-storage";

export const resetFirstLaunch = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("@is_first_launch");
    console.log("First launch state reset successfully");
  } catch (error) {
    console.error("Error resetting first launch state:", error);
  }
};

export const isFirstLaunch = async (): Promise<boolean> => {
  try {
    const hasLaunched = await AsyncStorage.getItem("@is_first_launch");
    return hasLaunched !== "false";
  } catch (error) {
    console.error("Error checking first launch:", error);
    return false;
  }
};