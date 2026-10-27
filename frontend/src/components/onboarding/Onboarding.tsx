import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { ROTAS } from '../../constants/rotas';
import { cores } from '../../constants/tema';
import { concluirOnboarding } from '../../services/onboardingStorage';

import OnboardingBotoes from './OnboardingBotoes';
import OnboardingIndicadores from './OnboardingIndicadores';
import OnboardingSlide from './OnboardingSlide';

const slides = [
  {
    icone: 'search-outline',
    titulo: 'Sua pele merece atenção',
    descricao:
      'Organize fotografias e informações sobre suas lesões cutâneas.',
  },
  {
    icone: 'images-outline',
    titulo: 'Observe as mudanças',
    descricao:
      'Registre imagens em datas diferentes para acompanhar a evolução.',
  },
  {
    icone: 'shield-checkmark-outline',
    titulo: 'Cuide-se todos os dias',
    descricao:
      'Aprenda sobre prevenção e mantenha suas informações organizadas.',
  },
] as const;

export default function Onboarding() {
  const router = useRouter();
  const listaRef = useRef<FlatList>(null);

  const [paginaAtual, setPaginaAtual] = useState(0);
  const [finalizando, setFinalizando] = useState(false);

  const { width } = useWindowDimensions();

  function atualizarPagina(
    evento: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    const indice = Math.round(
      evento.nativeEvent.contentOffset.x / width,
    );

    setPaginaAtual(
      Math.max(0, Math.min(indice, slides.length - 1)),
    );
  }

  async function finalizarOnboarding() {
    if (finalizando) return;

    setFinalizando(true);

    try {
      await concluirOnboarding();
      router.replace(ROTAS.aposOnboarding);
    } catch (erro) {
      console.error('Erro ao concluir o onboarding:', erro);
      setFinalizando(false);
    }
  }

  function continuar() {
    if (finalizando) return;

    if (paginaAtual < slides.length - 1) {
      listaRef.current?.scrollToIndex({
        index: paginaAtual + 1,
        animated: true,
      });

      return;
    }

    void finalizarOnboarding();
  }

  function entrar() {
    if (finalizando) return;

    router.replace(ROTAS.login);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: cores.fundo,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 24,
      }}
    >
      <StatusBar style="dark" />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Pular introdução"
        disabled={finalizando}
        onPress={() => {
          void finalizarOnboarding();
        }}
        hitSlop={8}
        style={{
          position: 'absolute',
          top: 10,
          right: 20,
          minHeight: 44,
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <Text
          style={{
            color: cores.azulEscuro,
            fontWeight: '700',
            fontSize: 15,
          }}
        >
          Pular
        </Text>
      </Pressable>

      <View
        style={{
          width: 82,
          height: 82,
          borderRadius: 26,
          backgroundColor: cores.azulClaro,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Ionicons
          name="medkit"
          size={44}
          color={cores.azulEscuro}
        />
      </View>

      <Text
        style={{
          fontSize: 32,
          fontWeight: '800',
          color: cores.azulEscuro,
        }}
      >
        Derma<Text style={{ color: cores.azulEscuro }}>Check</Text>
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: cores.textoSecundario,
          textAlign: 'center',
          marginTop: 10,
          lineHeight: 23,
          paddingHorizontal: 25,
        }}
      >
        Acompanhe sua pele com mais atenção e organização.
      </Text>

      <FlatList
        ref={listaRef}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        style={{
          flexGrow: 0,
          marginVertical: 22,
        }}
        keyExtractor={(item) => item.titulo}
        getItemLayout={(_, indice) => ({
          length: width,
          offset: width * indice,
          index: indice,
        })}
        onMomentumScrollEnd={atualizarPagina}
        renderItem={({ item }) => (
          <OnboardingSlide
            titulo={item.titulo}
            descricao={item.descricao}
            icone={item.icone}
            largura={width}
          />
        )}
      />

      <OnboardingIndicadores
        total={slides.length}
        paginaAtual={paginaAtual}
      />

      <OnboardingBotoes
        paginaAtual={paginaAtual}
        total={slides.length}
        onContinuar={continuar}
        onEntrar={entrar}
        desabilitado={finalizando}
      />
    </View>
  );
}