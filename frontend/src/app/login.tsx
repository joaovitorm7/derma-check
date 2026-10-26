
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores } from '../constants/tema';
import {
    fazerLogin,
    type TipoUsuario,
} from '../services/authService';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    if (!email.trim() || !senha) {
      Alert.alert('Atenção', 'Preencha seu e-mail e sua senha.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Atenção', 'Digite um e-mail válido.');
      return;
    }

    try {
      setCarregando(true);

      const resultado = await fazerLogin(email.trim(), senha);

      redirecionarPorPerfil(resultado.tipo);
    } catch (erro) {
      Alert.alert(
        'Não foi possível entrar',
        erro instanceof Error
          ? erro.message
          : 'Verifique seus dados e tente novamente.',
      );
    } finally {
      setCarregando(false);
    }
  };

  const redirecionarPorPerfil = (tipo: TipoUsuario) => {
    // Enquanto as telas específicas não existirem,
    // direciona para a tela disponível no projeto.
    if (tipo === 'PACIENTE') {
      router.replace('/explore');
    } else {
      router.replace('/explore');
    }
  };

  return (
    <SafeAreaView style={estilos.areaSegura} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={estilos.teclado}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.conteudo}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.logo}>
            <Ionicons
              name="medkit"
              size={28}
              color={cores.azulEscuro}
            />
          </View>

          <Text style={estilos.titulo}>Bem-vindo de volta!</Text>

          <Text style={estilos.subtitulo}>
            Entre na sua conta DermaCheck.
          </Text>

          <View style={estilos.campoContainer}>
            <Text style={estilos.rotulo}>E-mail</Text>

            <TextInput
              accessibilityLabel="E-mail"
              style={estilos.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={cores.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!carregando}
              returnKeyType="next"
            />
          </View>

          <View style={estilos.campoContainer}>
            <Text style={estilos.rotulo}>Senha</Text>

            <View style={estilos.campoSenha}>
              <TextInput
                accessibilityLabel="Senha"
                style={estilos.inputSenha}
                placeholder="Digite sua senha"
                placeholderTextColor={cores.placeholder}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!carregando}
                returnKeyType="done"
                onSubmitEditing={entrar}
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'
                }
                onPress={() => setMostrarSenha((valor) => !valor)}
                style={estilos.botaoOlho}
                hitSlop={8}
              >
                <Ionicons
                  name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={cores.textoSuave}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/esqueci-senha')}
            disabled={carregando}
            style={estilos.linkEsquecido}
          >
            <Text style={estilos.linkDireita}>
              Esqueci minha senha
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={entrar}
            disabled={carregando}
            style={({ pressed }) => [
              estilos.botaoEntrar,
              pressed && !carregando && estilos.botaoPressionado,
              carregando && estilos.botaoDesativado,
            ]}
          >
            {carregando ? (
              <ActivityIndicator color={cores.branco} />
            ) : (
              <Text style={estilos.botaoTexto}>Entrar</Text>
            )}
          </Pressable>

          <Text style={estilos.aviso}>
            Acesse sua conta para acompanhar seus registros de pele.
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={carregando}
            onPress={() => router.push('/cadastro')}
          >
            <Text style={estilos.linkCentral}>
              Ainda não tem conta?{' '}
              <Text style={estilos.destaqueLink}>Cadastre-se</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  areaSegura: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  teclado: {
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 25,
  },
  logo: {
    width: 57,
    height: 57,
    borderRadius: 18,
    backgroundColor: cores.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 25,
    fontWeight: '800',
    color: cores.azulEscuro,
  },
  subtitulo: {
    color: cores.textoSecundario,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 18,
  },
  campoContainer: {
    marginBottom: 15,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#385674',
    marginBottom: 8,
  },
  input: {
    minHeight: 50,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 13,
    paddingHorizontal: 14,
    fontSize: 15,
    color: cores.textoPrincipal,
  },
  campoSenha: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 13,
  },
  inputSenha: {
    flex: 1,
    minHeight: 50,
    paddingLeft: 14,
    paddingRight: 4,
    fontSize: 15,
    color: cores.textoPrincipal,
  },
  botaoOlho: {
    width: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkEsquecido: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    marginBottom: 12,
  },
  linkDireita: {
    color: cores.azulEscuro,
    fontSize: 13,
  },
  botaoEntrar: {
    width: '100%',
    minHeight: 52,
    backgroundColor: cores.azulEscuro,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 13,
    marginTop: 12,
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  botaoDesativado: {
    opacity: 0.7,
  },
  botaoTexto: {
    color: cores.branco,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  aviso: {
    color: cores.textoSuave,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 13,
    lineHeight: 18,
  },
  linkCentral: {
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 19,
    fontSize: 14,
  },
  destaqueLink: {
    color: cores.azulEscuro,
    fontWeight: '700',
  },
});
