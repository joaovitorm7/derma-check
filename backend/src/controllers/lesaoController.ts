import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { LesaoModel } from '../models/lesaoModel';
import { PASTA_UPLOADS } from '../middlewares/uploadMiddleware';

export class LesaoController {
  // RN01, RN03 & RN04 (CA01, CA03, CA04) - Registrar Lesão
  static async registrarLesao(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const { nome_identificacao, localizacao_corpo, observacoes } = req.body;

      // RN03 / CA03: Validação de campos obrigatórios
      if (!nome_identificacao || !nome_identificacao.trim()) {
        return res.status(400).json({ error: 'O nome ou identificação da lesão é obrigatório.' });
      }
      if (!localizacao_corpo || !localizacao_corpo.trim()) {
        return res.status(400).json({ error: 'A localização no corpo é obrigatória.' });
      }

      const lesaoId = await LesaoModel.criarLesao({
        usuario_id: usuarioId,
        nome_identificacao: nome_identificacao.trim(),
        localizacao_corpo: localizacao_corpo.trim(),
        observacoes: observacoes ? observacoes.trim() : ''
      });

      return res.status(201).json({
        message: 'Lesão registrada com sucesso.',
        lesaoId
      });
    } catch (error) {
      console.error('Erro ao registrar lesão:', error);
      return res.status(500).json({ error: 'Erro interno ao registrar lesão.' });
    }
  }

  // RN06 & RN10 (CA06, CA10) - Listar Lesões do Usuário
  static async listarLesoes(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const lesoes = await LesaoModel.listarPorUsuario(usuarioId);
      return res.status(200).json(lesoes);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao buscar lesões.' });
    }
  }

  // RN06 & RN10 (CA06, CA10) - Detalhes da Lesão
  static async obterDetalhesLesao(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const lesaoId = Number(req.params.id);

      const lesao = await LesaoModel.buscarPorIdEUsuario(lesaoId, usuarioId);

      // RN10 / CA10: Proteção contra acesso não autorizado
      if (!lesao) {
        return res.status(404).json({ error: 'Lesão não encontrada ou acesso negado.' });
      }

      const fotos = await LesaoModel.buscarFotosPorLesao(lesaoId);

      return res.status(200).json({ ...lesao, fotos });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao obter detalhes da lesão.' });
    }
  }

  // Editar Lesão
  static async editarLesao(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const lesaoId = Number(req.params.id);
      const { nome_identificacao, localizacao_corpo, observacoes } = req.body;

      if (Number.isNaN(lesaoId)) {
        return res.status(400).json({ error: 'ID da lesão inválido.' });
      }

      if (!nome_identificacao || !nome_identificacao.trim()) {
        return res.status(400).json({ error: 'O nome ou identificação da lesão é obrigatório.' });
      }

      if (!localizacao_corpo || !localizacao_corpo.trim()) {
        return res.status(400).json({ error: 'A localização no corpo é obrigatória.' });
      }

      const atualizado = await LesaoModel.atualizarLesao(lesaoId, usuarioId, {
        nome_identificacao: nome_identificacao.trim(),
        localizacao_corpo: localizacao_corpo.trim(),
        observacoes: observacoes ? observacoes.trim() : ''
      });

      if (!atualizado) {
        return res.status(404).json({ error: 'Lesão não encontrada ou acesso negado.' });
      }

      const lesaoAtualizada = await LesaoModel.buscarPorIdEUsuario(lesaoId, usuarioId);

      return res.status(200).json({
        message: 'Lesão atualizada com sucesso.',
        lesao: lesaoAtualizada
      });
    } catch (error) {
      console.error('Erro ao editar lesão:', error);
      return res.status(500).json({ error: 'Erro interno ao editar lesão.' });
    }
  }

  // Excluir Lesão (e remover fotografias físicas vinculadas)
  static async excluirLesao(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const lesaoId = Number(req.params.id);

      if (Number.isNaN(lesaoId)) {
        return res.status(400).json({ error: 'ID da lesão inválido.' });
      }

      const lesao = await LesaoModel.buscarPorIdEUsuario(lesaoId, usuarioId);
      if (!lesao) {
        return res.status(404).json({ error: 'Lesão não encontrada ou acesso negado.' });
      }

      // Busca as fotos antes de excluir a lesão para limpar os arquivos do disco
      const fotos = await LesaoModel.buscarFotosPorLesao(lesaoId);

      const deletado = await LesaoModel.deletarLesao(lesaoId, usuarioId);
      if (!deletado) {
        return res.status(404).json({ error: 'Lesão não encontrada ou acesso negado.' });
      }

      for (const foto of fotos) {
        if (foto.url_foto) {
          const caminhoArquivo = path.join(PASTA_UPLOADS, path.basename(foto.url_foto));
          fs.unlink(caminhoArquivo, () => {});
        }
      }

      return res.status(200).json({ message: 'Lesão excluída com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir lesão:', error);
      return res.status(500).json({ error: 'Erro interno ao excluir lesão.' });
    }
  }

  // RN02 & RN07 (CA02, CA07) - Adicionar Foto
  static async adicionarFoto(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const lesaoId = Number(req.params.id);
      const { observacao_foto } = req.body;
      const arquivo = req.file;

      if (!arquivo) {
        return res.status(400).json({ error: 'A imagem da lesão é obrigatória.' });
      }

      const lesao = await LesaoModel.buscarPorIdEUsuario(lesaoId, usuarioId);
      if (!lesao) {
        fs.unlink(arquivo.path, () => {});
        return res.status(404).json({ error: 'Lesão não encontrada.' });
      }

      const url_foto = `/uploads/${arquivo.filename}`;
      const fotoId = await LesaoModel.adicionarFoto({
        lesao_id: lesaoId,
        url_foto,
        observacao_foto
      });

      return res.status(201).json({ message: 'Fotografia adicionada com sucesso.', fotoId, url_foto });
    } catch (error) {
      if (req.file) fs.unlink(req.file.path, () => {});
      console.error('Erro ao adicionar fotografia:', error);
      return res.status(500).json({ error: 'Erro interno ao adicionar fotografia.' });
    }
  }

  // RN05 (CA05) - Análise Demonstrativa Simulada
  static async obterAnaliseDemonstrativa(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({
      modo_demonstrativo: true,
      mensagem: 'Interface de demonstração visual da análise.',
      indicadores_simulados: {
        assimetria: 'Baixa',
        bordas: 'Regulares',
        cor: 'Homogênea',
        diametro: '4mm'
      }
    });
  }

  // RN08 (CA08) - Relatórios da Lesão
  static async obterRelatorios(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const lesaoId = Number(req.params.id);

      const lesao = await LesaoModel.buscarPorIdEUsuario(lesaoId, usuarioId);
      if (!lesao) {
        return res.status(404).json({ error: 'Lesão não encontrada.' });
      }

      const fotos = await LesaoModel.buscarFotosPorLesao(lesaoId);

      return res.status(200).json({
        lesao_id: lesao.id,
        identificacao: lesao.nome_identificacao,
        total_fotos_registradas: fotos.length,
        data_primeiro_registro: lesao.data_registro,
        historico_fotos: fotos
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao gerar relatório.' });
    }
  }
}