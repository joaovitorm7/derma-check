
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="inicio" />
        <Stack.Screen name="historico" />
        <Stack.Screen name="analise" />
        <Stack.Screen name="nova-lesao" />
        <Stack.Screen name="diario" />
        <Stack.Screen name="lembretes" />
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />
        <Stack.Screen name="explore" />
        <Stack.Screen name="esqueci-senha" />
        <Stack.Screen name="mensagens" />
        <Stack.Screen name="perfil" />
      </Stack>
    </ThemeProvider>
  );
}
