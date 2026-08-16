import { Stack } from 'expo-router';

export default function GuestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="filters" />
      <Stack.Screen name="property/[id]" />
      <Stack.Screen name="book/[id]" />
      <Stack.Screen name="book-success" />
      <Stack.Screen name="reservation/[id]" />
      <Stack.Screen name="pay/[id]" />
      <Stack.Screen name="pay-success" />
      <Stack.Screen name="review/[id]" />
    </Stack>
  );
}
