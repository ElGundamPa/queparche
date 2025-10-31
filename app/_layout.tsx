import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useVideoPlayer } from "expo-video";

import { PlansProvider } from "@/hooks/use-plans-store";
import { UserProvider } from "@/hooks/use-user-store";
import { SearchProvider } from "@/hooks/use-search-store";
import { trpc, trpcClient } from "@/lib/trpc";
import { FiltersProvider } from "@/store/filters";

SplashScreen.preventAutoHideAsync();

// Configurar audio mode globalmente
// Solo configurar una vez en la app
let audioConfigured = false;
function configureAudioMode() {
  if (audioConfigured) return;
  try {
    // @ts-ignore - setAudioModeAsync puede no estar en tipos
    if (typeof useVideoPlayer.setAudioModeAsync === 'function') {
      // @ts-ignore
      useVideoPlayer.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        shouldDuckAndroid: true,
      });
      audioConfigured = true;
      console.log('[App] Audio mode configured');
    }
  } catch (e) {
    console.log('[App] Could not configure audio mode:', e);
  }
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return <Slot />;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    configureAudioMode(); // Configurar audio mode en el mount
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <PlansProvider>
            <SearchProvider>
              <FiltersProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </FiltersProvider>
            </SearchProvider>
          </PlansProvider>
        </UserProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}