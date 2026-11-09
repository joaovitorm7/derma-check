import { isAxiosError } from 'axios';

import { api } from './api';
import { obterToken } from './authService';

export type TipoLembrete = 'FOTO' | 'DIARIO' | 'CONSULTA' | 'OUTRO';

export type Lembrete = {
  id: number;
  titulo: string;
  tipo: TipoLembrete;
  data_lembrete: string;
  observacoes: string | null;
  concluido: boolean | number;
};

type NovoLembrete = {
  titulo: string;
  tipo: TipoLembrete;
  data_lembrete: string;
  observacoes?: string;
};

async function chamar<T>(requisicao: (headers: { Authorization: string }) => Promise<{ data: T }>): Promise<T> {
  const token = await obterToken();

  try {
    const { data } = await requisicao({ Authorization: `Bearer ${token}` });
    return data;
  } catch (erro) {
    if (isAxiosError(erro) && erro.response) {
      throw new Error(erro.response.data?.error || 'Não foi possível concluir a operação.');
    }

    throw new Error('Não foi possível conectar ao servidor. Verifique a rede e se o backend está ativo.');
  }
}

export function listarLembretes() {
  return chamar<{ lembretes: Lembrete[]; aviso_notificacoes: string }>((headers) =>
    api.get('/api/lembretes', { headers }),
  );
}

export function criarLembrete(dados: NovoLembrete) {
  return chamar<{ lembreteId: number; aviso_notificacoes: string }>((headers) =>
    api.post('/api/lembretes', dados, { headers }),
  );
}

export function alterarConclusao(id: number, concluido: boolean) {
  return chamar((headers) => api.patch(`/api/lembretes/${id}/concluir`, { concluido }, { headers }));
}

export function excluirLembrete(id: number) {
  return chamar((headers) => api.delete(`/api/lembretes/${id}`, { headers }));
}
