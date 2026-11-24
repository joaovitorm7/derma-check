import { api, chamar } from './api';

export type Perfil = {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: 'CLIENTE' | 'PROFISSIONAL';
  perfil_descricao: string;
  telefone: string | null;
  crm: string | null;
  especialidade: string | null;
};

export type DadosPerfil = Pick<Perfil, 'nome' | 'email' | 'telefone' | 'crm' | 'especialidade'>;

export function obterPerfil() {
  return chamar<{ usuario: Perfil }>((headers) => api.get('/api/usuarios/perfil', { headers }));
}

export function editarPerfil(dados: DadosPerfil) {
  return chamar<{ usuario: Perfil }>((headers) => api.put('/api/usuarios/perfil', dados, { headers }));
}

export function alterarSenha(senha_atual: string, nova_senha: string) {
  return chamar((headers) => api.patch('/api/usuarios/senha', { senha_atual, nova_senha }, { headers }));
}
