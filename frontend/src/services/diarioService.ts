import { isAxiosError } from 'axios';

import { api } from './api';
import { obterToken } from './authService';

export type ExposicaoSolar = 'BAIXO' | 'MODERADO' | 'ALTO';

type NovoRegistroDiario = {
  mudancas_percebidas: string;
  sintomas: string;
  exposicao_solar: ExposicaoSolar;
  url_foto?: string;
};

export async function registrarDiario(dados: NovoRegistroDiario): Promise<void> {
  const token = await obterToken();

  try {
    await api.post('/api/diario', dados, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (erro) {
    if (isAxiosError(erro) && erro.response) {
      throw new Error(erro.response.data?.error || 'Não foi possível salvar o registro.');
    }

    throw new Error('Não foi possível conectar ao servidor. Verifique a rede e se o backend está ativo.');
  }
}
