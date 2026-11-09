
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
    ArrowLeft,
    CalendarDays,
    Camera,
    ClipboardCheck,
    ImagePlus,
    MapPin,
    ShieldCheck,
    X,
} from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import api from '../services/api';
import { obterToken } from '../services/authService';

const AZUL = '#2463A6';
const AZUL_CLARO = '#EAF3FC';
const FUNDO = '#F5F9FE';
const TEXTO = '#18324F';

export default function NovaLesao() {
  const [nome, setNome] = useState('');
  const [local, setLocal] = useState('');
  const [data, setData] = useState(new Date().toLocaleDateString('pt-BR'));
  const [observacoes, setObservacoes] = useState('');
  const [foto, setFoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [lesaoSalva, setLesaoSalva] = useState(false);
  const [lesaoId, setLesaoId] = useState<number | null>(null);
  const [erros, setErros] = useState({ nome: '', local: '', data: '' });

  const validarData = (valor: string) => {
    const resultado = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!resultado) return false;
    const dia = Number(resultado[1]);
    const mes = Number(resultado[2]);
    const ano = Number(resultado[3]);
    const dataInformada = new Date(ano, mes - 1, dia);
    return (
      dataInformada.getFullYear() === ano &&
      dataInformada.getMonth() === mes - 1 &&
      dataInformada.getDate() === dia &&
      ano >= 1900 &&
      dataInformada <= new Date()
    );
  };

  const selecionarFoto = async (origem: 'camera' | 'galeria') => {
    try {
      let resultado: ImagePicker.ImagePickerResult;
      if (origem === 'camera') {
        const permissao = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissao.granted) {
          Alert.alert('Permissão necessária', 'Autorize o acesso à câmera nas configurações do dispositivo para tirar uma fotografia.');
          return;
        }
        resultado = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissao.granted) {
          Alert.alert('Permissão necessária', 'Autorize o acesso à galeria para selecionar uma fotografia.');
          return;
        }
        resultado = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });
      }
      if (!resultado.canceled && resultado.assets.length > 0) {
        setFoto(resultado.assets[0]);
        setLesaoSalva(false);
        setLesaoId(null);
      }
    } catch {
      Alert.alert('Erro ao selecionar fotografia', 'Não foi possível abrir a câmera ou a galeria. Tente novamente.');
    }
  };

  const validarFormulario = () => {
    const novosErros = { nome: '', local: '', data: '' };
    if (!nome.trim()) novosErros.nome = 'Informe a identificação da lesão.';
    if (!local.trim()) novosErros.local = 'Informe a localização no corpo.';
    if (!data.trim()) {
      novosErros.data = 'Informe a data do registro.';
    } else if (!validarData(data)) {
      novosErros.data = 'Informe uma data válida no formato DD/MM/AAAA, que não seja futura.';
    }
    setErros(novosErros);
    return !Object.values(novosErros).some(Boolean);
  };

  const salvarLesao = async () => {
    if (lesaoSalva) {
      Alert.alert('Registro já realizado', 'Esta lesão já foi salva. Utilize o botão de análise demonstrativa.');
      return;
    }
    if (!validarFormulario()) {
      Alert.alert('Verifique os campos', 'Existem informações obrigatórias que precisam ser corrigidas. Confira os campos destacados.');
      return;
    }

    setSalvando(true);
    try {
      const token = await obterToken();
      if (!token) {
        Alert.alert('Sessão expirada', 'Faça login novamente para registrar uma lesão.');
        return;
      }

      const respostaLesao = await api.post(
        '/api/lesoes',
        {
          nome_identificacao: nome.trim(),
          localizacao_corpo: local.trim(),
          observacoes: observacoes.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const id = Number(respostaLesao.data?.lesaoId);
      if (!id || Number.isNaN(id)) {
        throw new Error('O servidor não retornou um identificador válido para a lesão.');
      }

      setLesaoId(id);

      if (foto) {
        try {
          await api.post(
            `/api/lesoes/${id}/fotos`,
            {
              url_foto: foto.uri,
              observacao_foto: observacoes.trim(),
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch {
          setLesaoSalva(true);
          Alert.alert(
            'Registro parcial',
            'Os dados da lesão foram salvos, mas não foi possível registrar a referência da fotografia. Você ainda pode visualizar a análise demonstrativa.'
          );
          return;
        }
      }

      setLesaoSalva(true);
      Alert.alert(
        'Registro concluído!',
        foto
          ? 'Os dados da lesão e a referência da fotografia foram registrados.'
          : 'Os dados da lesão foram registrados com sucesso.'
      );
    } catch (error: any) {
      const mensagem =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Não foi possível salvar a lesão.';
      Alert.alert('Erro ao registrar', mensagem);
    } finally {
      setSalvando(false);
    }
  };

  const visualizarAnalise = () => {
    if (!lesaoId) {
      Alert.alert('Atenção', 'Salve a lesão antes de visualizar a análise demonstrativa.');
      return;
    }
    router.push({
      pathname: '/analise',
      params: { id: String(lesaoId) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.conteudo}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.cabecalho}>
            <Pressable
              style={styles.botaoVoltar}
              onPress={() => router.canGoBack() ? router.back() : router.replace('/inicio' as never)}
              disabled={salvando}
            >
              <ArrowLeft size={23} color={AZUL} />
            </Pressable>
            <Text style={styles.tituloCabecalho}>Nova lesão</Text>
            <View style={{ width: 42 }} />
          </View>

          <Text style={styles.titulo}>Registrar nova lesão</Text>
          <Text style={styles.subtitulo}>
            Adicione informações e uma fotografia para acompanhar as características da pinta ou mancha ao longo do tempo.
          </Text>

          {lesaoSalva && (
            <View style={styles.sucesso}>
              <ShieldCheck size={21} color="#16804A" />
              <Text style={styles.sucessoTexto}>Registro salvo com sucesso!</Text>
            </View>
          )}

          <Text style={styles.tituloSecao}>Fotografia</Text>
          <View style={styles.areaFoto}>
            {foto ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: foto.uri }} style={styles.previewFoto} resizeMode="cover" />
                <Pressable
                  style={styles.removerFoto}
                  onPress={() => {
                    setFoto(null);
                    setLesaoSalva(false);
                    setLesaoId(null);
                  }}
                  disabled={salvando}
                >
                  <X size={19} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.fotoSelecionada}>Fotografia selecionada</Text>
              </View>
            ) : (
              <>
                <View style={styles.iconeFoto}>
                  <ImagePlus size={35} color={AZUL} />
                </View>
                <Text style={styles.fotoTitulo}>Adicione uma fotografia</Text>
                <Text style={styles.fotoDescricao}>
                  Escolha uma imagem da sua lesão ou tire uma nova foto.
                </Text>
              </>
            )}
            <View style={styles.botoesFoto}>
              <Pressable style={styles.botaoFoto} onPress={() => selecionarFoto('camera')} disabled={salvando}>
                <Camera size={19} color={AZUL} />
                <Text style={styles.botaoFotoTexto}>Tirar foto</Text>
              </Pressable>
              <Pressable style={styles.botaoFoto} onPress={() => selecionarFoto('galeria')} disabled={salvando}>
                <ImagePlus size={19} color={AZUL} />
                <Text style={styles.botaoFotoTexto}>Escolher da galeria</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.tituloSecao}>Identificação</Text>
          <View style={styles.campoContainer}>
            <Text style={styles.rotulo}>Nome ou identificação *</Text>
            <TextInput
              style={[styles.input, erros.nome ? styles.inputErro : null]}
              placeholder="Ex.: Lesão 01"
              placeholderTextColor="#8A9BAD"
              value={nome}
              onChangeText={(valor) => {
                setNome(valor);
                setErros((atual) => ({ ...atual, nome: '' }));
                setLesaoSalva(false);
                setLesaoId(null);
              }}
              editable={!salvando && !lesaoSalva}
            />
            {!!erros.nome && <Text style={styles.textoErro}>{erros.nome}</Text>}
          </View>

          <View style={styles.campoContainer}>
            <Text style={styles.rotulo}>Localização no corpo *</Text>
            <View style={[styles.inputComIcone, erros.local ? styles.inputErro : null]}>
              <MapPin size={19} color="#7890A8" />
              <TextInput
                style={styles.inputInterno}
                placeholder="Ex.: braço esquerdo"
                placeholderTextColor="#8A9BAD"
                value={local}
                onChangeText={(valor) => {
                  setLocal(valor);
                  setErros((atual) => ({ ...atual, local: '' }));
                  setLesaoSalva(false);
                  setLesaoId(null);
                }}
                editable={!salvando && !lesaoSalva}
              />
            </View>
            {!!erros.local && <Text style={styles.textoErro}>{erros.local}</Text>}
          </View>

          <View style={styles.campoContainer}>
            <Text style={styles.rotulo}>Data do registro *</Text>
            <View style={[styles.inputComIcone, erros.data ? styles.inputErro : null]}>
              <CalendarDays size={19} color="#7890A8" />
              <TextInput
                style={styles.inputInterno}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#8A9BAD"
                value={data}
                onChangeText={(valor) => {
                  setData(valor);
                  setErros((atual) => ({ ...atual, data: '' }));
                  setLesaoSalva(false);
                  setLesaoId(null);
                }}
                keyboardType="numbers-and-punctuation"
                editable={!salvando && !lesaoSalva}
              />
            </View>
            {!!erros.data && <Text style={styles.textoErro}>{erros.data}</Text>}
          </View>

          <Text style={styles.tituloSecao}>Observações</Text>
          <View style={styles.campoContainer}>
            <Text style={styles.rotulo}>Descrição da lesão (opcional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Descreva características percebidas, como cor, formato, tamanho ou mudanças..."
              placeholderTextColor="#8A9BAD"
              value={observacoes}
              onChangeText={(valor) => {
                setObservacoes(valor);
                setLesaoSalva(false);
                setLesaoId(null);
              }}
              multiline
              textAlignVertical="top"
              editable={!salvando && !lesaoSalva}
            />
          </View>

          <View style={styles.aviso}>
            <ShieldCheck size={22} color={AZUL} />
            <View style={{ flex: 1 }}>
              <Text style={styles.avisoTitulo}>Importante</Text>
              <Text style={styles.avisoDescricao}>
                O registro auxilia no acompanhamento da pele, mas não representa um diagnóstico médico.
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.botaoPrincipal,
              pressed && !salvando && styles.pressionado,
              (salvando || lesaoSalva) && styles.botaoDesabilitado,
            ]}
            onPress={salvarLesao}
            disabled={salvando || lesaoSalva}
          >
            {salvando ? (
              <>
                <ActivityIndicator color="#FFFFFF" />
                <Text style={styles.botaoPrincipalTexto}>Salvando...</Text>
              </>
            ) : (
              <>
                <Text style={styles.botaoPrincipalTexto}>
                  {lesaoSalva ? 'Lesão salva' : 'Salvar lesão'}
                </Text>
                <ShieldCheck size={21} color="#FFFFFF" />
              </>
            )}
          </Pressable>

          {lesaoSalva && (
            <Pressable
              style={({ pressed }) => [styles.botaoSecundario, pressed && styles.pressionadoSecundario]}
              onPress={visualizarAnalise}
            >
              <ClipboardCheck size={20} color={AZUL} />
              <Text style={styles.botaoSecundarioTexto}>Visualizar análise demonstrativa</Text>
            </Pressable>
          )}

          <Text style={styles.rodape}>
            * Campos obrigatórios. A análise apresentada é demonstrativa e não substitui uma avaliação profissional.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FUNDO },
  conteudo: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 35 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  botaoVoltar: { width: 42, height: 42, borderRadius: 13, backgroundColor: AZUL_CLARO, alignItems: 'center', justifyContent: 'center' },
  tituloCabecalho: { fontSize: 17, fontWeight: '700', color: AZUL },
  titulo: { fontSize: 24, fontWeight: '800', color: TEXTO },
  subtitulo: { fontSize: 13, color: '#64748B', lineHeight: 20, marginTop: 7, marginBottom: 18 },
  tituloSecao: { fontSize: 16, fontWeight: '700', color: TEXTO, marginTop: 12, marginBottom: 12 },
  sucesso: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#E7F6ED', padding: 13, borderRadius: 12, marginBottom: 12 },
  sucessoTexto: { color: '#16804A', fontSize: 13, fontWeight: '700' },
  areaFoto: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#BBD9F7', borderStyle: 'dashed', borderRadius: 17, padding: 20, alignItems: 'center' },
  iconeFoto: { width: 62, height: 62, borderRadius: 20, backgroundColor: AZUL_CLARO, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  fotoTitulo: { fontSize: 15, fontWeight: '700', color: TEXTO },
  fotoDescricao: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, marginTop: 5 },
  previewContainer: { width: '100%', alignItems: 'center' },
  previewFoto: { width: '100%', height: 220, borderRadius: 13 },
  removerFoto: { position: 'absolute', top: 8, right: 8, backgroundColor: '#18324F', borderRadius: 20, padding: 7 },
  fotoSelecionada: { color: AZUL, fontWeight: '700', fontSize: 12, marginTop: 10 },
  botoesFoto: { flexDirection: 'row', gap: 10, marginTop: 17, flexWrap: 'wrap', justifyContent: 'center' },
  botaoFoto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: AZUL_CLARO, paddingHorizontal: 13, minHeight: 43, borderRadius: 11 },
  botaoFotoTexto: { fontSize: 12, fontWeight: '700', color: AZUL },
  campoContainer: { marginBottom: 15 },
  rotulo: { fontSize: 13, fontWeight: '600', color: '#385674', marginBottom: 8 },
  input: { minHeight: 50, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE8F5', borderRadius: 12, paddingHorizontal: 14, fontSize: 14, color: TEXTO },
  inputComIcone: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE8F5', borderRadius: 12, paddingHorizontal: 13, minHeight: 50, gap: 10 },
  inputInterno: { flex: 1, minHeight: 48, fontSize: 14, color: TEXTO },
  inputMultiline: { height: 115, paddingTop: 13, lineHeight: 20 },
  inputErro: { borderColor: '#DC5555', borderWidth: 1.5 },
  textoErro: { fontSize: 11, color: '#C83C3C', marginTop: 5, marginLeft: 3 },
  aviso: { flexDirection: 'row', backgroundColor: AZUL_CLARO, padding: 14, borderRadius: 13, gap: 11, alignItems: 'flex-start', marginTop: 5 },
  avisoTitulo: { fontSize: 13, fontWeight: '700', color: TEXTO },
  avisoDescricao: { fontSize: 12, lineHeight: 18, color: '#52677D', marginTop: 3 },
  botaoPrincipal: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: AZUL, minHeight: 53, borderRadius: 14, marginTop: 20, paddingHorizontal: 18, gap: 8 },
  botaoPrincipalTexto: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  botaoDesabilitado: { opacity: 0.7 },
  botaoSecundario: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: AZUL_CLARO, minHeight: 50, borderRadius: 14, marginTop: 11, paddingHorizontal: 15, gap: 7 },
  botaoSecundarioTexto: { color: AZUL, fontSize: 13, fontWeight: '700' },
  rodape: { fontSize: 11, color: '#8494A5', textAlign: 'center', lineHeight: 17, marginTop: 13 },
  pressionado: { opacity: 0.8 },
  pressionadoSecundario: { opacity: 0.75 },
});
