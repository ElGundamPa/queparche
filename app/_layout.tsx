import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { PlansProvider } from "@/hooks/use-plans-store";
import { UserProvider } from "@/hooks/use-user-store";
import { SearchProvider } from "@/hooks/use-search-store";
import { trpc, trpcClient } from "@/lib/trpc";
import { FiltersProvider } from "@/store/filters";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return <Slot />;
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
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