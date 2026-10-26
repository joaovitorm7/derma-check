
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');

  function recuperarSenha() {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Digite seu e-mail.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Atenção', 'Digite um e-mail válido.');
      return;
    }

    Alert.alert(
      'Solicitação registrada',
      'A recuperação de senha ainda não está conectada à API.',
    );
  }

  return (
    <View style={estilos.container}>
      <Pressable
        onPress={() => router.back()}
        style={estilos.voltar}
      >
        <Text style={estilos.textoVoltar}>← Voltar</Text>
      </Pressable>

      <View style={estilos.conteudo}>
        <Text style={estilos.titulo}>Esqueceu a senha?</Text>

        <Text style={estilos.descricao}>
          Digite seu e-mail para iniciar a recuperação da sua conta.
        </Text>

        <Text style={estilos.label}>E-mail</Text>

        <TextInput
          style={estilos.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#8A98A8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable
          style={estilos.botao}
          onPress={recuperarSenha}
        >
          <Text style={estilos.textoBotao}>
            Recuperar senha
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F8FF',
    padding: 24,
  },
  voltar: {
    alignSelf: 'flex-start',
    marginTop: 20,
    paddingVertical: 10,
  },
  textoVoltar: {
    color: '#2463A6',
    fontSize: 16,
    fontWeight: '600',
  },
  conteudo: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#2463A6',
    marginBottom: 12,
  },
  descricao: {
    fontSize: 15,
    color: '#62758A',
    lineHeight: 23,
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#294766',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5E2F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1E3A5F',
    backgroundColor: '#FFFFFF',
  },
  botao: {
    backgroundColor: '#2463A6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 22,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
