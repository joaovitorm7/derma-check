import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tela inicial (Landing Page ou Home) */}
      <Stack.Screen name="index" />

      {/* Tela de Login */}
      <Stack.Screen name="login" />

      {/* Tela de Cadastro */}
      <Stack.Screen name="cadastro" />
    </Stack>
  );
}