import { View } from 'react-native';

import { cores } from '../../constants/tema';

type Props = {
  total: number;
  paginaAtual: number;
};

export default function OnboardingIndicadores({
  total,
  paginaAtual,
}: Props) {
  return (
    <View
      accessibilityLabel={`Tela ${paginaAtual + 1} de ${total}`}
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 7,
        marginBottom: 20,
      }}
    >
      {Array.from({ length: total }).map((_, indice) => (
        <View
          key={indice}
          style={{
            width: paginaAtual === indice ? 23 : 8,
            height: 8,
            borderRadius: 5,
            backgroundColor:
              paginaAtual === indice
                ? cores.azulEscuro
                : '#C4D7EB',
          }}
        />
      ))}
    </View>
  );
}