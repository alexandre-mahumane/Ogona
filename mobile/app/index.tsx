import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/auth.store';

export default function Index() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (token) {
    return (
      <Redirect
        href={user?.role === 'host' ? '/(host)/(tabs)' : '/(guest)/(tabs)'}
      />
    );
  }

  return <Redirect href="/(auth)/login" />;
}
