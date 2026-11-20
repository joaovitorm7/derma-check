import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { UsuarioModel } from '../models/usuarioModel';

export class UsuarioController {
  // Perfil (RN01-RN04, RN06, RN10 | CA01-CA03, CA06) & Configurações (RN08 | CA07)
  static async obterPerfil(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const usuario = await UsuarioModel.buscarPorId(usuarioId);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      return res.status(200).json({
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario,
          perfil_descricao:
            usuario.tipo_usuario === 'PROFISSIONAL' ? 'Profissional de Saúde' : 'Paciente',
          telefone: usuario.telefone,
          crm: usuario.tipo_usuario === 'PROFISSIONAL' ? usuario.crm : null,
          especialidade: usuario.tipo_usuario === 'PROFISSIONAL' ? usuario.especialidade : null,
          criado_em: usuario.criado_em
        }
      });
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar dados do perfil.' });
    }
  }

  // Perfil (RN05, RN10 | CA04, CA05, CA09, CA10) & Configurações (RN02, RN09 | CA09, CA10)
  static async editarPerfil(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const usuarioAtual = await UsuarioModel.buscarPorId(usuarioId);

      if (!usuarioAtual) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const nome =
        typeof req.body.nome === 'string' ? req.body.nome.trim() : usuarioAtual.nome;
      const email =
        typeof req.body.email === 'string'
          ? req.body.email.trim().toLowerCase()
          : usuarioAtual.email;
      const telefone =
        req.body.telefone !== undefined
          ? typeof req.body.telefone === 'string' && req.body.telefone.trim()
            ? req.body.telefone.trim()
            : null
          : usuarioAtual.telefone;

      // Validação de Nome e E-mail (mesmo padrão do authController)
      if (!nome || nome.length < 3) {
        return res.status(400).json({ error: 'O nome deve ter pelo menos 3 caracteres.' });
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      }

      // Verifica se o novo e-mail já pertence a outro usuário
      if (email !== usuarioAtual.email) {
        const emailEmUso = await UsuarioModel.emailEmUsoPorOutroUsuario(email, usuarioId);
        if (emailEmUso) {
          return res.status(409).json({ error: 'Este e-mail já está em uso por outra conta.' });
        }
      }

      // Campos profissionais aplicáveis apenas quando tipo_usuario === 'PROFISSIONAL'
      let crm: string | null = null;
      let especialidade: string | null = null;

      if (usuarioAtual.tipo_usuario === 'PROFISSIONAL') {
        crm =
          req.body.crm !== undefined
            ? typeof req.body.crm === 'string'
              ? req.body.crm.trim()
              : ''
            : usuarioAtual.crm;

        if (!crm) {
          return res
            .status(400)
            .json({ error: 'O CRM é obrigatório para perfis de profissional de saúde.' });
        }

        especialidade =
          req.body.especialidade !== undefined
            ? typeof req.body.especialidade === 'string' && req.body.especialidade.trim()
              ? req.body.especialidade.trim()
              : null
            : usuarioAtual.especialidade;
      }

      const atualizado = await UsuarioModel.atualizarPerfil(usuarioId, {
        nome,
        email,
        telefone,
        crm,
        especialidade
      });

      if (!atualizado) {
        return res.status(400).json({ error: 'Não foi possível atualizar os dados do perfil.' });
      }

      const usuarioAtualizado = await UsuarioModel.buscarPorId(usuarioId);

      return res.status(200).json({
        message: 'Perfil atualizado com sucesso.',
        usuario: {
          ...usuarioAtualizado,
          perfil_descricao:
            usuarioAtualizado?.tipo_usuario === 'PROFISSIONAL'
              ? 'Profissional de Saúde'
              : 'Paciente'
        }
      });
    } catch (error) {
      console.error('Erro ao editar perfil do usuário:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar perfil.' });
    }
  }

  // Configurações (RN03, RN09 | CA02, CA09, CA10): Alteração de senha
  static async alterarSenha(req: Request, res: Response): Promise<Response> {
    try {
      const usuarioId = (req as any).usuarioId;
      const { senha_atual, nova_senha } = req.body;

      if (typeof senha_atual !== 'string' || typeof nova_senha !== 'string' || !senha_atual || !nova_senha) {
        return res
          .status(400)
          .json({ error: 'A senha atual e a nova senha são obrigatórias.' });
      }

      // Mesma regra de segurança de senha definida no cadastro (authController.ts)
      if (nova_senha.length < 8 || !/[A-Za-zÀ-ÿ]/.test(nova_senha) || !/\d/.test(nova_senha)) {
        return res.status(400).json({
          error: 'A nova senha deve ter no mínimo 8 caracteres, contendo letras e números.'
        });
      }

      if (senha_atual === nova_senha) {
        return res
          .status(400)
          .json({ error: 'A nova senha deve ser diferente da senha atual.' });
      }

      const credenciais = await UsuarioModel.buscarCredenciaisPorId(usuarioId);
      if (!credenciais) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      const senhaAtualCorreta = await bcrypt.compare(senha_atual, credenciais.senha);
      if (!senhaAtualCorreta) {
        return res.status(401).json({ error: 'A senha atual informada está incorreta.' });
      }

      const novaSenhaHash = await bcrypt.hash(nova_senha, 10);
      await UsuarioModel.atualizarSenha(usuarioId, novaSenhaHash);

      return res.status(200).json({
        message: 'Senha alterada com sucesso.'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return res.status(500).json({ error: 'Erro interno ao alterar a senha.' });
    }
  }
}