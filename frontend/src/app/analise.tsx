
import { router } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function Analise() {
  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={styles.voltar}
        onPress={() => router.replace('/inicio' as never)}
      >
        <ArrowLeft size={22} color="#2463A6" />
        <Text style={styles.textoVoltar}>Voltar ao início</Text>
      </Pressable>

      <View style={styles.conteudo}>
        <ShieldCheck size={55} color="#2463A6" />

        <Text style={styles.titulo}>Registro concluído!</Text>

        <Text style={styles.descricao}>
          Sua lesão e a fotografia foram registradas com sucesso.
          A funcionalidade de análise estará disponível em breve.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FE',
  },
  voltar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 20,
  },
  textoVoltar: {
    color: '#2463A6',
    fontWeight: '600',
  },
  conteudo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  titulo: {
    fontSize: 23,
    fontWeight: '800',
    color: '#18324F',
    marginTop: 20,
  },
  descricao: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },
});
