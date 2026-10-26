
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { cadastrarUsuario } from '../services/authService';

type Perfil = 'PACIENTE' | 'PROFISSIONAL';

type CampoProps = {
  titulo: string;
  valor: string;
  placeholder: string;
  onChangeText: (texto: string) => void;
  senha?: boolean;
  teclado?: 'default' | 'email-address';
  maiusculas?: 'none' | 'words' | 'sentences' | 'characters';
};

function Campo({
  titulo,
  valor,
  placeholder,
  onChangeText,
  senha = false,
  teclado = 'default',
  maiusculas = 'none',
}: CampoProps) {
  return (
    <View style={estilos.grupoCampo}>
      <Text style={estilos.rotulo}>{titulo}</Text>
      <TextInput
        style={estilos.campo}
        value={valor}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8A9AAF"
        secureTextEntry={senha}
        keyboardType={teclado === 'email-address' ? 'email-address' : 'default'}
        autoCapitalize={maiusculas}
        autoCorrect={false}
        underlineColorAndroid="transparent"
        blurOnSubmit={false}
        returnKeyType="next"
      />
    </View>
  );
}

export default function Cadastro() {
  const [perfil, setPerfil] = useState<Perfil>('PACIENTE');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [registro, setRegistro] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function realizarCadastro() {
    if (carregando) return;

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (nomeLimpo.length < 3) {
      Alert.alert('Nome inválido', 'Informe seu nome completo.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      Alert.alert('E-mail inválido', 'Informe um endereço de e-mail válido.');
      return;
    }

    if (perfil === 'PROFISSIONAL' && !registro.trim()) {
      Alert.alert(
        'Registro obrigatório',
        'Informe seu registro profissional conforme solicitado pelo projeto.'
      );
      return;
    }

    if (senha.length < 8 || !/[A-Za-zÀ-ÿ]/.test(senha) || !/[0-9]/.test(senha)) {
      Alert.alert(
        'Senha inválida',
        'Use pelo menos 8 caracteres, incluindo letras e números.'
      );
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Senhas diferentes', 'A confirmação deve ser igual à senha.');
      return;
    }

    if (!consentimento) {
      Alert.alert(
        'Consentimento necessário',
        'Leia e aceite o termo de consentimento e privacidade para continuar.'
      );
      return;
    }

    try {
      setCarregando(true);

      await cadastrarUsuario({
        nome: nomeLimpo,
        email: emailLimpo,
        senha,
        tipo_usuario: perfil,
        consentimento_dados: consentimento,
        ...(perfil === 'PROFISSIONAL'
        ? {
        crm: registro.trim(),
        }
        : {}),
    });

      Alert.alert(
        'Cadastro realizado',
        'Sua conta foi criada. Agora você pode entrar no DermaCheck.',
        [
          {
            text: 'Ir para login',
            onPress: () => router.replace('/login'),
          },
        ],
        { cancelable: false }
      );
    } catch (erro: any) {
      const mensagem =
        erro?.response?.data?.mensagem ||
        erro?.response?.data?.message ||
        erro?.message ||
        'Não foi possível realizar o cadastro. Tente novamente.';

      Alert.alert('Não foi possível cadastrar', mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.cabecalho}>
          <View style={estilos.logo}>
            <Text style={estilos.logoTexto}>D</Text>
          </View>

          <Text style={estilos.titulo}>Criar conta</Text>
          <Text style={estilos.subtitulo}>
            Cadastre-se para acompanhar e cuidar melhor da saúde da sua pele.
          </Text>
        </View>

        <Text style={estilos.rotulo}>Qual é o seu perfil?</Text>

        <View style={estilos.perfis}>
          <TouchableOpacity
            style={[
              estilos.opcaoPerfil,
              perfil === 'PACIENTE' && estilos.perfilSelecionado,
            ]}
            onPress={() => setPerfil('PACIENTE')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                estilos.textoPerfil,
                perfil === 'PACIENTE' && estilos.textoPerfilSelecionado,
              ]}
            >
              Paciente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              estilos.opcaoPerfil,
              perfil === 'PROFISSIONAL' && estilos.perfilSelecionado,
            ]}
            onPress={() => setPerfil('PROFISSIONAL')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                estilos.textoPerfil,
                perfil === 'PROFISSIONAL' && estilos.textoPerfilSelecionado,
              ]}
            >
              Profissional
            </Text>
          </TouchableOpacity>
        </View>

        <Campo
          titulo="Nome completo"
          valor={nome}
          onChangeText={setNome}
          placeholder="Digite seu nome completo"
          maiusculas="words"
        />

        <Campo
          titulo="E-mail"
          valor={email}
          onChangeText={setEmail}
          placeholder="seuemail@exemplo.com"
          teclado="email-address"
        />

        {perfil === 'PROFISSIONAL' && (
          <Campo
            titulo="Registro profissional"
            valor={registro}
            onChangeText={setRegistro}
            placeholder="Ex.: conselho, número e UF"
          />
        )}

        <Campo
          titulo="Senha"
          valor={senha}
          onChangeText={setSenha}
          placeholder="Mínimo de 8 caracteres, com letras e números"
          senha
        />

        <Campo
          titulo="Confirmar senha"
          valor={confirmarSenha}
          onChangeText={setConfirmarSenha}
          placeholder="Digite a senha novamente"
          senha
        />

        <View style={estilos.consentimento}>
          <Switch
            value={consentimento}
            onValueChange={setConsentimento}
            trackColor={{ false: '#CFD8E5', true: '#75B8F5' }}
            thumbColor={consentimento ? '#2463A6' : '#FFFFFF'}
          />
          <Text style={estilos.textoConsentimento}>
            Li e aceito os termos de consentimento e privacidade, incluindo o
            tratamento dos meus dados pessoais.
          </Text>
        </View>

        <TouchableOpacity
          style={[estilos.botao, carregando && estilos.botaoDesativado]}
          onPress={realizarCadastro}
          disabled={carregando}
          activeOpacity={0.8}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={estilos.textoBotao}>Criar minha conta</Text>
          )}
        </TouchableOpacity>

        <View style={estilos.rodape}>
          <Text style={estilos.textoRodape}>Já possui uma conta? </Text>
          <TouchableOpacity
            onPress={() => router.replace('/login')}
            disabled={carregando}
          >
            <Text style={estilos.link}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#F2F8FF',
  },
  scroll: {
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 36,
  },
  cabecalho: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#2463A6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoTexto: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  titulo: {
    fontSize: 28,
    fontWeight: '700',
    color: '#173B65',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    lineHeight: 22,
    color: '#61758D',
    textAlign: 'center',
  },
  rotulo: {
    color: '#24415F',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 9,
  },
  perfis: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  opcaoPerfil: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#C8D8E9',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  perfilSelecionado: {
    borderColor: '#2463A6',
    backgroundColor: '#E2F0FF',
  },
  textoPerfil: {
    fontSize: 15,
    color: '#61758D',
    fontWeight: '600',
  },
  textoPerfilSelecionado: {
    color: '#2463A6',
  },
  grupoCampo: {
    marginBottom: 17,
  },
  campo: {
    width: '100%',
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#C8D8E9',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    color: '#173B65',
    fontSize: 15,
  },
  consentimento: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 24,
  },
  textoConsentimento: {
    flex: 1,
    color: '#52677E',
    fontSize: 13,
    lineHeight: 20,
  },
  botao: {
    minHeight: 54,
    borderRadius: 13,
    backgroundColor: '#2463A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDesativado: {
    opacity: 0.65,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  textoRodape: {
    color: '#61758D',
    fontSize: 14,
  },
  link: {
    color: '#2463A6',
    fontWeight: '700',
    fontSize: 14,
  },
});
