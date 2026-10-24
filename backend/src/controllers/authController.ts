import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { IUsuarioCadastro, IUsuarioLogin } from '../types/usuario';

// 1. CADASTRO DE USUÁRIO
export const cadastrarUsuario = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { nome, email, senha, tipo_usuario, crm, especialidade, telefone }: IUsuarioCadastro = req.body;

    if (!nome || !email || !senha || !tipo_usuario) {
      return res.status(400).json({ mensagem: 'Nome, e-mail, senha e tipo_usuario são obrigatórios.' });
    }

    if (tipo_usuario !== 'CLIENTE' && tipo_usuario !== 'PROFISSIONAL') {
      return res.status(400).json({ mensagem: 'Tipo de usuário inválido. Escolha CLIENTE ou PROFISSIONAL.' });
    }

    if (tipo_usuario === 'PROFISSIONAL' && !crm) {
      return res.status(400).json({ mensagem: 'CRM é obrigatório para cadastros profissionais.' });
    }

    const [usuariosExistentes] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuariosExistentes.length > 0) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const query = `
      INSERT INTO usuarios (nome, email, senha, tipo_usuario, crm, especialidade, telefone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nome,
      email,
      senhaHash,
      tipo_usuario,
      tipo_usuario === 'PROFISSIONAL' ? crm : null,
      tipo_usuario === 'PROFISSIONAL' ? especialidade : null,
      telefone ?? null
    ];

    const [result] = await pool.query<ResultSetHeader>(query, values);

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      usuario: {
        id: result.insertId,
        nome,
        email,
        tipo_usuario
      }
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao realizar cadastro.' });
  }
};

// 2. LOGIN DE USUÁRIO
export const loginUsuario = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, senha }: IUsuarioLogin = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
    }

    // Buscar usuário pelo e-mail
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nome, email, senha, tipo_usuario, ativo FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0 || !rows[0]) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    }

    const usuario = rows[0];

    if (!usuario.ativo) {
      return res.status(403).json({ mensagem: 'Conta desativada. Entre em contato com o suporte.' });
    }

    // Comparar a senha informada com o Hash salvo no banco
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    }

    // Gerar o Token JWT com expiração de 8 horas
    const secret = process.env.JWT_SECRET || 'chave_secreta_padrao';
    const token = jwt.sign(
      { id: usuario.id, tipo_usuario: usuario.tipo_usuario },
      secret,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao realizar login.' });
  }
};