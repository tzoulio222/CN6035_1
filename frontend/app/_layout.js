import "../global.css";
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../src/store/authStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient();

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Φορτώνουμε το αποθηκευμένο session του χρήστη μόλις ανοίξει η εφαρμογή.
    initialize();
  }, [initialize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Providers που χρειάζονται σε όλη την εφαρμογή */}
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          {/* Κύριο navigation stack της εφαρμογής */}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#050816' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
