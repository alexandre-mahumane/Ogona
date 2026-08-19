import { router } from 'expo-router';
import { useEffect } from 'react';

export default function RegisterWalletScreen() {
  useEffect(() => {
    router.replace('/(auth)/register');
  }, []);

  return null;
}
