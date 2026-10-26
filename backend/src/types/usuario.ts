export type TipoUsuario = 'CLIENTE' | 'PROFISSIONAL';

export interface IUsuarioCadastro {
  nome: string;
  email: string;
  senha: string;
  tipo_usuario: TipoUsuario;
  crm?: string;          // Obrigatório apenas se tipo_usuario === 'PROFISSIONAL'
  especialidade?: string;// Opcional para profissionais
  telefone?: string;
  consentimento_dados?: boolean;
}

export interface IUsuarioLogin {
  email: string;
  senha: string;
}

export interface ITokenPayload {
  id: number;
  tipo_usuario: TipoUsuario;
}