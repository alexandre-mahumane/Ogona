import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useMeQuery } from '@/hooks/useAuth';
import { queryClient } from '@/lib/api/query-client';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';

function AuthGate({ children }: { children: ReactNode }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const me = useMeQuery();

  if (!hydrated || (token && me.isLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
      </View>
    );
  }

  return children;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGate>{children}</AuthGate>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
