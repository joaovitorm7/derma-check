import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

import { cores } from '../../constants/tema';

type Props = {
  titulo: string;
  descricao: string;
  icone: React.ComponentProps<typeof Ionicons>['name'];
  largura: number;
};

export default function OnboardingSlide({
  titulo,
  descricao,
  icone,
  largura,
}: Props) {
  return (
    <View
      style={{
        width: largura,
        paddingHorizontal: 25,
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          backgroundColor: cores.branco,
          borderRadius: 25,
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 30,
          borderWidth: 1,
          borderColor: cores.borda,
        }}
      >
        <View
          style={{
            width: 112,
            height: 112,
            borderRadius: 32,
            backgroundColor: cores.azulClaro,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={icone}
            size={62}
            color={cores.azulEscuro}
          />
        </View>

        <Text
          style={{
            fontSize: 21,
            fontWeight: '700',
            color: cores.azulEscuro,
            marginTop: 22,
            textAlign: 'center',
          }}
        >
          {titulo}
        </Text>

        <Text
          style={{
            color: cores.textoSecundario,
            fontSize: 14,
            lineHeight: 22,
            textAlign: 'center',
            marginTop: 10,
          }}
        >
          {descricao}
        </Text>
      </View>
    </View>
  );
}