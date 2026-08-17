import { Stack } from 'expo-router';

export default function HostLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="property/[id]" />
      <Stack.Screen name="reservation/[id]" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="add-property/index" />
      <Stack.Screen name="add-room/index" />
    </Stack>
  );
}
