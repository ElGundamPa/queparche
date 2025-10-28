import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="login-form" />
      <Stack.Screen name="register-form" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
