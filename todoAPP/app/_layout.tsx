import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments, usePathname } from "expo-router"; // ← AÑADIDO usePathname
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { container } from "@/src/di/container";
import { useAuth } from "@/src/presentation/hooks/useAuth";
import { saveLastRoute, getLastRoute, clearLastRoute } from "@/src/utils/navigationHistory"; // ← NUEVO


import { RelativePathString } from "expo-router";


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-BoldItalic.ttf"),
  });
  const [containerReady, setContainerReady] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname(); // ← NUEVO: ruta actual

  // ← NUEVO: Guardar la ruta actual (excepto login/register)
  useEffect(() => {
    if (!authLoading && user && pathname && !pathname.startsWith("/(tabs)/login") && !pathname.startsWith("/(tabs)/register")) {
      saveLastRoute(pathname);
    }
  }, [pathname, user, authLoading]);

  useEffect(() => {
    const initContainer = async () => {
      try {
        await container.initialize();
        setContainerReady(true);
      } catch (error) {
        console.error("Error initializing container:", error);
      }
    };
    initContainer();
  }, []);

  // ← MODIFICADO: Restaurar última ruta
  useEffect(() => {
    if (!containerReady || authLoading) return;

    const inAuthGroup =
      segments[0] === "(tabs)" &&
      (segments[1] === "login" || segments[1] === "register");

    if (!user) {
      if (!inAuthGroup) {
        router.replace("/(tabs)/login");
      }
      clearLastRoute(); // ← Limpiar si no hay usuario
    } else {
      if (inAuthGroup) {


        // Si está en login/register, redirigir a la última ruta o /todos
        getLastRoute().then(lastRoute => {
          if (lastRoute && lastRoute !== "/(tabs)/login" && lastRoute !== "/(tabs)/register") {
            // 🔁 Conversión explícita a RelativePathString
            const typedRoute = lastRoute as unknown as RelativePathString;
            router.replace(typedRoute);
          } else {
            router.replace("/(tabs)/todos");
          }
        });



      }
      // Si ya está en una ruta protegida, no hacer nada
    }
  }, [user, segments, containerReady, authLoading]);

  useEffect(() => {
    if (loaded && containerReady && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, containerReady, authLoading]);

  if (!loaded || !containerReady || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)/login" />
        <Stack.Screen name="(tabs)/register" />
        <Stack.Screen name="(tabs)/todos" />
        <Stack.Screen name="(tabs)/profile" />
        <Stack.Screen name="(tabs)/forgot-password" />
      </Stack>
    </ThemeProvider>
  );
}