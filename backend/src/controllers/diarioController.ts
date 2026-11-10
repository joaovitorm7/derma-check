import fs from 'fs';
import { Request, Response } from 'express';
import { DiarioModel } from '../models/diarioModel';

export class DiarioController {
  // RN01 - RN06 (CA01 - CA07): Criar registro diário
  static async registrarDiario(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const { mudancas_percebidas, sintomas, exposicao_solar } = req.body;

      // RN04 / CA07: Validação do ENUM de exposição solar
      const niveisValidos = ['BAIXO', 'MODERADO', 'ALTO'];
      const nivelExposicao = exposicao_solar ? String(exposicao_solar).toUpperCase() : 'BAIXO';

      if (!niveisValidos.includes(nivelExposicao)) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({
          error: 'Nível de exposição solar inválido. Escolha entre: BAIXO, MODERADO ou ALTO.'
        });
      }

      const diarioId = await DiarioModel.criar({
        usuario_id: usuarioId,
        mudancas_percebidas: mudancas_percebidas ? mudancas_percebidas.trim() : '',
        sintomas: sintomas ? sintomas.trim() : '',
        exposicao_solar: nivelExposicao as 'BAIXO' | 'MODERADO' | 'ALTO',
        ...(req.file && { url_foto: `/uploads/${req.file.filename}` })
      });

      return res.status(201).json({
        message: 'Registro no diário da pele salvo com sucesso.',
        diarioId
      });
    } catch (error) {
      if (req.file) fs.unlink(req.file.path, () => {});
      console.error('Erro ao registrar diário:', error);
      return res.status(500).json({ error: 'Erro interno ao salvar registro no diário.' });
    }
  }

  // RN07 & RN10 (CA08, CA10): Listar histórico do usuário logado
  static async listarDiario(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const registros = await DiarioModel.listarPorUsuario(usuarioId);
      return res.status(200).json(registros);
    } catch (error) {
      console.error('Erro ao listar diário:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar histórico do diário.' });
    }
  }

  // RN07 & RN10 (CA08, CA10): Obter um registro por ID com verificação de autorização
  static async obterDetalhesDiario(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const diarioId = Number(req.params.id);

      const registro = await DiarioModel.buscarPorIdEUsuario(diarioId, usuarioId);

      // RN10 / CA10: Proteção contra acesso por terceiros
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado ou acesso negado.' });
      }

      return res.status(200).json(registro);
    } catch (error) {
      console.error('Erro ao obter detalhes do diário:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar registro.' });
    }
  }
}