import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { cores } from '../constants/tema';
import { cadastrarUsuario, type TipoUsuario } from '../services/authService';

export default function Cadastro() {
  const [tipo, setTipo] = useState<TipoUsuario>('CLIENTE');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [crm, setCrm] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (nomeLimpo.length < 3) {
      Alert.alert('Nome inválido', 'Informe seu nome completo.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      Alert.alert('E-mail inválido', 'Informe um endereço válido.');
      return;
    }
    if (tipo === 'PROFISSIONAL' && !crm.trim()) {
      Alert.alert('Registro obrigatório', 'Informe seu CRM.');
      return;
    }
    if (senha.length < 8 || !/[A-Za-zÀ-ÿ]/.test(senha) || !/\d/.test(senha)) {
      Alert.alert('Senha inválida', 'Use 8 caracteres, com letras e números.');
      return;
    }
    if (senha !== confirmacao) {
      Alert.alert('Senhas diferentes', 'A confirmação deve ser igual à senha.');
      return;
    }
    if (!consentimento) {
      Alert.alert('Consentimento necessário', 'Aceite os termos para continuar.');
      return;
    }

    try {
      setCarregando(true);
      await cadastrarUsuario({
        nome: nomeLimpo,
        email: emailLimpo,
        senha,
        tipo_usuario: tipo,
        crm: tipo === 'PROFISSIONAL' ? crm.trim() : undefined,
        consentimento_dados: true,
      });
      Alert.alert('Cadastro realizado', 'Agora você pode entrar na sua conta.', [
        { text: 'Ir para login', onPress: () => router.replace('/login' as never) },
      ]);
    } catch (erro) {
      Alert.alert(
        'Não foi possível cadastrar',
        erro instanceof Error ? erro.message : 'Tente novamente.',
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.subtitulo}>Preencha seus dados para começar.</Text>
        <Text style={styles.rotulo}>Perfil</Text>
        <View style={styles.perfis}>
          {(['CLIENTE', 'PROFISSIONAL'] as TipoUsuario[]).map((opcao) => (
            <Pressable
              key={opcao}
              onPress={() => setTipo(opcao)}
              style={[styles.perfil, tipo === opcao && styles.perfilAtivo]}
            >
              <Text style={[styles.textoPerfil, tipo === opcao && styles.textoPerfilAtivo]}>
                {opcao === 'CLIENTE' ? 'Paciente' : 'Profissional'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Campo label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" />
        <Campo label="E-mail" value={email} onChangeText={setEmail} placeholder="seuemail@exemplo.com" keyboardType="email-address" />
        {tipo === 'PROFISSIONAL' && (
          <Campo label="CRM" value={crm} onChangeText={setCrm} placeholder="Registro profissional" />
        )}
        <Campo label="Senha" value={senha} onChangeText={setSenha} placeholder="Mínimo de 8 caracteres" secureTextEntry />
        <Campo label="Confirmar senha" value={confirmacao} onChangeText={setConfirmacao} placeholder="Repita sua senha" secureTextEntry />
        <View style={styles.consentimento}>
          <Switch value={consentimento} onValueChange={setConsentimento} />
          <Text style={styles.textoConsentimento}>Aceito o tratamento dos meus dados para uso do aplicativo.</Text>
        </View>
        <Pressable onPress={enviar} disabled={carregando} style={[styles.botao, carregando && styles.desabilitado]}>
          {carregando ? <ActivityIndicator color={cores.branco} /> : <Text style={styles.textoBotao}>Criar minha conta</Text>}
        </Pressable>
        <Pressable onPress={() => router.replace('/login' as never)} style={styles.voltar}>
          <Text style={styles.link}>Já tenho uma conta</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type CampoProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
  secureTextEntry?: boolean;
};

function Campo(props: CampoProps) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{props.label}</Text>
      <TextInput {...props} style={styles.input} autoCapitalize="none" autoCorrect={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, padding: 25, justifyContent: 'center' },
  titulo: { fontSize: 28, fontWeight: '800', color: cores.azulEscuro },
  subtitulo: { marginTop: 6, marginBottom: 22, color: cores.textoSecundario },
  rotulo: { marginBottom: 8, fontWeight: '600', color: cores.textoPrincipal },
  perfis: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  perfil: { flex: 1, padding: 13, borderRadius: 12, borderWidth: 1, borderColor: cores.borda, alignItems: 'center', backgroundColor: cores.branco },
  perfilAtivo: { backgroundColor: cores.azulClaro, borderColor: cores.azulEscuro },
  textoPerfil: { color: cores.textoSecundario },
  textoPerfilAtivo: { color: cores.azulEscuro, fontWeight: '700' },
  grupo: { marginBottom: 14 },
  input: { minHeight: 50, borderWidth: 1, borderColor: cores.borda, borderRadius: 13, paddingHorizontal: 14, backgroundColor: cores.branco, color: cores.textoPrincipal },
  consentimento: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 },
  textoConsentimento: { flex: 1, color: cores.textoSecundario, fontSize: 13 },
  botao: { minHeight: 52, borderRadius: 15, backgroundColor: cores.azulEscuro, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  desabilitado: { opacity: 0.7 },
  textoBotao: { color: cores.branco, fontWeight: '700' },
  voltar: { alignItems: 'center', padding: 18 },
  link: { color: cores.azulEscuro, fontWeight: '700' },
});
