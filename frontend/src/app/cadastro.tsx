import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import { cadastrarUsuario, type TipoUsuario } from '../services/authService';

type CampoFormulario =
  | 'nome'
  | 'email'
  | 'crm'
  | 'senha'
  | 'confirmacao'
  | 'consentimento';

type ErrosFormulario = Partial<Record<CampoFormulario, string>>;

export default function Cadastro() {
  const [tipo, setTipo] = useState<TipoUsuario>('PACIENTE');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [crm, setCrm] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [cadastroRealizado, setCadastroRealizado] = useState(false);
  const [erros, setErros] = useState<ErrosFormulario>({});

  function atualizarCampo(
    campo: CampoFormulario,
    atualizar: (valor: string) => void,
    valor: string,
  ) {
    atualizar(valor);
    setErros((atuais) => {
      if (!atuais[campo]) return atuais;

      const novos = { ...atuais };
      delete novos[campo];
      return novos;
    });
  }

  async function enviar() {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const novosErros: ErrosFormulario = {};

    if (nomeLimpo.length < 3) {
      novosErros.nome = 'Informe seu nome completo.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      novosErros.email = 'Digite um endereço de e-mail válido.';
    }
    if (tipo === 'PROFISSIONAL' && !crm.trim()) {
      novosErros.crm = 'Informe seu registro profissional.';
    }
    if (senha.length < 8 || !/[A-Za-zÀ-ÿ]/.test(senha) || !/\d/.test(senha)) {
      novosErros.senha = 'Use pelo menos 8 caracteres, com letras e números.';
    }
    if (senha !== confirmacao) {
      novosErros.confirmacao = 'A confirmação precisa ser igual à senha.';
    }
    if (!consentimento) {
      novosErros.consentimento = 'É necessário aceitar para criar a conta.';
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

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
      setCadastroRealizado(true);
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
    <>
      <SafeAreaView style={styles.tela} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.teclado}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.conteudo}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cabecalho}>
              <View style={styles.iconeCabecalho}>
                <Ionicons name="person-add-outline" size={27} color={cores.azulEscuro} />
              </View>
              <Text style={styles.titulo}>Criar sua conta</Text>
              <Text style={styles.subtitulo}>
                Preencha seus dados para começar a acompanhar sua saúde da pele.
              </Text>
            </View>

            <View style={styles.secao}>
              <Text style={styles.rotulo}>Como você vai usar o DermaCheck?</Text>
              <View style={styles.perfis}>
                {(['PACIENTE', 'PROFISSIONAL'] as TipoUsuario[]).map((opcao) => {
                  const selecionado = tipo === opcao;
                  const paciente = opcao === 'PACIENTE';

                  return (
                    <Pressable
                      key={opcao}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selecionado }}
                      onPress={() => setTipo(opcao)}
                      style={({ pressed }) => [
                        styles.perfil,
                        selecionado && styles.perfilAtivo,
                        pressed && styles.pressionado,
                      ]}
                    >
                      <Ionicons
                        name={paciente ? 'person-outline' : 'medical-outline'}
                        size={22}
                        color={selecionado ? cores.azulEscuro : cores.textoSecundario}
                      />
                      <Text style={[styles.textoPerfil, selecionado && styles.textoPerfilAtivo]}>
                        {paciente ? 'Paciente' : 'Profissional'}
                      </Text>
                      <Text style={styles.descricaoPerfil}>
                        {paciente ? 'Acompanhar minha pele' : 'Atuar como especialista'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.secao}>
              <Campo
                label="Nome completo"
                value={nome}
                onChangeText={(valor) => atualizarCampo('nome', setNome, valor)}
                placeholder="Ex.: Maria da Silva"
                autoCapitalize="words"
                error={erros.nome}
                editable={!carregando}
              />
              <Campo
                label="E-mail"
                value={email}
                onChangeText={(valor) => atualizarCampo('email', setEmail, valor)}
                placeholder="voce@exemplo.com"
                keyboardType="email-address"
                error={erros.email}
                editable={!carregando}
              />
              {tipo === 'PROFISSIONAL' && (
                <Campo
                  label="CRM"
                  value={crm}
                  onChangeText={(valor) => atualizarCampo('crm', setCrm, valor)}
                  placeholder="Número do registro"
                  error={erros.crm}
                  editable={!carregando}
                />
              )}
              <Campo
                label="Senha"
                value={senha}
                onChangeText={(valor) => atualizarCampo('senha', setSenha, valor)}
                placeholder="Crie uma senha segura"
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                error={erros.senha}
                editable={!carregando}
                acaoSenha={() => setMostrarSenha((visivel) => !visivel)}
                rotuloAcaoSenha={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              />
              <Campo
                label="Confirmar senha"
                value={confirmacao}
                onChangeText={(valor) => atualizarCampo('confirmacao', setConfirmacao, valor)}
                placeholder="Digite a senha novamente"
                secureTextEntry={!mostrarConfirmacao}
                autoCapitalize="none"
                error={erros.confirmacao}
                editable={!carregando}
                acaoSenha={() => setMostrarConfirmacao((visivel) => !visivel)}
                rotuloAcaoSenha={mostrarConfirmacao ? 'Ocultar senha' : 'Mostrar senha'}
              />
              <Text style={styles.dicaSenha}>
                A senha deve conter pelo menos 8 caracteres, incluindo letras e números.
              </Text>
            </View>

            <View style={styles.consentimento}>
              <Switch
                value={consentimento}
                onValueChange={(valor) => {
                  setConsentimento(valor);
                  if (valor) {
                    setErros((atuais) => {
                      const novos = { ...atuais };
                      delete novos.consentimento;
                      return novos;
                    });
                  }
                }}
                disabled={carregando}
                accessibilityLabel="Aceito o tratamento dos meus dados para uso do aplicativo"
                accessibilityState={{ checked: consentimento, disabled: carregando }}
                trackColor={{ false: cores.borda, true: cores.azul }}
                thumbColor={cores.branco}
              />
              <Text style={styles.textoConsentimento}>
                Aceito o tratamento dos meus dados para uso do aplicativo.
              </Text>
            </View>
            {erros.consentimento && (
              <Text style={styles.erro} accessibilityRole="alert">
                {erros.consentimento}
              </Text>
            )}

            <Pressable
              onPress={enviar}
              disabled={carregando}
              accessibilityRole="button"
              accessibilityState={{ disabled: carregando, busy: carregando }}
              style={({ pressed }) => [
                styles.botao,
                carregando && styles.desabilitado,
                pressed && !carregando && styles.pressionado,
              ]}
            >
              {carregando ? (
                <ActivityIndicator color={cores.branco} />
              ) : (
                <>
                  <Text style={styles.textoBotao}>Criar minha conta</Text>
                  <Ionicons name="arrow-forward" size={20} color={cores.branco} />
                </>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.replace(ROTAS.login)}
              disabled={carregando}
              accessibilityRole="button"
              style={styles.voltar}
            >
              <Text style={styles.link}>
                Já tem uma conta? <Text style={styles.linkDestaque}>Entrar</Text>
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        visible={cadastroRealizado}
        transparent
        animationType="fade"
        onRequestClose={() => router.replace(ROTAS.login)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalConteudo} accessibilityRole="alert">
            <View style={styles.iconeSucesso}>
              <Ionicons name="checkmark" size={30} color={cores.branco} />
            </View>
            <Text style={styles.modalTitulo}>Cadastro realizado!</Text>
            <Text style={styles.modalMensagem}>
              Sua conta foi criada. Agora você já pode entrar com seu e-mail e senha.
            </Text>
            <Pressable
              onPress={() => router.replace(ROTAS.login)}
              style={styles.botao}
              accessibilityRole="button"
            >
              <Text style={styles.textoBotao}>Ir para login</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

type CampoProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words';
  error?: string;
  editable?: boolean;
  acaoSenha?: () => void;
  rotuloAcaoSenha?: string;
};

function Campo({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  error,
  editable = true,
  acaoSenha,
  rotuloAcaoSenha,
}: CampoProps) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.rotulo}>{label}</Text>
      <View style={[styles.caixaInput, error && styles.caixaInputErro]}>
        <TextInput
          accessibilityLabel={label}
          accessibilityState={{ disabled: !editable }}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={cores.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          editable={editable}
          returnKeyType="next"
        />
        {acaoSenha && rotuloAcaoSenha && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rotuloAcaoSenha}
            onPress={acaoSenha}
            disabled={!editable}
            hitSlop={8}
            style={styles.botaoVisibilidade}
          >
            <Ionicons
              name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
              size={21}
              color={cores.textoSuave}
            />
          </Pressable>
        )}
      </View>
      {error && (
        <Text style={styles.erro} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  teclado: { flex: 1 },
  conteudo: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32 },
  cabecalho: { alignItems: 'center', marginBottom: 28 },
  iconeCabecalho: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: cores.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  titulo: { fontSize: 28, fontWeight: '800', color: cores.azulEscuro, textAlign: 'center' },
  subtitulo: {
    color: cores.textoSecundario,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 340,
  },
  secao: { marginBottom: 18 },
  rotulo: { marginBottom: 8, fontWeight: '600', color: cores.textoPrincipal, fontSize: 14 },
  perfis: { flexDirection: 'row', gap: 12, marginTop: 4 },
  perfil: {
    flex: 1,
    minHeight: 112,
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: cores.branco,
  },
  perfilAtivo: { backgroundColor: cores.azulSuave, borderColor: cores.azulEscuro, borderWidth: 2 },
  textoPerfil: { color: cores.textoSecundario, fontWeight: '700', fontSize: 14 },
  textoPerfilAtivo: { color: cores.azulEscuro },
  descricaoPerfil: { color: cores.textoSuave, fontSize: 11, textAlign: 'center' },
  grupo: { marginBottom: 14 },
  caixaInput: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 13,
    backgroundColor: cores.branco,
  },
  caixaInputErro: { borderColor: '#C2413B' },
  input: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 14,
    color: cores.textoPrincipal,
    fontSize: 15,
  },
  botaoVisibilidade: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  dicaSenha: { color: cores.textoSuave, fontSize: 12, lineHeight: 17, marginTop: -4 },
  erro: { color: '#A9322B', fontSize: 12, lineHeight: 17, marginTop: 5 },
  consentimento: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  textoConsentimento: { flex: 1, color: cores.textoSecundario, fontSize: 13, lineHeight: 19 },
  botao: {
    minHeight: 54,
    flexDirection: 'row',
    gap: 9,
    borderRadius: 15,
    backgroundColor: cores.azulEscuro,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  desabilitado: { opacity: 0.7 },
  pressionado: { opacity: 0.82 },
  textoBotao: { color: cores.branco, fontWeight: '700', fontSize: 15 },
  voltar: { alignItems: 'center', paddingVertical: 20, minHeight: 52, justifyContent: 'center' },
  link: { color: cores.textoSecundario, fontSize: 14 },
  linkDestaque: { color: cores.azulEscuro, fontWeight: '700' },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalConteudo: { backgroundColor: cores.branco, borderRadius: 18, padding: 24, alignItems: 'center' },
  iconeSucesso: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2F855A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitulo: { color: cores.azulEscuro, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  modalMensagem: { color: cores.textoSecundario, lineHeight: 22, marginTop: 10, textAlign: 'center' },
});
