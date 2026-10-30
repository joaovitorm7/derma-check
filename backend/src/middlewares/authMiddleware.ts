import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: number;
  tipo_usuario: string;
  iat: number;
  exp: number;
}

// 1. Exportação nomeada (permite: import { authMiddleware } from '...')
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  const token = authorization.replace('Bearer', '').trim();

  try {
    const secret = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';
    const data = jwt.verify(token, secret) as TokenPayload;

    // Injeta o ID do usuário logado na requisição
    (req as any).usuarioId = data.id;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

// 2. Exportação padrão (permite: import authMiddleware from '...')
export default authMiddleware;