// src/utils/navigationHistory.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_ROUTE_KEY = "@TodoApp:lastRoute";

export const saveLastRoute = async (route: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAST_ROUTE_KEY, route);
  } catch (error) {
    console.warn("Failed to save last route", error);
  }
};

export const getLastRoute = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LAST_ROUTE_KEY);
  } catch (error) {
    console.warn("Failed to get last route", error);
    return null;
  }
};

export const clearLastRoute = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(LAST_ROUTE_KEY);
  } catch (error) {
    console.warn("Failed to clear last route", error);
  }
};