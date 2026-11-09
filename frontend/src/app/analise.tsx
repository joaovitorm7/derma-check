
import { router, useLocalSearchParams } from 'expo-router';
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Info,
    MapPin,
    ShieldCheck,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import api from '../services/api';
import { obterToken } from '../services/authService';

const AZUL = '#2463A6';
const AZUL_CLARO = '#EAF3FC';
const FUNDO = '#F5F9FE';
const TEXTO = '#18324F';

type DetalhesLesao = {
  nome_identificacao?: string;
  localizacao_corpo?: string;
  observacoes?: string;
  data_registro?: string;
  fotos?: Array<{
    url_foto?: string;
    observacao_foto?: string;
  }>;
};

type Indicadores = {
  assimetria?: string;
  bordas?: string;
  cor?: string;
  diametro?: string;
};

type AnaliseDemonstrativa = {
  modo_demonstrativo?: boolean;
  mensagem?: string;
  indicadores_simulados?: Indicadores;
};

export default function Analise() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lesao, setLesao] = useState<DetalhesLesao | null>(null);
  const [analise, setAnalise] = useState<AnaliseDemonstrativa | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const carregarDados = async () => {
      if (!id) {
        setErro('Identificador da lesão não informado.');
        setCarregando(false);
        return;
      }

      try {
        const token = await obterToken();
        if (!token) {
          setErro('Sua sessão expirou. Faça login novamente.');
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [respostaLesao, respostaAnalise] = await Promise.all([
          api.get(`/api/lesoes/${id}`, config),
          api.get(`/api/lesoes/${id}/analise-demo`, config),
        ]);

        setLesao(respostaLesao.data);
        setAnalise(respostaAnalise.data);
      } catch (error: any) {
        const mensagem =
          error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Não foi possível carregar os dados da análise demonstrativa.';
        setErro(mensagem);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [id]);

  const formatarData = (valor?: string) => {
    if (!valor) return 'Não informada';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;
    return data.toLocaleDateString('pt-BR');
  };

  const voltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/inicio' as never);
    }
  };

  const indicadores = [
    { titulo: 'Assimetria', valor: analise?.indicadores_simulados?.assimetria },
    { titulo: 'Bordas', valor: analise?.indicadores_simulados?.bordas },
    { titulo: 'Cor', valor: analise?.indicadores_simulados?.cor },
    { titulo: 'Diâmetro', valor: analise?.indicadores_simulados?.diametro },
  ];

  if (carregando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centralizado}>
          <ActivityIndicator size="large" color={AZUL} />
          <Text style={styles.textoCarregando}>Carregando análise demonstrativa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (erro || !lesao || !analise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cabecalho}>
          <Pressable style={styles.botaoVoltar} onPress={voltar}>
            <ArrowLeft size={22} color={AZUL} />
          </Pressable>
          <Text style={styles.tituloCabecalho}>Análise demonstrativa</Text>
          <View style={{ width: 42 }} />
        </View>
        <View style={styles.centralizado}>
          <AlertCircle size={42} color="#D45B5B" />
          <Text style={styles.tituloErro}>Não foi possível carregar</Text>
          <Text style={styles.descricaoErro}>{erro || 'Não encontramos os dados desta lesão.'}</Text>
          <Pressable style={styles.botaoPrincipal} onPress={voltar}>
            <Text style={styles.textoBotaoPrincipal}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const foto = lesao.fotos?.[0]?.url_foto;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cabecalho}>
          <Pressable style={styles.botaoVoltar} onPress={voltar}>
            <ArrowLeft size={22} color={AZUL} />
          </Pressable>
          <Text style={styles.tituloCabecalho}>Análise demonstrativa</Text>
          <View style={{ width: 42 }} />
        </View>

        <View style={styles.banner}>
          <ShieldCheck size={27} color={AZUL} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitulo}>Modo de demonstração</Text>
            <Text style={styles.bannerDescricao}>
              Esta tela apresenta indicadores simulados. Nenhuma análise real da imagem foi realizada.
            </Text>
          </View>
        </View>

        <Text style={styles.titulo}>Detalhes da lesão</Text>
        <Text style={styles.subtitulo}>
          Confira as informações registradas para esta lesão.
        </Text>

        <View style={styles.card}>
          {foto ? (
            <Image source={{ uri: foto }} style={styles.foto} resizeMode="cover" />
          ) : (
            <View style={styles.semFoto}>
              <Info size={28} color={AZUL} />
              <Text style={styles.semFotoTexto}>Nenhuma fotografia registrada</Text>
            </View>
          )}

          <Text style={styles.nomeLesao}>
            {lesao.nome_identificacao || 'Lesão sem identificação'}
          </Text>

          <View style={styles.linhaInfo}>
            <MapPin size={18} color={AZUL} />
            <Text style={styles.textoInfo}>
              {lesao.localizacao_corpo || 'Localização não informada'}
            </Text>
          </View>

          <View style={styles.linhaInfo}>
            <CalendarDays size={18} color={AZUL} />
            <Text style={styles.textoInfo}>
              Registro: {formatarData(lesao.data_registro)}
            </Text>
          </View>

          {!!lesao.observacoes && (
            <View style={styles.observacoes}>
              <Text style={styles.rotulo}>Observações registradas</Text>
              <Text style={styles.textoObservacoes}>{lesao.observacoes}</Text>
            </View>
          )}
        </View>

        <Text style={styles.tituloSecao}>Indicadores demonstrativos</Text>
        <Text style={styles.subtitulo}>
          Exemplo visual de apresentação de características relacionadas à regra ABCDE.
        </Text>

        <View style={styles.listaIndicadores}>
          {indicadores.map((item) => (
            <View key={item.titulo} style={styles.cardIndicador}>
              <View style={styles.iconeIndicador}>
                <CheckCircle2 size={21} color={AZUL} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nomeIndicador}>{item.titulo}</Text>
                <Text style={styles.valorIndicador}>{item.valor || 'Não informado'}</Text>
              </View>
              <View style={styles.etiquetaDemo}>
                <Text style={styles.textoEtiqueta}>Simulado</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.aviso}>
          <AlertCircle size={22} color="#A66A12" />
          <View style={{ flex: 1 }}>
            <Text style={styles.avisoTitulo}>Atenção</Text>
            <Text style={styles.avisoTexto}>
              Os indicadores exibidos são fictícios e não foram calculados a partir da fotografia. Esta funcionalidade não identifica melanoma, não fornece diagnóstico e não substitui a avaliação de um profissional de saúde.
            </Text>
          </View>
        </View>

        <Pressable style={styles.botaoPrincipal} onPress={voltar}>
          <Text style={styles.textoBotaoPrincipal}>Voltar ao registro</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUNDO },
  conteudo: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 35 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  botaoVoltar: { width: 42, height: 42, borderRadius: 13, backgroundColor: AZUL_CLARO, alignItems: 'center', justifyContent: 'center' },
  tituloCabecalho: { fontSize: 16, fontWeight: '700', color: AZUL },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: AZUL_CLARO, padding: 15, borderRadius: 14, marginBottom: 23 },
  bannerTitulo: { fontSize: 14, fontWeight: '800', color: TEXTO, marginBottom: 4 },
  bannerDescricao: { fontSize: 12, color: '#52677D', lineHeight: 18 },
  titulo: { fontSize: 23, fontWeight: '800', color: TEXTO },
  subtitulo: { fontSize: 13, color: '#64748B', lineHeight: 20, marginTop: 6, marginBottom: 14 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E0EAF5' },
  foto: { width: '100%', height: 190, borderRadius: 12, marginBottom: 15 },
  semFoto: { height: 110, borderRadius: 12, backgroundColor: AZUL_CLARO, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 15 },
  semFotoTexto: { fontSize: 12, color: AZUL, fontWeight: '600' },
  nomeLesao: { fontSize: 18, fontWeight: '800', color: TEXTO, marginBottom: 13 },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  textoInfo: { fontSize: 13, color: '#52677D', flex: 1 },
  observacoes: { borderTopWidth: 1, borderTopColor: '#E7EEF6', paddingTop: 12, marginTop: 3 },
  rotulo: { fontSize: 12, color: '#64748B', fontWeight: '700', marginBottom: 5 },
  textoObservacoes: { fontSize: 13, color: TEXTO, lineHeight: 19 },
  tituloSecao: { fontSize: 17, fontWeight: '800', color: TEXTO, marginTop: 24, marginBottom: 2 },
  listaIndicadores: { gap: 10 },
  cardIndicador: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 13, borderWidth: 1, borderColor: '#E0EAF5', gap: 11 },
  iconeIndicador: { width: 39, height: 39, borderRadius: 12, backgroundColor: AZUL_CLARO, alignItems: 'center', justifyContent: 'center' },
  nomeIndicador: { fontSize: 13, fontWeight: '700', color: TEXTO },
  valorIndicador: { fontSize: 13, color: AZUL, fontWeight: '700', marginTop: 3 },
  etiquetaDemo: { backgroundColor: '#F0F4F8', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8 },
  textoEtiqueta: { fontSize: 10, color: '#64748B', fontWeight: '700' },
  aviso: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFF5E5', borderRadius: 13, padding: 14, marginTop: 20 },
  avisoTitulo: { fontSize: 13, fontWeight: '800', color: '#80520E', marginBottom: 4 },
  avisoTexto: { fontSize: 12, lineHeight: 18, color: '#795C2E' },
  botaoPrincipal: { backgroundColor: AZUL, minHeight: 51, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  textoBotaoPrincipal: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  centralizado: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  textoCarregando: { color: '#64748B', fontSize: 13, marginTop: 13 },
  tituloErro: { fontSize: 19, fontWeight: '800', color: TEXTO, marginTop: 15 },
  descricaoErro: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginTop: 8 },
});
