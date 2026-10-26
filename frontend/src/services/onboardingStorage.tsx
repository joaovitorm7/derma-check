import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_ONBOARDING_CONCLUIDO =
  '@dermacheck:onboarding-concluido';

export async function onboardingFoiConcluido(): Promise<boolean> {
  try {
    const valor = await AsyncStorage.getItem(
      CHAVE_ONBOARDING_CONCLUIDO,
    );

    return valor === 'true';
  } catch (erro) {
    console.error('Erro ao consultar o onboarding:', erro);
    return false;
  }
}

export async function concluirOnboarding(): Promise<void> {
  await AsyncStorage.setItem(
    CHAVE_ONBOARDING_CONCLUIDO,
    'true',
  );
}