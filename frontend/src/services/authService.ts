<<<<<<< HEAD
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
=======
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const TOKEN_KEY = 'dermacheck_token';
const USER_KEY = 'dermacheck_usuario';

export type TipoUsuario = 'PACIENTE' | 'PROFISSIONAL';

export type Usuario = {
  id: number | string;
  nome: string;
  email: string;
  tipo_usuario: string;
};

type RespostaLogin = {
  mensagem?: string;
  token: string;
  usuario: Usuario;
>>>>>>> master
};

type DadosCadastro = {
  nome: string;
  email: string;
  senha: string;
  tipo_usuario: TipoUsuario;
  crm?: string;
<<<<<<< HEAD
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
=======
  uf_crm?: string;
  especialidade?: string;
  consentimento_dados: boolean;
};

function normalizarTipo(tipo: string): TipoUsuario | null {
  const valor = tipo.trim().toUpperCase();

  if (['PACIENTE', 'CLIENTE'].includes(valor)) {
    return 'PACIENTE';
  }

  if (['PROFISSIONAL', 'MEDICO', 'MÉDICO'].includes(valor)) {
    return 'PROFISSIONAL';
  }

  return null;
}

function obterUrlApi(): string {
  if (!API_URL) {
    throw new Error(
      'A URL da API não foi configurada no arquivo .env.',
    );
  }

  return API_URL.replace(/\/+$/, '');
}

export async function fazerLogin(
  email: string,
  senha: string,
): Promise<{ usuario: Usuario; tipo: TipoUsuario }> {
  const url = obterUrlApi();

  let resposta: Response;

  try {
    resposta = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        senha,
      }),
    });
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique a rede e se o backend está ativo.',
    );
  }

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(
      dados?.mensagem ||
        dados?.message ||
        'E-mail ou senha inválidos.',
    );
  }

  if (!dados?.token || !dados?.usuario) {
    throw new Error('A resposta do servidor está incompleta.');
  }

  const tipo = normalizarTipo(
    dados.usuario.tipo_usuario ?? dados.usuario.tipo ?? '',
  );

  if (!tipo) {
    throw new Error(
      'O tipo de usuário retornado pela API não é reconhecido.',
    );
  }

  const usuario: Usuario = {
    ...dados.usuario,
    tipo_usuario: tipo,
  };

  try {
    await SecureStore.setItemAsync(TOKEN_KEY, dados.token);
    await SecureStore.setItemAsync(
      USER_KEY,
      JSON.stringify(usuario),
    );
  } catch {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);

    throw new Error(
      'Não foi possível salvar a sessão com segurança.',
    );
  }

  return { usuario, tipo };
}

export async function cadastrarUsuario(
  dados: DadosCadastro,
): Promise<void> {
  const url = obterUrlApi();

  let resposta: Response;

  try {
    resposta = await fetch(`${url}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(dados),
    });
  } catch {
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique se o backend está ativo.',
    );
  }

  const resultado = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new Error(
      resultado?.mensagem ||
        resultado?.message ||
        (resposta.status === 409
          ? 'Este e-mail já está cadastrado.'
          : 'Não foi possível concluir o cadastro.'),
    );
>>>>>>> master
  }
}

export async function obterToken(): Promise<string | null> {
<<<<<<< HEAD
  return ler(TOKEN_KEY);
}

export async function obterUsuario(): Promise<Usuario | null> {
  const valor = await ler(USER_KEY);
  if (!valor) return null;
=======
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function obterUsuario(): Promise<Usuario | null> {
  const valor = await SecureStore.getItemAsync(USER_KEY);

  if (!valor) {
    return null;
  }
>>>>>>> master

  try {
    return JSON.parse(valor) as Usuario;
  } catch {
    await encerrarSessao();
    return null;
  }
}

export async function encerrarSessao(): Promise<void> {
<<<<<<< HEAD
  await remover(TOKEN_KEY);
  await remover(USER_KEY);
}
=======
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
>>>>>>> master
