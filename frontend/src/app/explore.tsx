import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

const steps = [
  ['1', 'Registre o que você percebe', 'Anote sintomas, mudanças e observações enquanto elas ainda estão frescas.'],
  ['2', 'Acompanhe ao longo do tempo', 'Use registros datados para observar a evolução, sem tirar conclusões sozinho.'],
  ['3', 'Converse com um profissional', 'Leve seu histórico ao dermatologista para apoiar uma avaliação adequada.'],
];

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            COMO FUNCIONA
          </ThemedText>
          <ThemedText type="subtitle">Informação organizada para decisões melhores.</ThemedText>
          <ThemedText themeColor="textSecondary">
            O aplicativo ajuda a transformar observações do dia a dia em um histórico claro para
            você acompanhar e discutir com um profissional.
          </ThemedText>
          {steps.map(([number, title, description]) => (
            <ThemedView key={number} type="backgroundElement" style={styles.step}>
              <ThemedView type="backgroundSelected" style={styles.number}>
                <ThemedText type="smallBold">{number}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.stepText}>
                <ThemedText type="smallBold">{title}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {description}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          ))}
          <ThemedView type="backgroundSelected" style={styles.notice}>
            <ThemedText type="smallBold">Importante</ThemedText>
            <ThemedText type="small">
              Nenhum registro substitui diagnóstico, prescrição ou atendimento de emergência.
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: Spacing.three, padding: Spacing.four, paddingBottom: Spacing.six },
  step: { flexDirection: 'row', gap: Spacing.three, borderRadius: Spacing.three, padding: Spacing.three },
  number: { alignItems: 'center', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  stepText: { flex: 1, gap: Spacing.one },
  notice: { gap: Spacing.one, borderRadius: Spacing.three, padding: Spacing.three },
});
