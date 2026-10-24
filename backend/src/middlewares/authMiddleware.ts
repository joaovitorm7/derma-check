import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ITokenPayload } from '../types/usuario';

// Extender o tipo do Express para incluir o id do usuário logado na requisição
declare global {
  namespace Express {
    interface Request {
      usuarioLogado?: ITokenPayload;
    }
  }
}

export const autenticarToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'chave_secreta_padrao';
    const decoded = jwt.verify(token, secret) as ITokenPayload;

    req.usuarioLogado = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({ mensagem: 'Token inválido ou expirado.' });
  }
};