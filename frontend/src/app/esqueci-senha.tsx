import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores } from '../constants/tema';

export default function EsqueciSenha() {
  function informarIndisponibilidade() {
    Alert.alert(
      'Recuperação de senha',
      'Esse recurso ainda não está disponível na API.',
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.voltar}>
        <Text style={styles.link}>Voltar</Text>
      </Pressable>
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>Esqueceu a senha?</Text>
        <Text style={styles.descricao}>
          A recuperação de senha será disponibilizada em uma próxima versão.
        </Text>
        <Pressable onPress={informarIndisponibilidade} style={styles.botao}>
          <Text style={styles.textoBotao}>Entendi</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, padding: 24 },
  voltar: { paddingVertical: 12, alignSelf: 'flex-start' },
  link: { color: cores.azulEscuro, fontWeight: '700', fontSize: 16 },
  conteudo: { flex: 1, justifyContent: 'center' },
  titulo: { fontSize: 27, fontWeight: '800', color: cores.azulEscuro, marginBottom: 12 },
  descricao: { color: cores.textoSecundario, lineHeight: 23, fontSize: 15 },
  botao: { backgroundColor: cores.azulEscuro, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  textoBotao: { color: cores.branco, fontWeight: '700' },
});
