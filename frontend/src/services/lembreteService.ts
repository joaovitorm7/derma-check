import { api, chamar } from './api';

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
