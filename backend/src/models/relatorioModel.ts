import { pool } from '../config/database';

export interface ILesaoRelatorio {
  id: number;
  nome_identificacao: string;
  localizacao_corpo: string;
  observacoes: string | null;
  data_registro: Date | string;
  quantidade_fotos: number;
  fotografias: string[];
}

export interface IDadosRelatorio {
  usuario: {
    nome: string;
    email: string;
  };
  resumo: {
    total_lesoes: number;
    total_fotos: number;
    total_registros_diario: number;
  };
  lesoes: ILesaoRelatorio[];
}

export class RelatorioModel {
  static async obterDadosCompletos(usuarioId: number): Promise<IDadosRelatorio | null> {
    // 1. Dados do usuário
    const [usuarios]: any = await pool.query(
      `SELECT nome, email FROM usuarios WHERE id = ?`,
      [usuarioId]
    );

    if (usuarios.length === 0) return null;

    // 2. Contagens gerais (resumo)
    const [lesoesCount]: any = await pool.query(
      `SELECT COUNT(*) as total FROM lesoes WHERE usuario_id = ?`,
      [usuarioId]
    );

    const [diarioCount]: any = await pool.query(
      `SELECT COUNT(*) as total FROM diario_pele WHERE usuario_id = ?`,
      [usuarioId]
    );

    const [fotosCount]: any = await pool.query(
      `SELECT COUNT(f.id) as total 
       FROM fotos_lesao f 
       INNER JOIN lesoes l ON f.lesao_id = l.id 
       WHERE l.usuario_id = ?`,
      [usuarioId]
    );

    // 3. Detalhamento das lesões e fotografias
    const [lesoesRows]: any = await pool.query(
      `SELECT id, nome_identificacao, localizacao_corpo, observacoes, data_registro
       FROM lesoes 
       WHERE usuario_id = ?
       ORDER BY data_registro DESC`,
      [usuarioId]
    );

    const lesoesComFotos: ILesaoRelatorio[] = [];

    for (const lesao of lesoesRows) {
      const [fotosRows]: any = await pool.query(
        `SELECT url_foto FROM fotos_lesao WHERE lesao_id = ? ORDER BY enviado_em DESC`,
        [lesao.id]
      );

      const fotos = fotosRows.map((f: any) => f.url_foto);

      lesoesComFotos.push({
        id: lesao.id,
        nome_identificacao: lesao.nome_identificacao,
        localizacao_corpo: lesao.localizacao_corpo,
        observacoes: lesao.observacoes || null,
        data_registro: lesao.data_registro,
        quantidade_fotos: fotos.length,
        fotografias: fotos
      });
    }

    return {
      usuario: {
        nome: usuarios[0].nome,
        email: usuarios[0].email
      },
      resumo: {
        total_lesoes: lesoesCount[0]?.total || 0,
        total_fotos: fotosCount[0]?.total || 0,
        total_registros_diario: diarioCount[0]?.total || 0
      },
      lesoes: lesoesComFotos
    };
  }
}