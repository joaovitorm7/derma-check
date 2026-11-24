import { router } from 'expo-router';
import { Bell, ChevronLeft, ChevronRight, FileText, Settings, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
import { encerrarSessao } from '../services/authService';
import { DadosPerfil, editarPerfil, obterPerfil, Perfil } from '../services/usuarioService';

const ATALHOS: { titulo: string; descricao: string; Icone: LucideIcon; destino: string }[] = [
  { titulo: 'Meus relatórios', descricao: 'Resumo do acompanhamento', Icone: FileText, destino: '/relatorios' },
  { titulo: 'Lembretes', descricao: 'Fotos, diário e consultas', Icone: Bell, destino: ROTAS.lembretes as string },
];

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

export default function TelaPerfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<DadosPerfil>({ nome: '', email: '', telefone: '', crm: '', especialidade: '' });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    obterPerfil()
      .then(({ usuario }) => setPerfil(usuario))
      .catch((e) => setErro(e instanceof Error ? e.message : 'Não foi possível carregar o perfil.'))
      .finally(() => setCarregando(false));
  }, []);

  const medico = perfil?.tipo_usuario === 'PROFISSIONAL';

  function abrirEdicao() {
    if (!perfil) return;
    setForm({
      nome: perfil.nome,
      email: perfil.email,
      telefone: perfil.telefone ?? '',
      crm: perfil.crm ?? '',
      especialidade: perfil.especialidade ?? '',
    });
    setErro('');
    setSucesso('');
    setEditando(true);
  }

  async function salvar() {
    setErro('');
    setSalvando(true);
    try {
      const { usuario } = await editarPerfil(form);
      setPerfil(usuario);
      setEditando(false);
      setSucesso('Dados atualizados.');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar os dados.');
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    await encerrarSessao();
    router.replace(ROTAS.login);
  }

  const campos: { chave: keyof DadosPerfil; rotulo: string }[] = [
    { chave: 'nome', rotulo: 'Nome' },
    { chave: 'email', rotulo: 'E-mail' },
    { chave: 'telefone', rotulo: 'Telefone (opcional)' },
    ...(medico
      ? [
          { chave: 'crm' as const, rotulo: 'CRM/UF' },
          { chave: 'especialidade' as const, rotulo: 'Especialidade' },
        ]
      : []),
  ];

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
          Perfil
        </Text>
        <Pressable
          style={styles.botaoConfiguracoes}
          onPress={() => router.push('/configuracoes' as never)}
          accessibilityRole="button"
          accessibilityLabel="Configurações"
        >
          <Settings size={24} color={cores.branco} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.corpo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          {carregando ? (
            <ActivityIndicator color={cores.azulEscuro} />
          ) : perfil ? (
            <>
              <View style={styles.cartao}>
                <View style={styles.avatar}>
                  <Text style={styles.textoAvatar}>{iniciais(perfil.nome)}</Text>
                </View>
                <Text style={styles.nome}>
                  {medico && !/^dra?\.?\s/i.test(perfil.nome) ? `Dr. ${perfil.nome}` : perfil.nome}
                </Text>
                <Text style={styles.email}>{perfil.email}</Text>
                <View style={styles.selo}>
                  <Text style={styles.textoSelo}>{medico ? 'Médico' : 'Paciente'}</Text>
                </View>

                {editando ? (
                  <View style={styles.formulario}>
                    {campos.map(({ chave, rotulo }) => (
                      <View key={chave} style={styles.campo}>
                        <Text style={styles.rotulo}>{rotulo}</Text>
                        <TextInput
                          style={styles.entrada}
                          value={form[chave] ?? ''}
                          onChangeText={(valor) => setForm((atual) => ({ ...atual, [chave]: valor }))}
                          autoCapitalize={chave === 'email' ? 'none' : 'sentences'}
                          keyboardType={chave === 'email' ? 'email-address' : chave === 'telefone' ? 'phone-pad' : 'default'}
                          accessibilityLabel={rotulo}
                        />
                      </View>
                    ))}
                    <View style={styles.acoes}>
                      <Pressable style={[styles.botaoContorno, styles.flex]} onPress={() => setEditando(false)} accessibilityRole="button">
                        <Text style={styles.textoContorno}>Cancelar</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.botaoPrimario, styles.flex, salvando && styles.desativado]}
                        onPress={salvar}
                        disabled={salvando}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: salvando, busy: salvando }}
                      >
                        {salvando ? <ActivityIndicator color={cores.branco} /> : <Text style={styles.textoPrimario}>Salvar</Text>}
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <Pressable style={[styles.botaoContorno, styles.largura]} onPress={abrirEdicao} accessibilityRole="button">
                    <Text style={styles.textoContorno}>Editar dados</Text>
                  </Pressable>
                )}
              </View>

              {medico && (
                <View style={styles.cartaoInfo}>
                  <View style={styles.linhaInfo}>
                    <Text style={styles.rotuloInfo}>CRM/UF</Text>
                    <Text style={styles.valorInfo}>{perfil.crm || '—'}</Text>
                  </View>
                  <View style={[styles.linhaInfo, styles.semBorda]}>
                    <Text style={styles.rotuloInfo}>Especialidade</Text>
                    <Text style={styles.valorInfo}>{perfil.especialidade || '—'}</Text>
                  </View>
                </View>
              )}
            </>
          ) : null}

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}
          {sucesso ? <Text style={styles.sucesso}>{sucesso}</Text> : null}

          <Text style={styles.tituloSecao}>Atalhos</Text>
          {ATALHOS.map(({ titulo, descricao, Icone, destino }) => (
            <Pressable
              key={titulo}
              style={styles.atalho}
              onPress={() => router.push(destino as never)}
              accessibilityRole="button"
              accessibilityLabel={`${titulo}. ${descricao}`}
            >
              <View style={styles.iconeAtalho}>
                <Icone size={22} color={cores.azulEscuro} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.tituloAtalho}>{titulo}</Text>
                <Text style={styles.descricaoAtalho}>{descricao}</Text>
              </View>
              <ChevronRight size={22} color={cores.azulEscuro} />
            </Pressable>
          ))}

          <Pressable style={styles.botaoSair} onPress={sair} accessibilityRole="button">
            <Text style={styles.textoSair}>Sair</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <BarraNavegacao ativo="Perfil" />
    </SafeAreaView>
  );
}

