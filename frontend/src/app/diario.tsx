import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, ChevronLeft, Sun } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraNavegacao } from '../components/barra-navegacao';
import { ROTAS } from '../constants/rotas';
import { cores } from '../constants/tema';
import { ExposicaoSolar, registrarDiario } from '../services/diarioService';

const NIVEIS: { valor: ExposicaoSolar; rotulo: string }[] = [
  { valor: 'BAIXO', rotulo: 'Baixo' },
  { valor: 'MODERADO', rotulo: 'Moderado' },
  { valor: 'ALTO', rotulo: 'Alto' },
];

// Limite da coluna diario_pele.url_foto (VARCHAR(255)).
const TAMANHO_MAXIMO_URL_FOTO = 255;

export default function Diario() {
  const [mudancas, setMudancas] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [exposicao, setExposicao] = useState<ExposicaoSolar>('MODERADO');
  const [foto, setFoto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function escolherFoto() {
    setErro('');
    setSucesso('');

    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });

      if (resultado.canceled) {
        return;
      }

      const uri = resultado.assets[0].uri;

      if (uri.length > TAMANHO_MAXIMO_URL_FOTO) {
        setErro('Não foi possível anexar esta foto. Tente outra imagem.');
        return;
      }

      setFoto(uri);
    } catch {
      setErro('Não foi possível abrir a galeria.');
    }
  }

  async function salvar() {
    setSalvando(true);
    setErro('');
    setSucesso('');

    try {
      await registrarDiario({
        mudancas_percebidas: mudancas,
        sintomas,
        exposicao_solar: exposicao,
        // shortcut: envia a URI local porque o backend não tem upload; a foto só existe neste aparelho, trocar quando houver endpoint de upload.
        url_foto: foto ?? undefined,
      });

      setMudancas('');
      setSintomas('');
      setExposicao('MODERADO');
      setFoto(null);
      setSucesso('Registro salvo no seu diário.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar o registro.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.cabecalho}>
        <Pressable
          style={styles.botaoVoltar}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(ROTAS.inicio))}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <ChevronLeft size={24} color={cores.azulEscuro} />
        </Pressable>
        <Text style={styles.tituloCabecalho} accessibilityRole="header">
          Diário da pele
        </Text>
        <View style={styles.espacoCabecalho} />
      </View>

      <KeyboardAvoidingView
        style={styles.corpo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardRegistro}>
            <Sun size={26} color={cores.azulEscuro} />
            <Text style={styles.tituloCard}>Registro diário</Text>
            <Text style={styles.dataCard}>Data: hoje</Text>
          </View>

          <View style={styles.campo}>
            <Text style={styles.rotulo}>Mudanças percebidas</Text>
            <TextInput
              style={styles.entrada}
              value={mudancas}
              onChangeText={setMudancas}
              placeholder="Ex.: alteração de cor ou tamanho..."
              placeholderTextColor={cores.placeholder}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Mudanças percebidas"
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.rotulo}>Sintomas</Text>
            <TextInput
              style={styles.entrada}
              value={sintomas}
              onChangeText={setSintomas}
              placeholder="Ex.: coceira, dor ou sangramento..."
              placeholderTextColor={cores.placeholder}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Sintomas"
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.rotulo}>Tempo de exposição solar</Text>
            <View style={styles.niveis}>
              {NIVEIS.map(({ valor, rotulo }) => {
                const selecionado = exposicao === valor;

                return (
                  <Pressable
                    key={valor}
                    style={[styles.nivel, selecionado && styles.nivelSelecionado]}
                    onPress={() => setExposicao(valor)}
                    accessibilityRole="radio"
                    accessibilityLabel={`Exposição solar ${rotulo}`}
                    accessibilityState={{ checked: selecionado }}
                  >
                    <Text style={[styles.textoNivel, selecionado && styles.textoNivelSelecionado]}>
                      {rotulo}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {foto ? (
            <View style={styles.previa}>
              <Image
                source={{ uri: foto }}
                style={styles.imagemPrevia}
                contentFit="cover"
                accessibilityLabel="Foto selecionada"
              />
              <Pressable
                style={styles.botaoRemover}
                onPress={() => setFoto(null)}
                accessibilityRole="button"
              >
                <Text style={styles.textoRemover}>Remover foto</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.botaoFoto}
              onPress={escolherFoto}
              accessibilityRole="button"
              accessibilityLabel="Adicionar foto, opcional"
            >
              <Camera size={26} color={cores.azulEscuro} />
              <Text style={styles.textoFoto}>Adicionar foto (opcional)</Text>
            </Pressable>
          )}

          {erro ? (
            <Text style={styles.erro} accessibilityLiveRegion="polite">
              {erro}
            </Text>
          ) : null}
          {sucesso ? (
            <Text style={styles.sucesso} accessibilityLiveRegion="polite">
              {sucesso}
            </Text>
          ) : null}

          <Pressable
            style={[styles.botaoSalvar, salvando && styles.botaoDesativado]}
            onPress={salvar}
            disabled={salvando}
            accessibilityRole="button"
            accessibilityLabel="Salvar registro"
            accessibilityState={{ disabled: salvando, busy: salvando }}
          >
            {salvando ? (
              <ActivityIndicator color={cores.branco} />
            ) : (
              <Text style={styles.textoSalvar}>Salvar registro</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <BarraNavegacao ativo="Diário" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: cores.branco,
    borderBottomWidth: 1,
    borderBottomColor: cores.bordaSuave,
  },
  botaoVoltar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: cores.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloCabecalho: {
    fontSize: 16,
    fontWeight: '700',
    color: cores.azulEscuro,
  },
  espacoCabecalho: {
    width: 44,
  },
  corpo: {
    flex: 1,
  },
  conteudo: {
    padding: 14,
    paddingBottom: 24,
    gap: 16,
  },
  cardRegistro: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.azulClaro,
    backgroundColor: cores.azulInfo,
  },
  tituloCard: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.textoTitulo,
  },
  dataCard: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  campo: {
    gap: 8,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoPrincipal,
  },
  entrada: {
    minHeight: 80,
    padding: 12,
    fontSize: 13,
    color: cores.textoPrincipal,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 14,
  },
  niveis: {
    flexDirection: 'row',
    gap: 8,
  },
  nivel: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 14,
  },
  nivelSelecionado: {
    backgroundColor: cores.azulClaro,
    borderColor: cores.azul,
  },
  textoNivel: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  textoNivelSelecionado: {
    fontWeight: '600',
    color: cores.azulEscuro,
  },
  botaoFoto: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 90,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: cores.azul,
    borderRadius: 16,
  },
  textoFoto: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoTitulo,
  },
  previa: {
    gap: 8,
  },
  imagemPrevia: {
    width: '100%',
    height: 180,
    borderRadius: 16,
  },
  botaoRemover: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  textoRemover: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.azulEscuro,
  },
  erro: {
    fontSize: 13,
    color: '#B42318',
  },
  sucesso: {
    fontSize: 13,
    color: '#1B7F4B',
  },
  botaoSalvar: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.azulEscuro,
    borderRadius: 14,
  },
  botaoDesativado: {
    opacity: 0.7,
  },
  textoSalvar: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.branco,
  },
});
