import { Text, View } from 'react-native';

import { cores } from '../constants/tema';

export default function Login() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: cores.fundo,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Text
        style={{
          color: cores.azulEscuro,
          fontSize: 28,
          fontWeight: '800',
        }}
      >
        Derma<Text style={{ color: cores.azul }}>Check</Text>
      </Text>

      <Text
        style={{
          color: cores.textoSecundario,
          fontSize: 15,
          marginTop: 12,
          textAlign: 'center',
        }}
      >
        Tela preparada para a implementação do login.
      </Text>
    </View>
  );
}