const VERMELHO = '#D92D20';

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
  botaoConfiguracoes: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#039BE5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#81C8F7',
  },
  corpo: { flex: 1 },
  conteudo: { padding: 20, paddingBottom: 28, gap: 14 },
  flex: { flex: 1 },
  cartao: {
    alignItems: 'center',
    gap: 6,
    padding: 20,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 18,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  textoAvatar: { fontSize: 24, fontWeight: '700', color: cores.azulEscuro },
  nome: { fontSize: 18, fontWeight: '700', color: cores.textoTitulo },
  email: { fontSize: 13, color: cores.textoSecundario },
  selo: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, backgroundColor: cores.azulClaro },
  textoSelo: { fontSize: 11, fontWeight: '600', color: cores.azulEscuro },
  largura: { alignSelf: 'stretch', marginTop: 10 },
  botaoContorno: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.azul,
  },
  textoContorno: { fontSize: 15, fontWeight: '600', color: cores.azulEscuro },
  formulario: { alignSelf: 'stretch', gap: 10, marginTop: 10 },
  campo: { gap: 4 },
  rotulo: { fontSize: 13, fontWeight: '600', color: cores.textoPrincipal },
  entrada: {
    minHeight: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: cores.textoPrincipal,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 12,
  },
  acoes: { flexDirection: 'row', gap: 10 },
  botaoPrimario: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.azulEscuro,
    borderRadius: 14,
  },
  textoPrimario: { fontSize: 15, fontWeight: '700', color: cores.branco },
  desativado: { opacity: 0.7 },
  cartaoInfo: {
    paddingHorizontal: 16,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 18,
  },
  linhaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: cores.bordaSuave,
  },
  semBorda: { borderBottomWidth: 0 },
  rotuloInfo: { fontSize: 13, color: cores.textoSecundario },
  valorInfo: { fontSize: 13, fontWeight: '700', color: cores.textoTitulo },
  tituloSecao: { marginTop: 8, fontSize: 16, fontWeight: '700', color: cores.azulEscuro },
  atalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 18,
  },
  iconeAtalho: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: cores.azulInfo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloAtalho: { fontSize: 15, fontWeight: '700', color: cores.textoTitulo },
  descricaoAtalho: { fontSize: 13, color: cores.textoSecundario },
  botaoSair: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: VERMELHO,
    backgroundColor: cores.branco,
  },
  textoSair: { fontSize: 15, fontWeight: '600', color: VERMELHO },
  erro: { fontSize: 13, color: '#B42318' },
  sucesso: { fontSize: 13, color: '#1B7F4B' },
});
