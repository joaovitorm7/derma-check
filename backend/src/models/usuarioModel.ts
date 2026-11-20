import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';

export interface IUsuarioPerfil {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: 'CLIENTE' | 'PROFISSIONAL';
  crm: string | null;
  especialidade: string | null;
  telefone: string | null;
  ativo: number | boolean;
  criado_em: Date | string;
}

export interface IAtualizarPerfilDTO {
  nome: string;
  email: string;
  telefone: string | null;
  crm: string | null;
  especialidade: string | null;
}

export class UsuarioModel {
  // Perfil (RN01, RN02, RN03, RN04, RN06) & Configurações (RN08): Busca dados sem expor a senha
  static async buscarPorId(usuarioId: number): Promise<IUsuarioPerfil | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, nome, email, tipo_usuario, crm, especialidade, telefone, ativo, criado_em
       FROM usuarios
       WHERE id = ?`,
      [usuarioId]
    );

    return rows.length > 0 ? (rows[0] as IUsuarioPerfil) : null;
  }

  // Configurações (RN03, RN09): Busca hash da senha atual para validação na troca de senha
  static async buscarCredenciaisPorId(
    usuarioId: number
  ): Promise<{ id: number; senha: string; ativo: number | boolean } | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, senha, ativo FROM usuarios WHERE id = ?`,
      [usuarioId]
    );

    return rows.length > 0
      ? (rows[0] as { id: number; senha: string; ativo: number | boolean })
      : null;
  }

  // Validação de unicidade de e-mail ao editar perfil
  static async emailEmUsoPorOutroUsuario(email: string, usuarioId: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM usuarios WHERE email = ? AND id != ?`,
      [email, usuarioId]
    );

    return rows.length > 0;
  }

  // Perfil (RN05, CA05, CA10) & Configurações (RN02, RN09): Atualiza dados cadastrais
  static async atualizarPerfil(usuarioId: number, dados: IAtualizarPerfilDTO): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE usuarios
       SET nome = ?, email = ?, telefone = ?, crm = ?, especialidade = ?
       WHERE id = ?`,
      [
        dados.nome,
        dados.email,
        dados.telefone,
        dados.crm,
        dados.especialidade,
        usuarioId
      ]
    );

    return result.affectedRows > 0;
  }

  // Configurações (RN03, RN09, CA02): Atualiza o hash da senha do usuário
  static async atualizarSenha(usuarioId: number, novaSenhaHash: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE usuarios SET senha = ? WHERE id = ?`,
      [novaSenhaHash, usuarioId]
    );

    return result.affectedRows > 0;
  }
}