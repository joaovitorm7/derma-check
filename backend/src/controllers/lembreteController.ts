import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { LembreteModel } from '../models/lembreteModel';
import { PASTA_UPLOADS } from '../middlewares/uploadMiddleware';

export class LembreteController {
  // RN02, RN03, RN04, RN05, RN06, RN08: Criar lembrete com validações e foto opcional
  static async criarLembrete(req: Request, res: Response): Promise<Response> {
    const arquivo = req.file;

    try {
      const usuarioId = (req as any).usuarioId;
      const { titulo, tipo, data_lembrete, observacoes } = req.body;

      if (!titulo || !titulo.trim()) {
        if (arquivo) fs.unlink(arquivo.path, () => {});
        return res.status(400).json({ error: 'O título do lembrete é obrigatório.' });
      }

      if (!data_lembrete) {
        if (arquivo) fs.unlink(arquivo.path, () => {});
        return res.status(400).json({ error: 'A data do lembrete é obrigatória.' });
      }

      // RN06: Categorização do lembrete (FOTO, DIARIO, CONSULTA ou OUTRO)
      const tiposValidos = ['FOTO', 'DIARIO', 'CONSULTA', 'OUTRO'];
      const tipoFinal = tipo && tiposValidos.includes(tipo.toUpperCase()) ? tipo.toUpperCase() : 'OUTRO';

      const url_foto = arquivo ? `/uploads/${arquivo.filename}` : (req.body.url_foto || null);

      const lembreteId = await LembreteModel.criar({
        usuario_id: usuarioId,
        titulo: titulo.trim(),
        tipo: tipoFinal,
        data_lembrete,
        observacoes: observacoes ? observacoes.trim() : '',
        url_foto
      });

      return res.status(201).json({
        message: 'Lembrete criado com sucesso.',
        lembreteId,
        url_foto,
        aviso_notificacoes: 'O sistema está em modo demonstrativo. As notificações push não serão enviadas nesta versão.' // RN08
      });
    } catch (error) {
      if (arquivo) fs.unlink(arquivo.path, () => {});
      console.error('Erro ao criar lembrete:', error);
      return res.status(500).json({ error: 'Erro interno ao salvar lembrete.' });
    }
  }

  // RN01, RN07, RN08, RN10: Listar lembretes organizados
  static async listarLembretes(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const lembretes = await LembreteModel.listarPorUsuario(usuarioId);

      return res.status(200).json({
        lembretes,
        modo_demonstrativo: true, // RN08
        aviso_notificacoes: 'O sistema está em modo demonstrativo. As notificações push não serão enviadas nesta versão.' // RN08
      });
    } catch (error) {
      console.error('Erro ao listar lembretes:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar lembretes.' });
    }
  }

  // Alternar marcação de concluído
  static async alternarStatus(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const lembreteId = Number(req.params.id);
      const { concluido } = req.body;

      const atualizado = await LembreteModel.alternarConcluido(lembreteId, usuarioId, Boolean(concluido));

      if (!atualizado) {
        return res.status(404).json({ error: 'Lembrete não encontrado ou acesso negado.' });
      }

      return res.status(200).json({ message: 'Status do lembrete atualizado com sucesso.' });
    } catch (error) {
      console.error('Erro ao atualizar lembrete:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar lembrete.' });
    }
  }

  // Excluir um lembrete (e remover fotografia vinculada, se houver)
  static async deletarLembrete(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const lembreteId = Number(req.params.id);

      const lembrete = await LembreteModel.buscarPorIdEUsuario(lembreteId, usuarioId);
      if (!lembrete) {
        return res.status(404).json({ error: 'Lembrete não encontrado ou acesso negado.' });
      }

      const deletado = await LembreteModel.deletar(lembreteId, usuarioId);
      if (!deletado) {
        return res.status(404).json({ error: 'Lembrete não encontrado ou acesso negado.' });
      }

      if (lembrete.url_foto) {
        const caminhoArquivo = path.join(PASTA_UPLOADS, path.basename(lembrete.url_foto));
        fs.unlink(caminhoArquivo, () => {});
      }

      return res.status(200).json({ message: 'Lembrete excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar lembrete:', error);
      return res.status(500).json({ error: 'Erro interno ao excluir lembrete.' });
    }
  }
}