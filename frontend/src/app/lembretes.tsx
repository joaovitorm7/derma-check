import { router } from 'expo-router';
import {
  BriefcaseMedical,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Notebook,
  Settings,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
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

import { ROTAS } from '../constants/rotas';
import { cores } from '../constants/tema';
import {
  alterarConclusao,
  criarLembrete,
  excluirLembrete,
  Lembrete,
  listarLembretes,
  TipoLembrete,
} from '../services/lembreteService';

const OPCOES: { tipo: TipoLembrete; titulo: string; descricao: string; Icone: LucideIcon }[] = [
  { tipo: 'FOTO', titulo: 'Registrar novas fotografias', descricao: 'Lembrete de acompanhamento periódico', Icone: CalendarDays },
  { tipo: 'DIARIO', titulo: 'Atualizar diário da pele', descricao: 'Reserve um momento para registrar mudanças', Icone: Notebook },
  { tipo: 'CONSULTA', titulo: 'Consulta profissional', descricao: 'Adicione aqui a data do seu retorno', Icone: BriefcaseMedical },
];

const ROTULO_TIPO: Record<TipoLembrete, string> = {
  FOTO: 'Fotografias',
  DIARIO: 'Diário',
  CONSULTA: 'Consulta',
  OUTRO: 'Outro',
};

const AVISO_PADRAO = 'Nenhuma notificação será enviada nesta versão.';

// "DD/MM/AAAA" -> "AAAA-MM-DD 12:00:00", ou null se a data não existir.
function converterData(texto: string): string | null {
  const partes = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!partes) return null;

  const [, dia, mes, ano] = partes;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (data.getDate() !== Number(dia) || data.getMonth() !== Number(mes) - 1) return null;

  // Meio-dia evita que o fuso horário desloque a data para o dia anterior na exibição.
  return `${ano}-${mes}-${dia} 12:00:00`;
}

function formatarData(valor: string): string {
  return new Date(valor).toLocaleDateString('pt-BR');
}

