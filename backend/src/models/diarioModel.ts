import { pool } from '../config/database';

export interface IDiarioPele {
  id?: number;
  usuario_id: number;
  data_registro?: Date;
  mudancas_percebidas?: string;
  sintomas?: string;
  exposicao_solar: 'BAIXO' | 'MODERADO' | 'ALTO';
  url_foto?: string;
  criado_em?: Date;
}

export class DiarioModel {
  // RN01 a RN05: Inserir um novo registro no diário
  static async criar(diario: IDiarioPele): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO diario_pele (usuario_id, mudancas_percebidas, sintomas, exposicao_solar, url_foto)
       VALUES (?, ?, ?, ?, ?)`,
      [
        diario.usuario_id,
        diario.mudancas_percebidas || null,
        diario.sintomas || null,
        diario.exposicao_solar,
        diario.url_foto || null
      ]
    );
    return result.insertId;
  }

  // RN07 & RN10: Listar registros pertencentes apenas ao usuário autenticado
  static async listarPorUsuario(usuarioId: number): Promise<IDiarioPele[]> {
    const [rows]: any = await pool.query(
      `SELECT id, data_registro, mudancas_percebidas, sintomas, exposicao_solar, url_foto, criado_em
       FROM diario_pele
       WHERE usuario_id = ?
       ORDER BY data_registro DESC`,
      [usuarioId]
    );
    return rows;
  }

  // RN07 & RN10: Buscar detalhes de um registro validando a propriedade
  static async buscarPorIdEUsuario(diarioId: number, usuarioId: number): Promise<IDiarioPele | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM diario_pele WHERE id = ? AND usuario_id = ?`,
      [diarioId, usuarioId]
    );
    return rows.length > 0 ? rows[0] : null;
  }
}