import { pool } from '../config/database';

export interface ILesao {
  id?: number;
  usuario_id: number;
  nome_identificacao: string;
  localizacao_corpo: string;
  data_registro?: Date;
  observacoes?: string;
  criado_em?: Date;
}

export interface IFotoLesao {
  id?: number;
  lesao_id: number;
  url_foto: string;
  data_foto?: Date;
  observacao_foto?: string;
}

export class LesaoModel {
  // RN01 & RN03: Inserir nova lesão
  static async criarLesao(lesao: ILesao): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO lesoes (usuario_id, nome_identificacao, localizacao_corpo, observacoes)
       VALUES (?, ?, ?, ?)`,
      [lesao.usuario_id, lesao.nome_identificacao, lesao.localizacao_corpo, lesao.observacoes || null]
    );
    return result.insertId;
  }

  // RN10: Listar apenas lesões pertencentes ao usuário autenticado
  static async listarPorUsuario(usuarioId: number): Promise<ILesao[]> {
    const [rows]: any = await pool.query(
      `SELECT id, nome_identificacao, localizacao_corpo, data_registro, observacoes 
       FROM lesoes 
       WHERE usuario_id = ? 
       ORDER BY data_registro DESC`,
      [usuarioId]
    );
    return rows;
  }

  // RN06 & RN10: Buscar detalhes de uma lesão validando a propriedade
  static async buscarPorIdEUsuario(lesaoId: number, usuarioId: number): Promise<ILesao | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM lesoes WHERE id = ? AND usuario_id = ?`,
      [lesaoId, usuarioId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Atualizar dados de uma lesão pertencente ao usuário
  static async atualizarLesao(
    lesaoId: number,
    usuarioId: number,
    dados: { nome_identificacao: string; localizacao_corpo: string; observacoes?: string }
  ): Promise<boolean> {
    const [result]: any = await pool.query(
      `UPDATE lesoes
       SET nome_identificacao = ?, localizacao_corpo = ?, observacoes = ?
       WHERE id = ? AND usuario_id = ?`,
      [
        dados.nome_identificacao,
        dados.localizacao_corpo,
        dados.observacoes || null,
        lesaoId,
        usuarioId
      ]
    );
    return result.affectedRows > 0;
  }

  // Excluir uma lesão pertencente ao usuário (as fotos no banco são removidas via ON DELETE CASCADE)
  static async deletarLesao(lesaoId: number, usuarioId: number): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM lesoes WHERE id = ? AND usuario_id = ?`,
      [lesaoId, usuarioId]
    );
    return result.affectedRows > 0;
  }

  // RN02: Adicionar foto vinculada à lesão
  static async adicionarFoto(foto: IFotoLesao): Promise<number> {
    const [result]: any = await pool.query(
      `INSERT INTO fotos_lesao (lesao_id, url_foto, observacao_foto)
       VALUES (?, ?, ?)`,
      [foto.lesao_id, foto.url_foto, foto.observacao_foto || null]
    );
    return result.insertId;
  }

  // RN07: Buscar histórico de fotos para comparação
  static async buscarFotosPorLesao(lesaoId: number): Promise<IFotoLesao[]> {
    const [rows]: any = await pool.query(
      `SELECT * FROM fotos_lesao WHERE lesao_id = ? ORDER BY data_foto ASC`,
      [lesaoId]
    );
    return rows;
  }
}