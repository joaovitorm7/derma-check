import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';

import Onboarding from '../components/onboarding/Onboarding';
import { ROTAS } from '../constants/rotas';
import { cores } from '../constants/tema';
import { onboardingFoiConcluido } from '../services/onboardingStorage';

export default function Index() {
  const router = useRouter();

  const [verificando, setVerificando] = useState(true);
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function verificarInicializacao() {
      const concluido = await onboardingFoiConcluido();

      if (!ativo) return;

      if (concluido) {
        router.replace(ROTAS.aposOnboarding);
      } else {
        setMostrarOnboarding(true);
      }

      setVerificando(false);
    }

    void verificarInicializacao();

    return () => {
      ativo = false;
    };
  }, [router]);

  if (verificando) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: cores.fundo,
        }}
      >
        <ActivityIndicator
          size="large"
          color={cores.azulEscuro}
        />
      </View>
    );
  }

  if (mostrarOnboarding) {
    return <Onboarding />;
  }

  return null;
}