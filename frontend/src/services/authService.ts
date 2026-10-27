import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AxiosError } from 'axios';
import { Platform } from 'react-native';
import { api } from './api';

const TOKEN_KEY = 'dermacheck_token';
const USER_KEY = 'dermacheck_usuario';

export type TipoUsuario = 'CLIENTE' | 'PROFISSIONAL';

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: TipoUsuario;
};

type DadosCadastro = {
  nome: string;
  email: string;
  senha: string;
  tipo_usuario: TipoUsuario;
  crm?: string;
  consentimento_dados: boolean;
};

type RespostaAutenticacao = {
  token: string;
  usuario: Usuario;
};

async function salvar(chave: string, valor: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(chave, valor);
  } else {
    await SecureStore.setItemAsync(chave, valor);
  }
}

async function ler(chave: string): Promise<string | null> {
  return Platform.OS === 'web'
    ? AsyncStorage.getItem(chave)
    : SecureStore.getItemAsync(chave);
}

async function remover(chave: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(chave);
  } else {
    await SecureStore.deleteItemAsync(chave);
  }
}

function mensagemDoErro(erro: unknown, padrao: string): string {
  if (erro instanceof AxiosError) {
    const mensagem = erro.response?.data?.mensagem;
    if (typeof mensagem === 'string') return mensagem;
    if (!erro.response) {
      return 'Não foi possível conectar ao servidor. Verifique a rede e se o backend está ativo.';
    }
  }
  return erro instanceof Error ? erro.message : padrao;
}

export async function fazerLogin(email: string, senha: string) {
  try {
    const { data } = await api.post<RespostaAutenticacao>('/api/auth/login', {
      email: email.trim().toLowerCase(),
      senha,
    });

    if (!data.token || !data.usuario) {
      throw new Error('A resposta do servidor está incompleta.');
    }

    await salvar(TOKEN_KEY, data.token);
    await salvar(USER_KEY, JSON.stringify(data.usuario));
    return data.usuario;
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'E-mail ou senha inválidos.'));
  }
}

export async function cadastrarUsuario(dados: DadosCadastro): Promise<void> {
  try {
    await api.post('/api/auth/register', dados);
  } catch (erro) {
    throw new Error(mensagemDoErro(erro, 'Não foi possível concluir o cadastro.'));
  }
}

export async function obterToken(): Promise<string | null> {
  return ler(TOKEN_KEY);
}

export async function obterUsuario(): Promise<Usuario | null> {
  const valor = await ler(USER_KEY);
  if (!valor) return null;

  try {
    return JSON.parse(valor) as Usuario;
  } catch {
    await encerrarSessao();
    return null;
  }
}

export async function encerrarSessao(): Promise<void> {
  await remover(TOKEN_KEY);
  await remover(USER_KEY);
}
