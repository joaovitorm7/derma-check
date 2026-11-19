
import { router, useFocusEffect } from 'expo-router';
import {
    AlertCircle,
    ArrowDownAZ,
    ArrowDownWideNarrow,
    CalendarDays,
    ChevronRight,
    FileText,
    GitCompareArrows,
    Image as ImageIcon,
    MapPin,
    Pencil,
    Plus,
    RefreshCw,
    ShieldCheck,
    Trash2,
    X,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { BarraNavegacao } from '../components/barra-navegacao';
import api from '../services/api';
import { obterToken } from '../services/authService';

const AZUL = '#2463A6';
const AZUL_CLARO = '#EAF3FC';
const FUNDO = '#F5F9FE';
const TEXTO = '#18324F';
const CINZA = '#64748B';

type Foto = {
  id?: number | string;
  url_foto?: string;
  observacao_foto?: string;
  data_registro?: string;
  created_at?: string;
  createdAt?: string;
};

type Lesao = {
  id?: number | string;
  lesaoId?: number | string;
  nome_identificacao?: string;
  localizacao_corpo?: string;
  observacoes?: string;
  data_registro?: string;
  created_at?: string;
  createdAt?: string;
  fotos?: Foto[];
  relatorio_disponivel?: boolean;
  relatorio_url?: string;
  relatorio?: string;
};

type Ordenacao = 'recentes' | 'antigas' | 'nome';

export default function Historico() {
  const [lesoes, setLesoes] = useState<Lesao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('recentes');
  const [modalOrdenacao, setModalOrdenacao] = useState(false);
  const [modalComparacao, setModalComparacao] = useState(false);
  const [fotosSelecionadas, setFotosSelecionadas] = useState<Foto[]>([]);

  const obterId = (lesao: Lesao) => lesao.id ?? lesao.lesaoId;

  function obterData(valor?: string) {
    if (!valor) return new Date(0);

    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? new Date(0) : data;
  }

  function formatarData(valor?: string) {
    const data = obterData(valor);

    if (data.getTime() === 0) return 'Data não informada';

    return data.toLocaleDateString('pt-BR');
  }

  function dataDaLesao(lesao: Lesao) {
    return lesao.data_registro || lesao.created_at || lesao.createdAt;
  }

  const carregarLesoes = useCallback(async () => {
    setCarregando(true);
    setErro('');

    try {
      const token = await obterToken();

      if (!token) {
        Alert.alert(
          'Sessão expirada',
          'Faça login novamente para acessar suas lesões.',
          [{ text: 'OK', onPress: () => router.replace('/login' as never) }]
        );
        return;
      }

      const resposta = await api.get('/api/lesoes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = Array.isArray(resposta.data)
        ? resposta.data
        : resposta.data?.lesoes || resposta.data?.registros || [];

      setLesoes(Array.isArray(dados) ? dados : []);
    } catch (error: any) {
      setErro(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Não foi possível carregar suas lesões. Tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarLesoes();
    }, [carregarLesoes])
  );

  const lesoesOrdenadas = [...lesoes].sort((a, b) => {
    if (ordenacao === 'nome') {
      return (a.nome_identificacao || '').localeCompare(
        b.nome_identificacao || '',
        'pt-BR'
      );
    }

    const dataA = obterData(dataDaLesao(a)).getTime();
    const dataB = obterData(dataDaLesao(b)).getTime();

    return ordenacao === 'recentes' ? dataB - dataA : dataA - dataB;
  });

  function abrirDetalhes(lesao: Lesao) {
    const id = obterId(lesao);

    if (!id) {
      Alert.alert('Erro', 'Não foi possível identificar esta lesão.');
      return;
    }

    router.push({
      pathname: '/analise',
      params: { id: String(id) },
    });
  }

  function editarLesao(lesao: Lesao) {
    const id = obterId(lesao);

    if (!id) {
      Alert.alert('Erro', 'Não foi possível identificar esta lesão.');
      return;
    }

    router.push({
      pathname: '/nova-lesao',
      params: {
        id: String(id),
        modo: 'editar',
      },
    });
  }

  async function excluirLesao(lesao: Lesao) {
    const id = obterId(lesao);

    if (!id) {
      Alert.alert('Erro', 'Não foi possível identificar esta lesão.');
      return;
    }

    Alert.alert(
      'Excluir lesão',
      `Deseja realmente excluir "${lesao.nome_identificacao || 'esta lesão'}"? Essa ação não poderá ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await obterToken();

              if (!token) {
                router.replace('/login' as never);
                return;
              }

              await api.delete(`/api/lesoes/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              setLesoes((atuais) =>
                atuais.filter((item) => String(obterId(item)) !== String(id))
              );

              Alert.alert('Sucesso', 'Lesão excluída com sucesso.');
            } catch (error: any) {
              Alert.alert(
                'Não foi possível excluir',
                error?.response?.data?.message ||
                  error?.response?.data?.error ||
                  'Verifique sua conexão ou tente novamente.'
              );
            }
          },
        },
      ]
    );
  }

  function abrirComparacao(fotos: Foto[]) {
    const fotosValidas = fotos.filter((foto) => !!foto.url_foto);

    if (fotosValidas.length < 2) {
      Alert.alert(
        'Imagens insuficientes',
        'É necessário possuir pelo menos duas fotografias para realizar a comparação.'
      );
      return;
    }

    setFotosSelecionadas(fotosValidas);
    setModalComparacao(true);
  }

  async function abrirRelatorio(lesao: Lesao) {
    const id = obterId(lesao);

    if (lesao.relatorio_url) {
      try {
        await Linking.openURL(lesao.relatorio_url);
      } catch {
        Alert.alert('Erro', 'Não foi possível abrir o relatório.');
      }
      return;
    }

    if (id) {
      router.push({
        pathname: '/analise',
        params: { id: String(id) },
      });
    }
  }

  function selecionarOrdenacao(valor: Ordenacao) {
    setOrdenacao(valor);
    setModalOrdenacao(false);
  }

  function renderLesao(lesao: Lesao, index: number) {
    const id = obterId(lesao);
    const fotos = lesao.fotos || [];
    const primeiraFoto = fotos.find((foto) => !!foto.url_foto)?.url_foto;

    const possuiRelatorio =
      lesao.relatorio_disponivel === true ||
      !!lesao.relatorio_url ||
      !!lesao.relatorio;

    return (
      <View key={String(id ?? index)} style={styles.cardLesao}>
        <View style={styles.cabecalhoCard}>
          <Text style={styles.identificadorCard}>
            LESÃO {String(index + 1).padStart(2, '0')}
          </Text>

          <View style={styles.acoesTopo}>
            <Pressable
              style={styles.botaoIcone}
              onPress={() => editarLesao(lesao)}
              accessibilityRole="button"
              accessibilityLabel={`Editar ${lesao.nome_identificacao || 'lesão'}`}
            >
              <Pencil size={17} color={AZUL} />
            </Pressable>

            <Pressable
              style={styles.botaoIconeExcluir}
              onPress={() => excluirLesao(lesao)}
              accessibilityRole="button"
              accessibilityLabel={`Excluir ${lesao.nome_identificacao || 'lesão'}`}
            >
              <Trash2 size={17} color="#C45151" />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.areaPrincipal}
          onPress={() => abrirDetalhes(lesao)}
          accessibilityRole="button"
          accessibilityLabel={`Visualizar detalhes de ${lesao.nome_identificacao || 'lesão'}`}
        >
          {primeiraFoto ? (
            <Image
              source={{ uri: primeiraFoto }}
              style={styles.fotoLesao}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.fotoAusente}>
              <ImageIcon size={27} color={AZUL} />
              <Text style={styles.textoFotoAusente}>Sem foto</Text>
            </View>
          )}

          <View style={styles.informacoes}>
            <Text style={styles.nomeLesao} numberOfLines={2}>
              {lesao.nome_identificacao || 'Lesão sem identificação'}
            </Text>

            <View style={styles.linhaInfo}>
              <MapPin size={14} color={AZUL} />
              <Text style={styles.textoInfo} numberOfLines={1}>
                {lesao.localizacao_corpo || 'Local não informado'}
              </Text>
            </View>

            <View style={styles.linhaInfo}>
              <CalendarDays size={14} color={AZUL} />
              <Text style={styles.textoInfo}>
                {formatarData(dataDaLesao(lesao))}
              </Text>
            </View>

            <Text style={styles.quantidadeFotos}>
              {fotos.length} {fotos.length === 1 ? 'foto registrada' : 'fotos registradas'}
            </Text>

            <View style={styles.linkDetalhes}>
              <Text style={styles.textoLinkDetalhes}>Ver detalhes</Text>
              <ChevronRight size={16} color={AZUL} />
            </View>
          </View>
        </Pressable>

        {fotos.length > 0 && (
          <View style={styles.areaFotos}>
            <Text style={styles.tituloFotos}>Fotografias anteriores</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listaFotos}
            >
              {fotos.map((foto, fotoIndex) => (
                <Pressable
                  key={String(foto.id ?? fotoIndex)}
                  onPress={() => abrirDetalhes(lesao)}
                  accessibilityRole="button"
                  accessibilityLabel={`Visualizar fotografia ${fotoIndex + 1}`}
                >
                  {foto.url_foto ? (
                    <Image
                      source={{ uri: foto.url_foto }}
                      style={styles.miniatura}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.miniaturaAusente}>
                      <ImageIcon size={20} color={AZUL} />
                    </View>
                  )}
                  <Text style={styles.dataMiniatura}>
                    {formatarData(
                      foto.data_registro || foto.created_at || foto.createdAt
                    )}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.acoesCard}>
          {fotos.filter((foto) => !!foto.url_foto).length >= 2 && (
            <Pressable
              style={styles.botaoAcao}
              onPress={() => abrirComparacao(fotos)}
            >
              <GitCompareArrows size={15} color={AZUL} />
              <Text style={styles.textoAcao}>Comparar fotos</Text>
            </Pressable>
          )}

          <Pressable
            style={styles.botaoAcao}
            onPress={() => abrirRelatorio(lesao)}
          >
            <FileText size={15} color={AZUL} />
            <Text style={styles.textoAcao}>
              {possuiRelatorio ? 'Ver relatório' : 'Análise'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const textoOrdenacao = {
    recentes: 'Mais recentes',
    antigas: 'Mais antigas',
    nome: 'Nome',
  }[ordenacao];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cabecalho}>
          <View>
            <Text style={styles.marca}>
              Derma<Text style={styles.marcaAzul}>Check</Text>
            </Text>
            <Text style={styles.subtituloMarca}>
              Acompanhe sua pele com cuidado
            </Text>
          </View>

          <View style={styles.iconeCabecalho}>
            <ShieldCheck size={24} color={AZUL} />
          </View>
        </View>

        <View style={styles.tituloArea}>
          <View style={styles.tituloTextoArea}>
            <Text style={styles.titulo}>Minhas lesões</Text>
            <Text style={styles.subtitulo}>
              Consulte e gerencie suas lesões registradas.
            </Text>
          </View>

          <Pressable
            style={styles.botaoAtualizar}
            onPress={carregarLesoes}
            disabled={carregando}
            accessibilityLabel="Atualizar lista de lesões"
          >
            <RefreshCw size={19} color={AZUL} />
          </Pressable>
        </View>

        <View style={styles.resumo}>
          <View style={styles.resumoIcone}>
            <ImageIcon size={23} color={AZUL} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.resumoNumero}>{lesoes.length}</Text>
            <Text style={styles.resumoTexto}>
              {lesoes.length === 1 ? 'Lesão cadastrada' : 'Lesões cadastradas'}
            </Text>
          </View>

          <Pressable
            style={styles.botaoAdicionar}
            onPress={() => router.push('/nova-lesao' as never)}
          >
            <Plus size={18} color="#FFFFFF" />
            <Text style={styles.textoBotaoAdicionar}>Adicionar</Text>
          </Pressable>
        </View>

        <View style={styles.cabecalhoLista}>
          <View>
            <Text style={styles.tituloSecao}>Seus registros</Text>
            <Text style={styles.subtituloLista}>
              {lesoes.length} {lesoes.length === 1 ? 'registro' : 'registros'}
            </Text>
          </View>

          <Pressable
            style={styles.botaoOrdenar}
            onPress={() => setModalOrdenacao(true)}
          >
            {ordenacao === 'nome' ? (
              <ArrowDownAZ size={16} color={AZUL} />
            ) : (
              <ArrowDownWideNarrow size={16} color={AZUL} />
            )}
            <Text style={styles.textoOrdenar}>{textoOrdenacao}</Text>
          </Pressable>
        </View>

        {carregando ? (
          <View style={styles.estado}>
            <ActivityIndicator size="large" color={AZUL} />
            <Text style={styles.textoEstado}>Carregando suas lesões...</Text>
          </View>
        ) : erro ? (
          <View style={styles.estado}>
            <AlertCircle size={40} color="#D45B5B" />
            <Text style={styles.estadoTitulo}>
              Não foi possível carregar
            </Text>
            <Text style={styles.textoEstado}>{erro}</Text>

            <Pressable
              style={styles.botaoTentar}
              onPress={carregarLesoes}
            >
              <Text style={styles.textoBotaoTentar}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : lesoesOrdenadas.length === 0 ? (
          <View style={styles.estadoVazio}>
            <View style={styles.iconeVazio}>
              <ImageIcon size={38} color={AZUL} />
            </View>

            <Text style={styles.estadoTitulo}>
              Nenhuma lesão cadastrada
            </Text>
            <Text style={styles.textoEstado}>
              Você ainda não cadastrou nenhuma lesão. Adicione seu primeiro
              registro para acompanhar suas fotografias e informações ao longo
              do tempo.
            </Text>

            <Pressable
              style={styles.botaoPrincipal}
              onPress={() => router.push('/nova-lesao' as never)}
            >
              <Plus size={19} color="#FFFFFF" />
              <Text style={styles.textoBotaoPrincipal}>
                Adicionar primeira lesão
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.listaLesoes}>
            {lesoesOrdenadas.map(renderLesao)}
          </View>
        )}

        <View style={styles.aviso}>
          <ShieldCheck size={21} color={AZUL} />
          <View style={{ flex: 1 }}>
            <Text style={styles.avisoTitulo}>Importante</Text>
            <Text style={styles.avisoTexto}>
              O acompanhamento das lesões ajuda a observar mudanças ao longo
              do tempo, mas não substitui uma avaliação médica.
            </Text>
          </View>
        </View>
      </ScrollView>

      <BarraNavegacao ativo="Histórico" />

      <Modal
        visible={modalOrdenacao}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOrdenacao(false)}
      >
        <Pressable
          style={styles.fundoModal}
          onPress={() => setModalOrdenacao(false)}
        >
          <Pressable style={styles.modalOrdenacao} onPress={() => {}}>
            <View style={styles.modalCabecalho}>
              <Text style={styles.modalTitulo}>Ordenar lesões</Text>
              <Pressable onPress={() => setModalOrdenacao(false)}>
                <X size={22} color={AZUL} />
              </Pressable>
            </View>

            <Pressable
              style={styles.opcaoOrdenacao}
              onPress={() => selecionarOrdenacao('recentes')}
            >
              <CalendarDays size={19} color={AZUL} />
              <Text style={styles.textoOpcao}>Mais recentes primeiro</Text>
              {ordenacao === 'recentes' && (
                <Text style={styles.selecionado}>✓</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.opcaoOrdenacao}
              onPress={() => selecionarOrdenacao('antigas')}
            >
              <CalendarDays size={19} color={AZUL} />
              <Text style={styles.textoOpcao}>Mais antigas primeiro</Text>
              {ordenacao === 'antigas' && (
                <Text style={styles.selecionado}>✓</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.opcaoOrdenacao}
              onPress={() => selecionarOrdenacao('nome')}
            >
              <ArrowDownAZ size={19} color={AZUL} />
              <Text style={styles.textoOpcao}>Nome (A-Z)</Text>
              {ordenacao === 'nome' && (
                <Text style={styles.selecionado}>✓</Text>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={modalComparacao}
        animationType="slide"
        transparent
        onRequestClose={() => setModalComparacao(false)}
      >
        <View style={styles.fundoModalComparacao}>
          <View style={styles.modalComparacao}>
            <View style={styles.modalCabecalho}>
              <View>
                <Text style={styles.modalTitulo}>
                  Comparação de fotografias
                </Text>
                <Text style={styles.modalSubtitulo}>
                  Registros realizados em datas diferentes
                </Text>
              </View>

              <Pressable
                onPress={() => setModalComparacao(false)}
                style={styles.botaoFechar}
                accessibilityLabel="Fechar comparação"
              >
                <X size={22} color={AZUL} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.listaComparacao}>
                {fotosSelecionadas.map((foto, index) => (
                  <View
                    key={String(foto.id ?? index)}
                    style={styles.fotoComparacao}
                  >
                    {foto.url_foto && (
                      <Image
                        source={{ uri: foto.url_foto }}
                        style={styles.fotoGrande}
                        resizeMode="contain"
                      />
                    )}

                    <Text style={styles.dataComparacao}>
                      {formatarData(
                        foto.data_registro || foto.created_at || foto.createdAt
                      )}
                    </Text>

                    {foto.observacao_foto ? (
                      <Text style={styles.observacaoFoto}>
                        {foto.observacao_foto}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>

              <Text style={styles.notaComparacao}>
                Compare visualmente os registros. Esta funcionalidade não
                realiza diagnóstico ou análise médica automática.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FUNDO,
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  marca: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXTO,
  },
  marcaAzul: {
    color: AZUL,
  },
  subtituloMarca: {
    fontSize: 12,
    color: CINZA,
    marginTop: 2,
  },
  iconeCabecalho: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: AZUL_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  tituloTextoArea: {
    flex: 1,
    paddingRight: 10,
  },
  titulo: {
    fontSize: 25,
    fontWeight: '800',
    color: TEXTO,
  },
  subtitulo: {
    fontSize: 13,
    color: CINZA,
    marginTop: 5,
    lineHeight: 19,
  },
  botaoAtualizar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AZUL_CLARO,
    padding: 14,
    borderRadius: 15,
    gap: 12,
    marginBottom: 25,
  },
  resumoIcone: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumoNumero: {
    fontSize: 21,
    fontWeight: '800',
    color: TEXTO,
  },
  resumoTexto: {
    fontSize: 12,
    color: '#52677D',
    marginTop: 2,
  },
  botaoAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AZUL,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 5,
  },
  textoBotaoAdicionar: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cabecalhoLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  tituloSecao: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXTO,
  },
  subtituloLista: {
    fontSize: 11,
    color: CINZA,
    marginTop: 3,
  },
  botaoOrdenar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE8F5',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  textoOrdenar: {
    fontSize: 10,
    color: AZUL,
    fontWeight: '700',
  },
  listaLesoes: {
    gap: 13,
  },
  cardLesao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0EAF5',
    overflow: 'hidden',
  },
  cabecalhoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  identificadorCard: {
    fontSize: 10,
    color: CINZA,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  acoesTopo: {
    flexDirection: 'row',
    gap: 7,
  },
  botaoIcone: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: AZUL_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoIconeExcluir: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaPrincipal: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 8,
    gap: 12,
  },
  fotoLesao: {
    width: 88,
    height: 100,
    borderRadius: 11,
    backgroundColor: AZUL_CLARO,
  },
  fotoAusente: {
    width: 88,
    height: 100,
    borderRadius: 11,
    backgroundColor: AZUL_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  textoFotoAusente: {
    fontSize: 10,
    color: AZUL,
    fontWeight: '600',
  },
  informacoes: {
    flex: 1,
    justifyContent: 'center',
  },
  nomeLesao: {
    fontSize: 14,
    fontWeight: '800',
    color: TEXTO,
    marginBottom: 8,
  },
  linhaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  textoInfo: {
    fontSize: 11,
    color: '#52677D',
    flex: 1,
  },
  quantidadeFotos: {
    fontSize: 10,
    color: AZUL,
    fontWeight: '700',
    marginTop: 1,
  },
  linkDetalhes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 2,
  },
  textoLinkDetalhes: {
    fontSize: 11,
    color: AZUL,
    fontWeight: '700',
  },
  areaFotos: {
    borderTopWidth: 1,
    borderTopColor: '#E8EFF6',
    padding: 11,
  },
  tituloFotos: {
    fontSize: 11,
    color: TEXTO,
    fontWeight: '700',
    marginBottom: 9,
  },
  listaFotos: {
    gap: 9,
  },
  miniatura: {
    width: 65,
    height: 65,
    borderRadius: 9,
    backgroundColor: AZUL_CLARO,
  },
  miniaturaAusente: {
    width: 65,
    height: 65,
    borderRadius: 9,
    backgroundColor: AZUL_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataMiniatura: {
    fontSize: 9,
    color: CINZA,
    marginTop: 4,
    textAlign: 'center',
  },
  acoesCard: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E8EFF6',
  },
  botaoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: AZUL_CLARO,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
  },
  textoAcao: {
    fontSize: 10,
    fontWeight: '700',
    color: AZUL,
  },
  estado: {
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  estadoVazio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E0EAF5',
    alignItems: 'center',
    padding: 24,
  },
  iconeVazio: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: AZUL_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  estadoTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXTO,
    textAlign: 'center',
  },
  textoEstado: {
    fontSize: 13,
    color: CINZA,
    textAlign: 'center',
    lineHeight: 20,
  },
  botaoPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AZUL,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    gap: 8,
    marginTop: 18,
    width: '100%',
  },
  textoBotaoPrincipal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  botaoTentar: {
    backgroundColor: AZUL,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },
  textoBotaoTentar: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  aviso: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E0EAF5',
    padding: 14,
    gap: 10,
    marginTop: 23,
  },
  avisoTitulo: {
    fontSize: 13,
    fontWeight: '800',
    color: TEXTO,
  },
  avisoTexto: {
    fontSize: 11,
    color: CINZA,
    lineHeight: 17,
    marginTop: 3,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(15, 35, 55, 0.45)',
    justifyContent: 'center',
    padding: 25,
  },
  modalOrdenacao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 18,
  },
  modalCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXTO,
  },
  opcaoOrdenacao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    gap: 11,
  },
  textoOpcao: {
    flex: 1,
    color: TEXTO,
    fontSize: 13,
  },
  selecionado: {
    color: AZUL,
    fontSize: 17,
    fontWeight: '800',
  },
  fundoModalComparacao: {
    flex: 1,
    backgroundColor: 'rgba(15, 35, 55, 0.55)',
    justifyContent: 'flex-end',
  },
  modalComparacao: {
    backgroundColor: FUNDO,
    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
    padding: 20,
    maxHeight: '85%',
  },
  modalSubtitulo: {
    fontSize: 11,
    color: CINZA,
    marginTop: 4,
  },
  botaoFechar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: AZUL_CLARO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listaComparacao: {
    gap: 14,
  },
  fotoComparacao: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E0EAF5',
  },
  fotoGrande: {
    width: '100%',
    height: 220,
    borderRadius: 9,
    backgroundColor: AZUL_CLARO,
  },
  dataComparacao: {
    color: AZUL,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 9,
  },
  observacaoFoto: {
    color: CINZA,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 5,
  },
  notaComparacao: {
    fontSize: 11,
    color: CINZA,
    lineHeight: 17,
    marginTop: 15,
    marginBottom: 15,
  },
});
