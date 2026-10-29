import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { IUsuarioCadastro } from '../types/usuario';

// 1. CADASTRO DE USUÁRIO
export const cadastrarUsuario = async (req: Request, res: Response): Promise<Response> => {
  console.log('📥 Requisição recebida em /cadastrar:', req.body);

  try {
    const dados: IUsuarioCadastro = {
      ...req.body,
      tipo_usuario: req.body.tipo_usuario === 'PACIENTE' ? 'CLIENTE' : req.body.tipo_usuario,
      nome: typeof req.body.nome === 'string' ? req.body.nome.trim() : req.body.nome,
      email: typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email,
    };
    const { nome, email, senha, tipo_usuario, crm, especialidade, telefone } = dados;

    // Validação 1: Campos obrigatórios presentes
    if (
      typeof nome !== 'string' ||
      typeof email !== 'string' ||
      typeof senha !== 'string' ||
      !tipo_usuario
    ) {
      console.warn(' Falha de validação: Campos obrigatórios ausentes ou com tipos inválidos.');
      return res.status(400).json({ mensagem: 'Nome, e-mail, senha e tipo_usuario são obrigatórios.' });
    }

    // Validação 2: Nome e E-mail
    if (nome.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn(' Falha de validação: Nome muito curto (mínimo 3 letras) ou formato de e-mail inválido.');
      return res.status(400).json({ mensagem: 'Informe um nome e e-mail válidos.' });
    }

    // Validação 3: Regras da Senha (mínimo 8 caracteres, com letras e números)
    if (senha.length < 8 || !/[A-Za-zÀ-ÿ]/.test(senha) || !/\d/.test(senha)) {
      console.warn('Falha de validação: A senha não cumpre o requisito (mínimo 8 caracteres, letras e números).');
      return res.status(400).json({ mensagem: 'A senha deve ter 8 caracteres, com letras e números.' });
    }

    // Validação 4: Tipo de usuário
    if (tipo_usuario !== 'CLIENTE' && tipo_usuario !== 'PROFISSIONAL') {
      console.warn(` Falha de validação: tipo_usuario '${tipo_usuario}' inválido.`);
      return res.status(400).json({ mensagem: 'Tipo de usuário inválido. Escolha CLIENTE ou PROFISSIONAL.' });
    }

    // Validação 5: CRM para profissionais
    if (tipo_usuario === 'PROFISSIONAL' && !crm) {
      console.warn(' Falha de validação: CRM é obrigatório para cadastros profissionais.');
      return res.status(400).json({ mensagem: 'CRM é obrigatório para cadastros profissionais.' });
    }

    // Validação 6: Duplicidade de E-mail
    console.log(' Checando se e-mail já existe no banco...');
    const [usuariosExistentes] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuariosExistentes.length > 0) {
      console.warn(` Conflito: E-mail '${email}' já cadastrado.`);
      return res.status(409).json({ mensagem: 'E-mail já cadastrado.' });
    }

    // Criptografia e Inserção
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

    console.log(' Gravando usuário no MySQL...');
    const [result] = await pool.query<ResultSetHeader>(query, values);
    console.log(' USUÁRIO CRIADO COM SUCESSO! ID:', result.insertId);

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
    console.error(' ERRO CRÍTICO NO BANCO/CADASTRO:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao realizar cadastro.' });
  }
};

// 2. LOGIN DE USUÁRIO
export const loginUsuario = async (req: Request, res: Response): Promise<Response> => {
  console.log(' Requisição recebida em /login:', req.body?.email);

  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email;
    const senha = req.body.senha;

    if (typeof email !== 'string' || typeof senha !== 'string' || !email || !senha) {
      return res.status(400).json({ mensagem: 'E-mail e senha são obrigatórios.' });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, nome, email, senha, tipo_usuario, ativo FROM usuarios WHERE email = ?',
      [email]
    );

    if (rows.length === 0 || !rows[0]) {
      console.warn(` Falha de login: Usuário '${email}' não encontrado.`);
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    }

    const usuario = rows[0];

    if (!usuario.ativo) {
      console.warn(` Falha de login: Conta do usuário '${email}' está inativa.`);
      return res.status(403).json({ mensagem: 'Conta desativada. Entre em contato com o suporte.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      console.warn(` Falha de login: Senha incorreta para o usuário '${email}'.`);
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error(' ERRO CRÍTICO: JWT_SECRET não definido no .env');
      throw new Error('JWT_SECRET não configurado.');
    }

    const token = jwt.sign(
      { id: usuario.id, tipo_usuario: usuario.tipo_usuario },
      secret,
      { expiresIn: '8h' }
    );

    console.log(` LOGIN REALIZADO COM SUCESSO: Usuario ID ${usuario.id}`);

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
    console.error(' ERRO CRÍTICO NO LOGIN:', error);
    return res.status(500).json({ mensagem: 'Erro interno ao realizar login.' });
  }
};