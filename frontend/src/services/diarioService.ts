import { isAxiosError } from 'axios';

import type { ImagePickerAsset } from 'expo-image-picker';

import { anexarFoto, api, CABECALHO_UPLOAD } from './api';
import { obterToken } from './authService';

export type ExposicaoSolar = 'BAIXO' | 'MODERADO' | 'ALTO';

type NovoRegistroDiario = {
  mudancas_percebidas: string;
  sintomas: string;
  exposicao_solar: ExposicaoSolar;
  foto?: ImagePickerAsset;
};

export async function registrarDiario({ foto, ...campos }: NovoRegistroDiario): Promise<void> {
  const token = await obterToken();

  try {
    const dados = new FormData();
    Object.entries(campos).forEach(([chave, valor]) => dados.append(chave, valor));
    if (foto) anexarFoto(dados, foto);

    await api.post('/api/diario', dados, {
      headers: { Authorization: `Bearer ${token}`, ...CABECALHO_UPLOAD },
      timeout: 60000,
    });
  } catch (erro) {
    if (isAxiosError(erro) && erro.response) {
      throw new Error(erro.response.data?.error || 'Não foi possível salvar o registro.');
    }

    throw new Error('Não foi possível conectar ao servidor. Verifique a rede e se o backend está ativo.');
  }
}
