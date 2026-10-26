import { Pressable, Text, View } from 'react-native';

import { cores } from '../../constants/tema';

type Props = {
  paginaAtual: number;
  total: number;
  onContinuar: () => void;
  onEntrar: () => void;
  desabilitado?: boolean;
};

export default function OnboardingBotoes({
  paginaAtual,
  total,
  onContinuar,
  onEntrar,
  desabilitado = false,
}: Props) {
  return (
    <View
      style={{
        width: '100%',
        paddingHorizontal: 25,
      }}
    >
      <Pressable
        accessibilityRole="button"
        disabled={desabilitado}
        onPress={onContinuar}
        style={({ pressed }) => ({
          width: '100%',
          minHeight: 52,
          backgroundColor: cores.azulEscuro,
          borderRadius: 15,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 13,
          opacity: desabilitado ? 0.6 : pressed ? 0.85 : 1,
        })}
      >
        <Text
          style={{
            color: cores.branco,
            fontSize: 15,
            fontWeight: '700',
          }}
        >
          {paginaAtual < total - 1 ? 'Continuar' : 'Começar'}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        disabled={desabilitado}
        onPress={onEntrar}
        style={{
          paddingVertical: 15,
          opacity: desabilitado ? 0.6 : 1,
        }}
      >
        <Text
          style={{
            color: cores.textoSecundario,
            textAlign: 'center',
            fontSize: 14,
          }}
        >
          Já tenho uma conta · Entrar
        </Text>
      </Pressable>
    </View>
  );
}