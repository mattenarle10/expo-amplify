import { Stack } from 'expo-router';

export default function SignUpLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="email" />
      <Stack.Screen name="password" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
