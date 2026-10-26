
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
};

function normalizarTipo(tipo: string): TipoUsuario | null {
  const valor = tipo.trim().toUpperCase();

  if (['PACIENTE', 'CLIENTE'].includes(valor)) return 'PACIENTE';
  if (['PROFISSIONAL', 'MEDICO', 'MÉDICO'].includes(valor)) {
    return 'PROFISSIONAL';
  }

  return null;
}

export async function fazerLogin(
  email: string,
  senha: string,
): Promise<{ usuario: Usuario; tipo: TipoUsuario }> {
  if (!API_URL) {
    throw new Error('A URL da API não foi configurada no arquivo .env.');
  }

  let resposta: Response;

  try {
    resposta = await fetch(
      `${API_URL.replace(/\/$/, '')}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), senha }),
      },
    );
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

  const tipo = normalizarTipo(dados.usuario.tipo_usuario ?? dados.usuario.tipo);

  if (!tipo) {
    throw new Error(
      'O tipo de usuário retornado pela API não é reconhecido.',
    );
  }

  const sessao: RespostaLogin = {
    token: dados.token,
    usuario: {
      ...dados.usuario,
      tipo_usuario: tipo,
    },
    mensagem: dados.mensagem,
  };

  try {
    await SecureStore.setItemAsync(TOKEN_KEY, sessao.token);
    await SecureStore.setItemAsync(
      USER_KEY,
      JSON.stringify(sessao.usuario),
    );
  } catch {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    throw new Error('Não foi possível salvar a sessão com segurança.');
  }

  return { usuario: sessao.usuario, tipo };
}

export async function obterToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function obterUsuario(): Promise<Usuario | null> {
  const valor = await SecureStore.getItemAsync(USER_KEY);
  if (!valor) return null;

  try {
    return JSON.parse(valor) as Usuario;
  } catch {
    await encerrarSessao();
    return null;
  }
}

export async function encerrarSessao(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