export default function Lembretes() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [aviso, setAviso] = useState(AVISO_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [formAberto, setFormAberto] = useState(false);
  const [tipo, setTipo] = useState<TipoLembrete>('OUTRO');
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);

  function carregar() {
    return listarLembretes()
      .then((resposta) => {
        setLembretes(resposta.lembretes);
        if (resposta.aviso_notificacoes) setAviso(resposta.aviso_notificacoes);
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Não foi possível carregar os lembretes.'))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirFormulario(novoTipo: TipoLembrete) {
    setTipo(novoTipo);
    setTitulo('');
    setData('');
    setObservacoes('');
    setErro('');
    setSucesso('');
    setFormAberto(true);
  }

  async function salvar() {
    setErro('');
    setSucesso('');

    if (!titulo.trim()) {
      setErro('Informe um título para o lembrete.');
      return;
    }

    const dataConvertida = converterData(data);
    if (!dataConvertida) {
      setErro('Informe uma data válida no formato DD/MM/AAAA.');
      return;
    }

    setSalvando(true);
    try {
      await criarLembrete({ titulo: titulo.trim(), tipo, data_lembrete: dataConvertida, observacoes });
      setFormAberto(false);
      setSucesso('Lembrete salvo.');
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar o lembrete.');
    } finally {
      setSalvando(false);
    }
  }

  async function alternar(lembrete: Lembrete) {
    setErro('');
    try {
      await alterarConclusao(lembrete.id, !lembrete.concluido);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível atualizar o lembrete.');
    }
  }

  async function excluir(id: number) {
    setErro('');
    try {
      await excluirLembrete(id);
      await carregar();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível excluir o lembrete.');
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
          Lembretes
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
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitulo}>Organize seu acompanhamento e seus retornos.</Text>

          {OPCOES.map(({ tipo: tipoOpcao, titulo: tituloOpcao, descricao, Icone }) => (
            <Pressable
              key={tipoOpcao}
              style={styles.card}
              onPress={() => abrirFormulario(tipoOpcao)}
              accessibilityRole="button"
              accessibilityLabel={`${tituloOpcao}. ${descricao}`}
            >
              <View style={styles.iconeCard}>
                <Icone size={22} color={cores.azulEscuro} />
              </View>
              <View style={styles.textosCard}>
                <Text style={styles.tituloCard}>{tituloOpcao}</Text>
                <Text style={styles.descricaoCard}>{descricao}</Text>
              </View>
              <ChevronRight size={22} color={cores.azulEscuro} />
            </Pressable>
          ))}

          {formAberto ? (
            <View style={styles.formulario}>
              <Text style={styles.rotulo}>Tipo</Text>
              <View style={styles.tipos}>
                {(Object.keys(ROTULO_TIPO) as TipoLembrete[]).map((valor) => {
                  const selecionado = tipo === valor;
                  return (
                    <Pressable
                      key={valor}
                      style={[styles.tipo, selecionado && styles.tipoSelecionado]}
                      onPress={() => setTipo(valor)}
                      accessibilityRole="radio"
                      accessibilityLabel={ROTULO_TIPO[valor]}
                      accessibilityState={{ checked: selecionado }}
                    >
                      <Text style={[styles.textoTipo, selecionado && styles.textoTipoSelecionado]}>
                        {ROTULO_TIPO[valor]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.rotulo}>Título</Text>
              <TextInput
                style={styles.entrada}
                value={titulo}
                onChangeText={setTitulo}
                maxLength={150}
                placeholder="Ex.: Retorno com dermatologista"
                placeholderTextColor={cores.placeholder}
                accessibilityLabel="Título"
              />

              <Text style={styles.rotulo}>Data</Text>
              <TextInput
                style={styles.entrada}
                value={data}
                onChangeText={setData}
                maxLength={10}
                keyboardType="numbers-and-punctuation"
                placeholder="DD/MM/AAAA"
                placeholderTextColor={cores.placeholder}
                accessibilityLabel="Data no formato dia, mês e ano"
              />

              <Text style={styles.rotulo}>Observações (opcional)</Text>
              <TextInput
                style={[styles.entrada, styles.entradaMultilinha]}
                value={observacoes}
                onChangeText={setObservacoes}
                multiline
                textAlignVertical="top"
                placeholderTextColor={cores.placeholder}
                accessibilityLabel="Observações"
              />

              <View style={styles.acoesFormulario}>
                <Pressable
                  style={styles.botaoSecundario}
                  onPress={() => setFormAberto(false)}
                  accessibilityRole="button"
                >
                  <Text style={styles.textoSecundario}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.botaoPrimario, styles.flex, salvando && styles.botaoDesativado]}
                  onPress={salvar}
                  disabled={salvando}
                  accessibilityRole="button"
                  accessibilityLabel="Salvar lembrete"
                  accessibilityState={{ disabled: salvando, busy: salvando }}
                >
                  {salvando ? (
                    <ActivityIndicator color={cores.branco} />
                  ) : (
                    <Text style={styles.textoPrimario}>Salvar lembrete</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.botaoPrimario}
              onPress={() => abrirFormulario('OUTRO')}
              accessibilityRole="button"
              accessibilityLabel="Novo lembrete, demonstração"
            >
              <Text style={styles.textoPrimario}>+ Novo lembrete (demonstração)</Text>
            </Pressable>
          )}

          <Text style={styles.aviso}>{aviso}</Text>

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

          <Text style={styles.tituloSecao} accessibilityRole="header">
            Meus lembretes
          </Text>

          {carregando ? (
            <ActivityIndicator color={cores.azulEscuro} />
          ) : lembretes.length === 0 ? (
            <Text style={styles.vazio}>Você ainda não tem lembretes cadastrados.</Text>
          ) : (
            lembretes.map((lembrete) => {
              const concluido = Boolean(lembrete.concluido);
              return (
                <View key={lembrete.id} style={styles.item}>
                  <Pressable
                    style={styles.botaoConcluir}
                    onPress={() => alternar(lembrete)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Concluído: ${lembrete.titulo}`}
                    accessibilityState={{ checked: concluido }}
                  >
                    <View style={[styles.check, concluido && styles.checkMarcado]}>
                      {concluido ? <Check size={16} color={cores.branco} /> : null}
                    </View>
                    <Text style={styles.textoConcluir}>{concluido ? 'Concluído' : 'Concluir'}</Text>
                  </Pressable>
                  <View style={styles.textosCard}>
                    <Text style={[styles.tituloCard, concluido && styles.riscado]}>{lembrete.titulo}</Text>
                    <Text style={styles.descricaoCard}>
                      {ROTULO_TIPO[lembrete.tipo]} · {formatarData(lembrete.data_lembrete)}
                    </Text>
                    {lembrete.observacoes ? (
                      <Text style={styles.descricaoCard}>{lembrete.observacoes}</Text>
                    ) : null}
                  </View>
                  <Pressable
                    style={styles.botaoExcluir}
                    onPress={() => excluir(lembrete.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Excluir ${lembrete.titulo}`}
                  >
                    <Trash2 size={20} color="#B42318" />
                  </Pressable>
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 17,
    fontWeight: '700',
    color: cores.azulEscuro,
  },
  botaoConfiguracoes: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#039BE5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#81C8F7',
    elevation: 4,
  },
  corpo: {
    flex: 1,
  },
  conteudo: {
    padding: 20,
    paddingBottom: 28,
    gap: 14,
  },
  subtitulo: {
    fontSize: 14,
    color: cores.textoSecundario,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 18,
  },
  iconeCard: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: cores.azulInfo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textosCard: {
    flex: 1,
    gap: 4,
  },
  tituloCard: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.textoTitulo,
  },
  descricaoCard: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  formulario: {
    gap: 8,
    padding: 16,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 18,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoPrincipal,
  },
  tipos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipo: {
    minHeight: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 14,
  },
  tipoSelecionado: {
    backgroundColor: cores.azulClaro,
    borderColor: cores.azul,
  },
  textoTipo: {
    fontSize: 13,
    color: cores.textoSecundario,
  },
  textoTipoSelecionado: {
    fontWeight: '600',
    color: cores.azulEscuro,
  },
  entrada: {
    minHeight: 44,
    paddingHorizontal: 12,
    fontSize: 13,
    color: cores.textoPrincipal,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 14,
  },
  entradaMultilinha: {
    minHeight: 80,
    paddingVertical: 12,
  },
  acoesFormulario: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  flex: {
    flex: 1,
  },
  botaoPrimario: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.azulEscuro,
    borderRadius: 14,
  },
  botaoDesativado: {
    opacity: 0.7,
  },
  textoPrimario: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.branco,
  },
  botaoSecundario: {
    minHeight: 52,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: cores.azulClaro,
  },
  textoSecundario: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.azulEscuro,
  },
  aviso: {
    fontSize: 12,
    textAlign: 'center',
    color: cores.textoSecundario,
  },
  erro: {
    fontSize: 13,
    color: '#B42318',
  },
  sucesso: {
    fontSize: 13,
    color: '#1B7F4B',
  },
  tituloSecao: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
    color: cores.textoTitulo,
  },
  vazio: {
    fontSize: 13,
    color: cores.textoSuave,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 16,
  },
  botaoConcluir: {
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  textoConcluir: {
    fontSize: 11,
    fontWeight: '600',
    color: cores.azulEscuro,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: cores.azul,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMarcado: {
    backgroundColor: cores.azulEscuro,
    borderColor: cores.azulEscuro,
  },
  riscado: {
    textDecorationLine: 'line-through',
    color: cores.textoSuave,
  },
  botaoExcluir: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
