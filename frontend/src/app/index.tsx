import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            DERMA CHECK
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            Cuide da sua pele com mais atenção.
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            Registre alterações, acompanhe sua rotina e leve informações organizadas para sua
            consulta dermatológica.
          </ThemedText>

          {/* AÇÕES DE AUTENTICAÇÃO */}
          <View style={styles.authButtonsContainer}>
            <Link href="/login" style={[styles.button, styles.primaryButton]}>
              <ThemedText style={styles.buttonTextPrimary}>Entrar na minha conta</ThemedText>
            </Link>

            <Link href="/cadastro" style={[styles.button, styles.secondaryButton]}>
              <ThemedText style={styles.buttonTextSecondary}>Criar nova conta</ThemedText>
            </Link>
          </View>

          <ThemedView type="backgroundSelected" style={styles.primaryCard}>
            <ThemedText type="subtitle">Comece pelo seu histórico</ThemedText>
            <ThemedText themeColor="textSecondary">
              Um acompanhamento consistente ajuda você e seu profissional de saúde a perceberem
              mudanças ao longo do tempo.
            </ThemedText>
            <Link href="/explore" style={styles.action}>
              <ThemedText type="link">Ver como funciona</ThemedText>
            </Link>
          </ThemedView>

          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Próximos passos</ThemedText>
          </View>
          <View style={styles.grid}>
            <Feature title="Registrar" text="Adicione observações e fotos para acompanhar sua pele." />
            <Feature title="Acompanhar" text="Consulte seu histórico de forma simples e segura." />
            <Feature title="Compartilhar" text="Tenha dados organizados para conversar com seu dermatologista." />
          </View>

          <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
            O Derma Check é uma ferramenta de acompanhamento e não substitui avaliação médica.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.feature}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {text}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.four, paddingBottom: Spacing.six },
  title: { marginTop: Spacing.two },
  description: { maxWidth: 620 },
  
  // Estilos adicionados para os botões
  authButtonsContainer: { gap: Spacing.two, marginTop: Spacing.two },
  button: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  primaryButton: { backgroundColor: '#007AFF' },
  secondaryButton: { backgroundColor: '#E5E5EA' },
  buttonTextPrimary: { color: '#FFFFFF', fontWeight: '600' },
  buttonTextSecondary: { color: '#000000', fontWeight: '600' },

  primaryCard: { gap: Spacing.two, borderRadius: Spacing.four, padding: Spacing.four, marginTop: Spacing.two },
  action: { alignSelf: 'flex-start', marginTop: Spacing.one },
  sectionHeader: { marginTop: Spacing.three },
  grid: { gap: Spacing.two },
  feature: { gap: Spacing.one, borderRadius: Spacing.three, padding: Spacing.three },
  disclaimer: { marginTop: Spacing.three, textAlign: 'center' },
});