import Constants from 'expo-constants';
import { router } from 'expo-router';
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  KeyRound,
  ShieldCheck,
  Trash2,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ROTAS } from '../constants/rotas';
import { cores } from '../constants/tema';
import { alterarSenha } from '../services/usuarioService';

const VERMELHO = '#D92D20';
const EM_BREVE = 'Disponível em uma próxima versão.';

function Item({
  Icone,
  titulo,
  onPress,
  perigo,
  direita,
  ultimo,
}: {
  Icone: LucideIcon;
  titulo: string;
  onPress?: () => void;
  perigo?: boolean;
  direita?: ReactNode;
  ultimo?: boolean;
}) {
  const cor = perigo ? VERMELHO : cores.azulEscuro;
  return (
    <Pressable
      style={[styles.item, ultimo && styles.semBorda]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <Icone size={20} color={cor} />
      <Text style={[styles.tituloItem, perigo && { color: VERMELHO }]}>{titulo}</Text>
      {direita ?? <ChevronRight size={20} color={cores.textoSuave} />}
    </Pressable>
  );
}

export default function Configuracoes() {
  const [aviso, setAviso] = useState('');
  const [notificacoes, setNotificacoes] = useState(true);

  const [trocandoSenha, setTrocandoSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function salvarSenha() {
    setErro('');
    setSucesso('');
    setSalvando(true);
    try {
      await alterarSenha(senhaAtual, novaSenha);
      setSenhaAtual('');
      setNovaSenha('');
      setTrocandoSenha(false);
      setSucesso('Senha alterada com sucesso.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível alterar a senha.');
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
          Configurações
        </Text>
        <View style={styles.botaoVoltar} />
      </View>

      <KeyboardAvoidingView style={styles.corpo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <Text style={styles.secao}>CONTA</Text>
          <View style={styles.grupo}>
            <Item Icone={KeyRound} titulo="Alterar senha" onPress={() => setTrocandoSenha((v) => !v)} />
            {trocandoSenha && (
              <View style={styles.formulario}>
                <TextInput
                  style={styles.entrada}
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  secureTextEntry
                  placeholder="Senha atual"
                  placeholderTextColor={cores.placeholder}
                  accessibilityLabel="Senha atual"
                />
                <TextInput
                  style={styles.entrada}
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  secureTextEntry
                  placeholder="Nova senha (8+ caracteres, letras e números)"
                  placeholderTextColor={cores.placeholder}
                  accessibilityLabel="Nova senha"
                />
                <Pressable
                  style={[styles.botaoPrimario, salvando && styles.desativado]}
                  onPress={salvarSenha}
                  disabled={salvando}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: salvando, busy: salvando }}
                >
                  {salvando ? <ActivityIndicator color={cores.branco} /> : <Text style={styles.textoPrimario}>Salvar senha</Text>}
                </Pressable>
              </View>
            )}
            <Item Icone={UserRound} titulo="Dados pessoais" onPress={() => router.push('/perfil' as never)} ultimo />
          </View>
          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          {sucesso ? <Text style={styles.sucesso}>{sucesso}</Text> : null}

          <Text style={styles.secao}>NOTIFICAÇÕES</Text>
          <View style={[styles.grupo, styles.linhaNotificacao]}>
            <Bell size={20} color={cores.azulEscuro} />
            <View style={styles.flex}>
              <Text style={styles.tituloItem}>Lembretes</Text>
              <Text style={styles.descricao}>Demonstração: nenhuma notificação é enviada.</Text>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              trackColor={{ true: cores.azulEscuro }}
              accessibilityLabel="Lembretes"
            />
          </View>

          <Text style={styles.secao}>PRIVACIDADE</Text>
          <View style={styles.grupo}>
            <Item Icone={ShieldCheck} titulo="Política de privacidade (LGPD)" onPress={() => setAviso(EM_BREVE)} />
            <Item Icone={FileText} titulo="Termos de uso" onPress={() => setAviso(EM_BREVE)} />
            <Item Icone={Check} titulo="Gerenciar consentimento" onPress={() => setAviso(EM_BREVE)} />
            <Item Icone={Trash2} titulo="Excluir minha conta" onPress={() => setAviso(EM_BREVE)} perigo ultimo />
          </View>
          {aviso ? <Text style={styles.descricao}>{aviso}</Text> : null}

          <Text style={styles.secao}>SOBRE</Text>
          <View style={styles.grupo}>
            <Item
              Icone={Info}
              titulo="Versão do app"
              direita={<Text style={styles.descricao}>{Constants.expoConfig?.version ?? '1.0.0'} (demo)</Text>}
              ultimo
            />
          </View>

          <Text style={styles.rodape}>
            O DermaCheck auxilia na organização de informações e não substitui a avaliação de um profissional de saúde.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  botaoVoltar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: cores.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloCabecalho: { fontSize: 17, fontWeight: '700', color: cores.azulEscuro },
  corpo: { flex: 1 },
  conteudo: { padding: 20, paddingBottom: 28, gap: 8 },
  flex: { flex: 1 },
  secao: { marginTop: 10, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, color: cores.textoSecundario },
  grupo: {
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: cores.bordaSuave,
  },
  semBorda: { borderBottomWidth: 0 },
  tituloItem: { flex: 1, fontSize: 14, fontWeight: '600', color: cores.textoTitulo },
  descricao: { fontSize: 12, color: cores.textoSecundario },
  linhaNotificacao: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  formulario: { gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: cores.bordaSuave },
  entrada: {
    minHeight: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: cores.textoPrincipal,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 12,
  },
  botaoPrimario: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.azulEscuro,
    borderRadius: 12,
  },
  textoPrimario: { fontSize: 15, fontWeight: '700', color: cores.branco },
  desativado: { opacity: 0.7 },
  erro: { fontSize: 13, color: '#B42318' },
  sucesso: { fontSize: 13, color: '#1B7F4B' },
  rodape: { marginTop: 12, fontSize: 12, textAlign: 'center', color: cores.textoSuave },
});
