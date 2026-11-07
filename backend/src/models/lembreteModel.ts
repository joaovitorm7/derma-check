import { pool } from '../config/database';

export interface ILembrete {
  id?: number;
  usuario_id: number;
  titulo: string;
  tipo: 'FOTO' | 'DIARIO' | 'CONSULTA' | 'OUTRO';
  data_lembrete: Date | string;
  observacoes?: string;
  concluido?: boolean;
  criado_em?: Date;
}

export class LembreteModel {
  // RN05 & RN06: Criar novo lembrete categorizado
  static async criar(lembrete: ILembrete): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO lembretes (usuario_id, titulo, tipo, data_lembrete, observacoes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        lembrete.usuario_id,
        lembrete.titulo,
        lembrete.tipo,
        lembrete.data_lembrete,
        lembrete.observacoes || null
      ]
    );
    return result.insertId;
  }

  // RN01, RN07 & RN10: Listar lembretes pertencentes apenas ao usuário logado
  static async listarPorUsuario(usuarioId: number): Promise<ILembrete[]> {
    const [rows]: any = await pool.query(
      `SELECT id, titulo, tipo, data_lembrete, observacoes, concluido, criado_em
       FROM lembretes
       WHERE usuario_id = ?
       ORDER BY data_lembrete ASC`,
      [usuarioId]
    );
    return rows;
  }

  // RN10: Buscar lembrete especifico garantindo a autoria do usuário
  static async buscarPorIdEUsuario(lembreteId: number, usuarioId: number): Promise<ILembrete | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM lembretes WHERE id = ? AND usuario_id = ?`,
      [lembreteId, usuarioId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Alternar o status de conclusão do lembrete
  static async alternarConcluido(lembreteId: number, usuarioId: number, status: boolean): Promise<boolean> {
    const [result]: any = await pool.query(
      `UPDATE lembretes SET concluido = ? WHERE id = ? AND usuario_id = ?`,
      [status, lembreteId, usuarioId]
    );
    return result.affectedRows > 0;
  }

  // Excluir lembrete
  static async deletar(lembreteId: number, usuarioId: number): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM lembretes WHERE id = ? AND usuario_id = ?`,
      [lembreteId, usuarioId]
    );
    return result.affectedRows > 0;
  }
}